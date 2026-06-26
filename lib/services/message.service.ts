import { Message, Role } from "@prisma/client";
import { messageRepository, MessageRepository } from "@/lib/repositories/message.repository";
import { dealRepository, DealRepository } from "@/lib/repositories/deal.repository";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import { CreateMessageDTO, CreateMessageSchema } from "@/lib/dto/message.dto";
import { NotFoundError, ForbiddenError } from "@/lib/errors/app-error";
import { prisma, PrismaTx } from "@/lib/db/prisma";
import { PaginatedResult } from "@/lib/utils/pagination";

export class MessageService {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly dealRepo: DealRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Sends a message to a deal room
   */
  async sendMessage(
    senderId: string,
    dealId: string,
    dto: CreateMessageDTO,
    tx?: PrismaTx
  ): Promise<Message> {
    const validated = CreateMessageSchema.parse(dto);

    // Verify deal exists
    const deal = await this.dealRepo.findById(dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal room not found");
    }

    // Verify sender belongs to deal
    const user = await this.userRepo.findById(senderId, tx);
    const isParty = deal.buyerId === senderId || deal.sellerId === senderId || user?.role === Role.ADMIN;
    if (!isParty) {
      throw new ForbiddenError("Not authorized to participate in this deal room");
    }

    return this.messageRepo.create(
      {
        dealId,
        senderId,
        content: validated.content,
        type: validated.type,
        documentUrl: validated.documentUrl,
      },
      tx
    );
  }

  /**
   * Retrieves paginated messages for a deal room
   */
  async getMessages(
    userId: string,
    dealId: string,
    limit: number = 20,
    cursor?: string,
    tx?: PrismaTx
  ): Promise<PaginatedResult<Message>> {
    const deal = await this.dealRepo.findById(dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal room not found");
    }

    // Verify member permissions
    const user = await this.userRepo.findById(userId, tx);
    const isParty = deal.buyerId === userId || deal.sellerId === userId || user?.role === Role.ADMIN;
    if (!isParty) {
      throw new ForbiddenError("Access to this Deal Room chat is restricted");
    }

    return this.messageRepo.findByDealId(dealId, limit, cursor, tx);
  }

  /**
   * Marks unread messages in a deal as read
   */
  async markAsRead(userId: string, dealId: string, tx?: PrismaTx): Promise<number> {
    const deal = await this.dealRepo.findById(dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal room not found");
    }
    return this.messageRepo.markAsRead(dealId, userId, tx);
  }
}

export const messageService = new MessageService(
  messageRepository,
  dealRepository,
  userRepository
);
