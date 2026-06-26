import { Offer, OfferStatus, Deal, ListingStatus, KycStatus, NdaStatus, ChecklistItemAssignee, Prisma } from "@prisma/client";
import { offerRepository, OfferRepository } from "@/lib/repositories/offer.repository";
import { listingRepository, ListingRepository } from "@/lib/repositories/listing.repository";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import { dealRepository, DealRepository } from "@/lib/repositories/deal.repository";
import { CreateOfferDTO, CounterOfferDTO, CreateOfferSchema, CounterOfferSchema } from "@/lib/dto/offer.dto";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors/app-error";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class OfferService {
  constructor(
    private readonly offerRepo: OfferRepository,
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly dealRepo: DealRepository
  ) {}

  /**
   * Submits an initial offer on a listing
   */
  async submitOffer(buyerId: string, dto: CreateOfferDTO): Promise<Offer> {
    const validated = CreateOfferSchema.parse(dto);

    // Verify buyer KYC status
    const buyer = await this.userRepo.findById(buyerId);
    if (!buyer || buyer.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenError("Your KYC must be approved before you can submit offers");
    }

    // Verify listing is active
    const listing = await this.listingRepo.findById(validated.listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }
    if (listing.status !== ListingStatus.LIVE) {
      throw new ValidationError("Offers can only be made on live listings");
    }

    // Prevent offering on own listing
    if (listing.sellerId === buyerId) {
      throw new ForbiddenError("You cannot make an offer on your own listing");
    }

    // Verify NDA is signed
    if (listing.ndaRequired) {
      const nda = await prisma.ndaAgreement.findFirst({
        where: {
          listingId: listing.id,
          buyerId,
          status: NdaStatus.SIGNED,
          deletedAt: null,
        },
      });
      if (!nda) {
        throw new ForbiddenError("You must sign the NDA for this listing before making an offer");
      }
    }

    // Create the offer
    return this.offerRepo.create({
      listingId: validated.listingId,
      buyerId,
      sellerId: listing.sellerId,
      amount: validated.amount,
      upfrontPercent: validated.upfrontPercent,
      earnoutPercent: validated.earnoutPercent,
      earnoutTerms: validated.earnoutTerms,
      message: validated.message,
      expiresAt: validated.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      status: OfferStatus.PENDING,
    });
  }

  /**
   * Counters an existing offer
   */
  async counterOffer(userId: string, offerId: string, dto: CounterOfferDTO): Promise<Offer> {
    const validated = CounterOfferSchema.parse(dto);

    const offer = await this.offerRepo.findById(offerId);
    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    if (offer.status !== OfferStatus.PENDING && offer.status !== OfferStatus.COUNTERED) {
      throw new ValidationError(`Cannot counter an offer that is in status: ${offer.status}`);
    }

    // Verify that the user is either the buyer or the seller
    if (offer.buyerId !== userId && offer.sellerId !== userId) {
      throw new ForbiddenError("You are not a party to this offer");
    }

    return this.offerRepo.update(offerId, {
      status: OfferStatus.COUNTERED,
      counterAmount: new Prisma.Decimal(validated.amount),
      counterMessage: validated.message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Refresh expiry
    });
  }

  /**
   * Accepts an offer and initializes the Deal Room workspace
   */
  async acceptOffer(userId: string, offerId: string): Promise<Deal> {
    const offer = await this.offerRepo.findById(offerId);
    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    if (offer.status !== OfferStatus.PENDING && offer.status !== OfferStatus.COUNTERED) {
      throw new ValidationError(`Cannot accept an offer that is in status: ${offer.status}`);
    }

    // Determine who is accepting:
    // If PENDING: seller accepts.
    // If COUNTERED: buyer accepts (since seller countered it).
    const isSellerAccepting = offer.status === OfferStatus.PENDING && offer.sellerId === userId;
    const isBuyerAccepting = offer.status === OfferStatus.COUNTERED && offer.buyerId === userId;

    if (!isSellerAccepting && !isBuyerAccepting) {
      throw new ForbiddenError("You are not authorized to accept this offer or it is not your turn to act");
    }

    const finalDealValue = Number(offer.status === OfferStatus.COUNTERED ? offer.counterAmount! : offer.amount);

    // Run transaction
    return prisma.$transaction(async (tx) => {
      // 1. Accept the offer
      await this.offerRepo.update(offerId, { status: OfferStatus.ACCEPTED }, tx);

      // 2. Reject all other active offers for this listing
      await tx.offer.updateMany({
        where: {
          listingId: offer.listingId,
          id: { not: offerId },
          status: { in: [OfferStatus.PENDING, OfferStatus.COUNTERED] },
        },
        data: {
          status: OfferStatus.REJECTED,
        },
      });

      // 3. Pause the listing
      await this.listingRepo.update(offer.listingId, { status: ListingStatus.PAUSED }, tx);

      // 4. Create the Deal
      const deal = await this.dealRepo.create(
        {
          listingId: offer.listingId,
          offerId: offer.id,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          dealValue: finalDealValue,
        },
        tx
      );

      // 5. Create default Deal Checklist Items (standard transaction flow)
      const checklistItems = [
        {
          title: "Verify Proof of Funds",
          description: "Buyer must upload Proof of Funds (POF) for admin verification",
          assignedTo: ChecklistItemAssignee.BUYER,
          sortOrder: 1,
        },
        {
          title: "Initiate Escrow Setup",
          description: "Set up the Razorpay/Escrow payment process for the upfront value",
          assignedTo: ChecklistItemAssignee.PLATFORM,
          sortOrder: 2,
        },
        {
          title: "Submit Due Diligence Documents",
          description: "Seller must upload verified profit/loss statements and traffic stats",
          assignedTo: ChecklistItemAssignee.SELLER,
          sortOrder: 3,
        },
        {
          title: "Sign Asset Purchase Agreement",
          description: "Both parties must review and digitally sign the e-agreement",
          assignedTo: ChecklistItemAssignee.BUYER, // Assigned to both technically, we'll start with buyer
          sortOrder: 4,
        },
        {
          title: "Confirm Asset Handover",
          description: "Seller transfers ownership of assets (code, domains, accounts); buyer verifies receipt",
          assignedTo: ChecklistItemAssignee.SELLER,
          sortOrder: 5,
        },
      ];

      for (const item of checklistItems) {
        await this.dealRepo.createChecklistItem(deal.id, item, tx);
      }

      return deal;
    });
  }

  /**
   * Rejects an offer
   */
  async rejectOffer(userId: string, offerId: string, tx?: PrismaTx): Promise<Offer> {
    const offer = await this.offerRepo.findById(offerId, tx);
    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    // Only the recipient can reject
    const isSellerRejecting = offer.status === OfferStatus.PENDING && offer.sellerId === userId;
    const isBuyerRejecting = offer.status === OfferStatus.COUNTERED && offer.buyerId === userId;

    if (!isSellerRejecting && !isBuyerRejecting) {
      throw new ForbiddenError("You are not authorized to reject this offer");
    }

    return this.offerRepo.update(offerId, { status: OfferStatus.REJECTED }, tx);
  }

  async withdrawOffer(buyerId: string, offerId: string, tx?: PrismaTx): Promise<Offer> {
    const offer = await this.offerRepo.findById(offerId, tx);
    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    if (offer.buyerId !== buyerId) {
      throw new ForbiddenError("Only the buyer who submitted the offer can withdraw it");
    }

    if (offer.status !== OfferStatus.PENDING && offer.status !== OfferStatus.COUNTERED) {
      throw new ValidationError("Cannot withdraw an offer that is already resolved");
    }

    return this.offerRepo.update(offerId, { status: OfferStatus.WITHDRAWN }, tx);
  }
}

// In rejectOffer, there was a tiny bug: we used `tx` instead of passing it optionally, or using global. 
// Let's refine the rejectOffer signature and export.
export const offerService = new OfferService(
  offerRepository,
  listingRepository,
  userRepository,
  dealRepository
);
