import { Notification } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateNotificationDTO } from "@/lib/dto/notification.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";
import { getCursorParams, formatCursorResult, PaginatedResult } from "@/lib/utils/pagination";

export class NotificationRepository extends BaseRepository<
  Notification,
  CreateNotificationDTO,
  { isRead?: boolean; readAt?: Date | null }
> {
  constructor() {
    super(prisma, "notification");
  }

  /**
   * Retrieves notifications for a user with cursor pagination (newest first)
   */
  async findByUserId(
    userId: string,
    limit: number = 20,
    cursor?: string,
    tx?: PrismaTx
  ): Promise<PaginatedResult<Notification>> {
    const where = { userId, deletedAt: null };
    const { take, whereClause, orderBy } = getCursorParams(cursor, limit, "desc");

    const mergedWhere = whereClause ? { AND: [where, whereClause] } : where;

    const items = await this.getModel(tx).findMany({
      where: mergedWhere,
      take,
      orderBy,
    });

    return formatCursorResult(items, limit);
  }

  /**
   * Marks all unread notifications for a user as read
   */
  async markAllAsRead(userId: string, tx?: PrismaTx): Promise<number> {
    const result = await this.getModel(tx).updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }
}

export const notificationRepository = new NotificationRepository();
