"use client";

import { useEffect, useCallback } from "react";
import Pusher from "pusher-js";
import { useNotificationStore, AppNotification } from "@/store/notification-store";
import { markNotificationReadAction, markAllNotificationsReadAction, getNotificationsAction } from "@/actions/notifications";
import { getUserChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { toast } from "sonner";

export function useNotifications(userId: string) {
  const { notifications, unreadCount, isOpen, setNotifications, addNotification, markRead, markAllRead, setIsOpen } =
    useNotificationStore();

  // Load initial notifications
  useEffect(() => {
    if (!userId) return;
    getNotificationsAction().then((result) => {
      if (result.success && result.data) {
        const items = result.data.data as unknown as AppNotification[];
        setNotifications(items);
      }
    });
  }, [userId, setNotifications]);

  // Subscribe to Pusher for real-time notifications
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster || !userId) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster, forceTLS: true });
    const channelName = getUserChannel(userId);
    const channel = pusher.subscribe(channelName);

    channel.bind(PUSHER_EVENTS.NOTIFICATION, (data: AppNotification) => {
      addNotification(data);
      toast.info(data.title, { description: data.body ?? undefined });
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [userId, addNotification]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      markRead(id); // Optimistic
      const result = await markNotificationReadAction(id);
      if (!result.success) {
        // no rollback needed for mark-read failures
      }
    },
    [markRead]
  );

  const handleMarkAllRead = useCallback(async () => {
    markAllRead(); // Optimistic
    await markAllNotificationsReadAction();
  }, [markAllRead]);

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
  };
}
