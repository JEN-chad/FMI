import { Offer, OfferStatus } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateOfferDTO, UpdateOfferStatusDTO } from "@/lib/dto/offer.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class OfferRepository extends BaseRepository<
  Offer,
  Omit<CreateOfferDTO, "listingId"> & { listingId: string; buyerId: string; sellerId: string },
  UpdateOfferStatusDTO & { counterAmount?: number | null; counterMessage?: string | null }
> {
  constructor() {
    super(prisma, "offer");
  }

  /**
   * Finds all active (pending or countered) offers for a listing
   */
  async findActiveOffersForListing(listingId: string, tx?: PrismaTx): Promise<Offer[]> {
    return this.findMany(
      {
        where: {
          listingId,
          status: { in: [OfferStatus.PENDING, OfferStatus.COUNTERED] },
        },
        orderBy: { createdAt: "desc" },
      },
      tx
    );
  }

  /**
   * Retrieves offers made by a specific buyer
   */
  async findByBuyerId(buyerId: string, tx?: PrismaTx): Promise<Offer[]> {
    return this.getModel(tx).findMany({
      where: { buyerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            askingPrice: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves offers received by a specific seller
   */
  async findBySellerId(sellerId: string, tx?: PrismaTx): Promise<Offer[]> {
    return this.getModel(tx).findMany({
      where: { sellerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            askingPrice: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            kycStatus: true,
          },
        },
      },
    });
  }
}

export const offerRepository = new OfferRepository();
