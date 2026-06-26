import { Notification } from "@prisma/client";
import { notificationRepository, NotificationRepository } from "@/lib/repositories/notification.repository";
import { CreateNotificationDTO, CreateNotificationSchema } from "@/lib/dto/notification.dto";
import { NotFoundError, ForbiddenError } from "@/lib/errors/app-error";
import { PrismaTx } from "@/lib/db/prisma";
import { PaginatedResult } from "@/lib/utils/pagination";

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  /**
   * Dispatches a new notification to a user
   */
  async createNotification(dto: CreateNotificationDTO, tx?: PrismaTx): Promise<Notification> {
    const validated = CreateNotificationSchema.parse(dto);
    return this.notificationRepo.create(validated, tx);
  }

  /**
   * Retrieves notifications for a user with cursor pagination
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    cursor?: string,
    tx?: PrismaTx
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationRepo.findByUserId(userId, limit, cursor, tx);
  }

  /**
   * Marks a single notification as read, validating ownership
   */
  async markAsRead(userId: string, notificationId: string, tx?: PrismaTx): Promise<Notification> {
    const notification = await this.notificationRepo.findById(notificationId, tx);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError("Not authorized to modify this notification");
    }

    return this.notificationRepo.update(
      notificationId,
      { isRead: true, readAt: new Date() },
      tx
    );
  }

  /**
   * Marks all notifications for a user as read
   */
  async markAllAsRead(userId: string, tx?: PrismaTx): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId, tx);
  }
}

export const notificationService = new NotificationService(notificationRepository);
