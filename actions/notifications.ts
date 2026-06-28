"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { notificationService } from "@/lib/services/notification.service";
import { AppError } from "@/lib/errors/app-error";
import type { ActionResult } from "./listings";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await notificationService.markAsRead(user.id, notificationId);
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await notificationService.markAllAsRead(user.id);
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

export async function getNotificationsAction(): Promise<ActionResult<Awaited<ReturnType<typeof notificationService.getUserNotifications>>>> {
  try {
    const user = await getAuthenticatedUser();
    const notifications = await notificationService.getUserNotifications(user.id);
    return { success: true, data: notifications };
  } catch (err) {
    return { success: false, error: "Failed to load notifications" };
  }
}
