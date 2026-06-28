"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { PUSHER_EVENTS, getDealChannel } from "@/lib/pusher";
import { sendMessageAction, markMessagesReadAction } from "@/actions/messages";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  content: string;
  type: "TEXT" | "SYSTEM" | "DOCUMENT";
  documentUrl: string | null;
  senderId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface UseMessagesOptions {
  dealId: string;
  currentUserId: string;
  initialMessages?: ChatMessage[];
}

export function useMessages({ dealId, currentUserId, initialMessages = [] }: UseMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Pusher connection
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn("[useMessages] Pusher credentials missing, realtime disabled");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true,
    });

    pusherRef.current = pusher;

    pusher.connection.bind("connected", () => setIsConnected(true));
    pusher.connection.bind("disconnected", () => setIsConnected(false));
    pusher.connection.bind("error", (err: unknown) => {
      console.error("[Pusher] Connection error", err);
      setIsConnected(false);
    });

    // Subscribe to deal channel (public for now, can be upgraded to private with auth endpoint)
    const channelName = getDealChannel(dealId);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: ChatMessage) => {
      // Avoid duplicating optimistic messages we sent
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.id);
        if (exists) return prev;
        return [...prev, { ...data, createdAt: new Date(data.createdAt) }];
      });
    });

    channel.bind(PUSHER_EVENTS.TYPING, (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
        if (data.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [dealId, currentUserId]);

  const sendMessage = useCallback(
    async (content: string, type: "TEXT" | "DOCUMENT" = "TEXT", documentUrl?: string) => {
      if (!content.trim() && !documentUrl) return;

      // Optimistic update
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        content,
        type,
        documentUrl: documentUrl ?? null,
        senderId: currentUserId,
        createdAt: new Date(),
        sender: { id: currentUserId, name: "You", avatarUrl: null },
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setIsSending(true);

      try {
        const result = await sendMessageAction(dealId, { content, type, documentUrl });
        if (!result.success) {
          // Rollback optimistic message on failure
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          toast.error(result.error);
        } else {
          // Replace optimistic with real ID
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticId ? { ...m, id: result.data.id, createdAt: result.data.createdAt } : m
            )
          );
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        toast.error("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    },
    [dealId, currentUserId]
  );

  const markRead = useCallback(async () => {
    await markMessagesReadAction(dealId).catch(() => {});
  }, [dealId]);

  return {
    messages,
    isTyping,
    isSending,
    isConnected,
    sendMessage,
    markRead,
  };
}
