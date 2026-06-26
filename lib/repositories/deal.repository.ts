import { Deal, DealStage, EscrowStatus, DealDocument, DealChecklistItem, DealDocumentType, Visibility } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateDealDTO, UpdateChecklistItemDTO, CreateChecklistItemDTO } from "@/lib/dto/deal.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class DealRepository extends BaseRepository<
  Deal,
  CreateDealDTO,
  Partial<CreateDealDTO> & {
    stage?: DealStage;
    escrowStatus?: EscrowStatus;
    escrowReference?: string | null;
    buyerSigned?: boolean;
    sellerSigned?: boolean;
    signedAt?: Date | null;
    closedAt?: Date | null;
  }
> {
  constructor() {
    super(prisma, "deal");
  }

  /**
   * Retrieves all deals where the user is the buyer
   */
  async findByBuyerId(buyerId: string, tx?: PrismaTx): Promise<Deal[]> {
    return this.getModel(tx).findMany({
      where: { buyerId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, slug: true, coverImageUrl: true },
        },
        seller: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Retrieves all deals where the user is the seller
   */
  async findBySellerId(sellerId: string, tx?: PrismaTx): Promise<Deal[]> {
    return this.getModel(tx).findMany({
      where: { sellerId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, slug: true, coverImageUrl: true },
        },
        buyer: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Retrieves a deal with all its relational details (checklist, documents, messages, offer)
   */
  async findWithDetails(id: string, tx?: PrismaTx) {
    const client = tx || this.prisma;
    return client.deal.findFirst({
      where: { id, deletedAt: null },
      include: {
        listing: true,
        offer: true,
        buyer: {
          select: { id: true, name: true, email: true, phone: true, kycStatus: true },
        },
        seller: {
          select: { id: true, name: true, email: true, phone: true, kycStatus: true },
        },
        documents: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        checklistItems: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  // --- Checklist Methods ---

  async createChecklistItem(
    dealId: string,
    data: CreateChecklistItemDTO,
    tx?: PrismaTx
  ): Promise<DealChecklistItem> {
    const client = tx || this.prisma;
    return client.dealChecklistItem.create({
      data: {
        dealId,
        ...data,
      },
    });
  }

  async updateChecklistItem(
    itemId: string,
    data: UpdateChecklistItemDTO & { completedBy?: string | null; completedAt?: Date | null },
    tx?: PrismaTx
  ): Promise<DealChecklistItem> {
    const client = tx || this.prisma;
    return client.dealChecklistItem.update({
      where: { id: itemId },
      data,
    });
  }

  // --- Document Methods ---

  async addDealDocument(
    dealId: string,
    uploadedBy: string,
    data: { type: DealDocumentType; name: string; url: string; cloudinaryId?: string | null; visibility?: Visibility },
    tx?: PrismaTx
  ): Promise<DealDocument> {
    const client = tx || this.prisma;
    return client.dealDocument.create({
      data: {
        dealId,
        uploadedBy,
        ...data,
      },
    });
  }
}

export const dealRepository = new DealRepository();
