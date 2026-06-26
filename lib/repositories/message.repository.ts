import { Message } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateMessageDTO } from "@/lib/dto/message.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";
import { getCursorParams, formatCursorResult, PaginatedResult } from "@/lib/utils/pagination";

export class MessageRepository extends BaseRepository<
  Message,
  CreateMessageDTO & { dealId: string; senderId: string },
  Partial<CreateMessageDTO> & { isRead?: boolean }
> {
  constructor() {
    super(prisma, "message");
  }

  /**
   * Retrieves messages for a deal with cursor-based pagination
   */
  async findByDealId(
    dealId: string,
    limit: number = 20,
    cursor?: string,
    tx?: PrismaTx
  ): Promise<PaginatedResult<Message>> {
    const where = { dealId, deletedAt: null };

    // Fetch messages descending (newest first) for cursor calculations, then reverse them for display
    const { take, whereClause, orderBy } = getCursorParams(cursor, limit, "desc");

    const mergedWhere = whereClause ? { AND: [where, whereClause] } : where;

    const items = await this.getModel(tx).findMany({
      where: mergedWhere,
      take,
      orderBy,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    const result = formatCursorResult(items, limit);
    
    // Reverse the returned page of data so they are in chronological order (oldest first)
    result.data = [...result.data].reverse();
    return result;
  }

  /**
   * Marks all unread messages in a deal sent by other users as read
   */
  async markAsRead(dealId: string, receiverId: string, tx?: PrismaTx): Promise<number> {
    const result = await this.getModel(tx).updateMany({
      where: {
        dealId,
        senderId: { not: receiverId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return result.count;
  }
}

export const messageRepository = new MessageRepository();
