import { Deal, DealStage, EscrowStatus, DealDocument, DealChecklistItem, ListingStatus, Role } from "@prisma/client";
import { dealRepository, DealRepository } from "@/lib/repositories/deal.repository";
import { listingRepository, ListingRepository } from "@/lib/repositories/listing.repository";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import {
  CreateDealDocumentDTO,
  UpdateChecklistItemDTO,
  CreateDealDocumentSchema,
  UpdateChecklistItemSchema,
} from "@/lib/dto/deal.dto";
import { NotFoundError, ForbiddenError } from "@/lib/errors/app-error";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class DealService {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Retrieves full details of a deal, checking user permissions
   */
  async getDealDetails(userId: string, dealId: string, tx?: PrismaTx) {
    const deal = await this.dealRepo.findWithDetails(dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal not found");
    }

    const user = await this.userRepo.findById(userId, tx);
    const isParty = deal.buyerId === userId || deal.sellerId === userId || user?.role === Role.ADMIN;

    if (!isParty) {
      throw new ForbiddenError("You do not have access to this Deal Room");
    }

    // Filter documents based on visibility permissions
    const visibleDocs = deal.documents.filter((doc) => {
      if (user?.role === Role.ADMIN) return true;
      if (doc.visibility === "BOTH") return true;
      if (doc.visibility === "BUYER_ONLY" && deal.buyerId === userId) return true;
      if (doc.visibility === "SELLER_ONLY" && deal.sellerId === userId) return true;
      return false;
    });

    return {
      ...deal,
      documents: visibleDocs,
    };
  }

  /**
   * Advances a checklist item's completion status
   */
  async updateChecklistItem(
    userId: string,
    dealId: string,
    itemId: string,
    dto: UpdateChecklistItemDTO,
    tx?: PrismaTx
  ): Promise<DealChecklistItem> {
    const validated = UpdateChecklistItemSchema.parse(dto);

    const deal = await this.dealRepo.findById(dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal not found");
    }

    // Verify user is a party or admin
    const user = await this.userRepo.findById(userId, tx);
    const isParty = deal.buyerId === userId || deal.sellerId === userId || user?.role === Role.ADMIN;
    if (!isParty) {
      throw new ForbiddenError("Not authorized to update checklist");
    }

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.isCompleted !== undefined) {
      updateData.completedBy = validated.isCompleted ? userId : null;
      updateData.completedAt = validated.isCompleted ? new Date() : null;
    }

    return this.dealRepo.updateChecklistItem(itemId, updateData, tx);
  }

  /**
   * Uploads a document to the Deal Room
   */
  async uploadDealDocument(
    userId: string,
    dealId: string,
    dto: CreateDealDocumentDTO,
    tx?: PrismaTx
  ): Promise<DealDocument> {
    const validated = CreateDealDocumentSchema.parse(dto);

    const deal = await this.dealRepo.findById(dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal not found");
    }

    const user = await this.userRepo.findById(userId, tx);
    const isParty = deal.buyerId === userId || deal.sellerId === userId || user?.role === Role.ADMIN;
    if (!isParty) {
      throw new ForbiddenError("Not authorized to upload files to this Deal Room");
    }

    return this.dealRepo.addDealDocument(dealId, userId, validated, tx);
  }

  /**
   * Digitally signs the asset purchase agreement
   */
  async signAgreement(userId: string, dealId: string): Promise<Deal> {
    const deal = await this.dealRepo.findById(dealId);
    if (!deal) {
      throw new NotFoundError("Deal not found");
    }

    if (deal.buyerId !== userId && deal.sellerId !== userId) {
      throw new ForbiddenError("You are not a party to this deal");
    }

    const isBuyer = deal.buyerId === userId;

    return prisma.$transaction(async (tx) => {
      const updatePayload: Record<string, unknown> = {};
      if (isBuyer) {
        updatePayload.buyerSigned = true;
      } else {
        updatePayload.sellerSigned = true;
      }

      // Re-read current state to check if both are now signed
      const currentDeal = await this.dealRepo.findById(dealId, tx);
      const willBeFullySigned =
        (isBuyer && currentDeal!.sellerSigned) || (!isBuyer && currentDeal!.buyerSigned);

      if (willBeFullySigned) {
        updatePayload.signedAt = new Date();
        updatePayload.stage = DealStage.ESCROW; // Advance to Escrow
      }

      return this.dealRepo.update(dealId, updatePayload, tx);
    });
  }

  /**
   * Admin: Updates escrow funding status
   */
  async updateEscrowStatus(
    adminId: string,
    dealId: string,
    status: EscrowStatus,
    reference?: string
  ): Promise<Deal> {
    const admin = await this.userRepo.findById(adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenError("Only admins can manage escrow status updates");
    }

    const deal = await this.dealRepo.findById(dealId);
    if (!deal) {
      throw new NotFoundError("Deal not found");
    }

    return prisma.$transaction(async (tx) => {
      const updatePayload: Record<string, unknown> = {
        escrowStatus: status,
        escrowReference: reference || null,
      };

      if (status === EscrowStatus.FUNDED) {
        updatePayload.stage = DealStage.TRANSFER; // Advance to handover stage
      } else if (status === EscrowStatus.RELEASED) {
        updatePayload.stage = DealStage.CLOSED; // Mark deal complete
        updatePayload.closedAt = new Date();

        // Atomically mark listing as SOLD
        await this.listingRepo.update(deal.listingId, { status: ListingStatus.SOLD }, tx);
      }

      return this.dealRepo.update(dealId, updatePayload, tx);
    });
  }
}

export const dealService = new DealService(
  dealRepository,
  listingRepository,
  userRepository
);
