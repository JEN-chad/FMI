"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { messageService } from "@/lib/services/message.service";
import { pusherServer, PUSHER_EVENTS, getDealChannel } from "@/lib/pusher";
import { AppError } from "@/lib/errors/app-error";
import { z } from "zod";
import type { ActionResult } from "./listings";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

const SendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000),
  documentUrl: z.string().url().optional().nullable(),
  type: z.enum(["TEXT", "DOCUMENT"]).default("TEXT"),
});

export async function sendMessageAction(
  dealId: string,
  input: z.infer<typeof SendMessageSchema>
): Promise<ActionResult<{ id: string; createdAt: Date }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = SendMessageSchema.parse(input);

    const message = await messageService.sendMessage(user.id, dealId, {
      content: validated.content,
      type: validated.type as "TEXT" | "SYSTEM" | "DOCUMENT",
      documentUrl: validated.documentUrl ?? undefined,
    });

    // Push to Pusher channel for realtime delivery
    await pusherServer.trigger(getDealChannel(dealId), PUSHER_EVENTS.NEW_MESSAGE, {
      id: message.id,
      content: message.content,
      type: message.type,
      documentUrl: message.documentUrl,
      senderId: message.senderId,
      createdAt: message.createdAt,
      sender: {
        id: user.id,
        name: (user as { name?: string }).name ?? "User",
        avatarUrl: (user as { avatarUrl?: string | null }).avatarUrl ?? null,
      },
    });

    return { success: true, data: { id: message.id, createdAt: message.createdAt } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    return { success: false, error: "Failed to send message" };
  }
}

export async function markMessagesReadAction(dealId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await messageService.markAsRead(user.id, dealId);
    revalidatePath(`/buyer/deals/${dealId}`);
    revalidatePath(`/seller/deals/${dealId}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to mark messages as read" };
  }
}
