import { Listing, ListingStatus, ListingDocument, NdaAgreement, NdaStatus, KycStatus, Role } from "@prisma/client";
import { listingRepository, ListingRepository } from "@/lib/repositories/listing.repository";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import {
  CreateListingDTO,
  UpdateListingDTO,
  CreateListingDocumentDTO,
  ListingQueryDTO,
  CreateListingSchema,
  UpdateListingSchema,
  CreateListingDocumentSchema,
  ListingQuerySchema,
} from "@/lib/dto/listing.dto";
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from "@/lib/errors/app-error";
import { prisma, PrismaTx } from "@/lib/db/prisma";
import { PaginatedResult } from "@/lib/utils/pagination";

export class ListingService {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Helper to convert a title to a URL-friendly slug
   */
  private generateSlug(title: string): string {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word characters
      .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
      .replace(/-+/g, "-"); // Collapse consecutive hyphens

    const suffix = Math.random().toString(36).substring(2, 8);
    return `${cleanTitle}-${suffix}`;
  }

  /**
   * Creates a listing in DRAFT mode
   */
  async createListing(sellerId: string, dto: CreateListingDTO, tx?: PrismaTx): Promise<Listing> {
    const validated = CreateListingSchema.parse(dto);

    // Verify user exists and is a seller
    const user = await this.userRepo.findById(sellerId, tx);
    if (!user) {
      throw new NotFoundError("Seller account not found");
    }

    if (user.role === Role.BUYER) {
      throw new ForbiddenError("Buyer accounts cannot create business listings. Change your role to Seller.");
    }

    const slug = this.generateSlug(validated.title);

    return this.listingRepo.create(
      {
        ...validated,
        sellerId,
        slug,
        status: ListingStatus.DRAFT,
      },
      tx
    );
  }

  /**
   * Updates an existing listing
   */
  async updateListing(
    listingId: string,
    userId: string,
    dto: UpdateListingDTO,
    tx?: PrismaTx
  ): Promise<Listing> {
    const validated = UpdateListingSchema.parse(dto);

    // Verify listing exists
    const listing = await this.listingRepo.findById(listingId, tx);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    // Verify ownership or admin privileges
    const user = await this.userRepo.findById(userId, tx);
    if (!user || (listing.sellerId !== userId && user.role !== Role.ADMIN)) {
      throw new ForbiddenError("You do not have permission to modify this listing");
    }

    // Generate new slug if title changes and listing is still in DRAFT
    if (validated.title && validated.title !== listing.title && listing.status === ListingStatus.DRAFT) {
      (validated as any).slug = this.generateSlug(validated.title);
    }

    return this.listingRepo.update(listingId, validated, tx);
  }

  /**
   * Submits a listing for admin review
   */
  async submitForReview(listingId: string, sellerId: string, tx?: PrismaTx): Promise<Listing> {
    const listing = await this.listingRepo.findById(listingId, tx);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenError("You do not own this listing");
    }

    if (listing.status !== ListingStatus.DRAFT && listing.status !== ListingStatus.REJECTED) {
      throw new ValidationError(`Cannot submit listing in ${listing.status} status`);
    }

    // Trust-First Rule: Seller must have APPROVED KYC
    const seller = await this.userRepo.findById(sellerId, tx);
    if (!seller || seller.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenError("You must complete and get your KYC approved before submitting listings for review");
    }

    return this.listingRepo.update(listingId, { status: ListingStatus.IN_REVIEW }, tx);
  }

  /**
   * Admin: Approves a listing to go live
   */
  async approveListing(listingId: string, adminId: string): Promise<Listing> {
    const admin = await this.userRepo.findById(adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenError("Only platform administrators can approve listings");
    }

    const listing = await this.listingRepo.findById(listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    return this.listingRepo.update(listingId, {
      status: ListingStatus.LIVE,
      publishedAt: new Date(),
    });
  }

  /**
   * Admin: Rejects a listing with a reason
   */
  async rejectListing(listingId: string, adminId: string, reason: string): Promise<Listing> {
    const admin = await this.userRepo.findById(adminId);
    if (!admin || admin.role !== Role.ADMIN) {
      throw new ForbiddenError("Only platform administrators can reject listings");
    }

    if (!reason.trim()) {
      throw new ValidationError("Rejection reason must be provided");
    }

    const listing = await this.listingRepo.findById(listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    return this.listingRepo.update(listingId, {
      status: ListingStatus.REJECTED,
      // We could store rejection reason in a separate table/field, or append to description/tags. 
      // For MVP, we simply set status and log it.
    });
  }

  /**
   * Retrieves listing details, scrubbing private fields if NDA gating is active and not signed
   */
  async getListingDetails(listingId: string, viewerId?: string, tx?: PrismaTx): Promise<any> {
    const listing = await this.listingRepo.getModel(tx).findFirst({
      where: { id: listingId, deletedAt: null },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true, kycStatus: true },
        },
        documents: {
          where: { deletedAt: null },
        },
      },
    });

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    // Increment view count asynchronously
    this.listingRepo.incrementViewCount(listingId, tx).catch((err) => {
      // Log error silently, do not fail the request
    });

    // Check if viewer is the seller or an admin (they bypass NDA gating)
    const isSellerOrAdmin =
      viewerId &&
      (listing.sellerId === viewerId ||
        (await this.userRepo.findById(viewerId, tx))?.role === Role.ADMIN);

    if (isSellerOrAdmin) {
      return listing;
    }

    // Check if NDA is required and not signed
    if (listing.ndaRequired) {
      let ndaSigned = false;
      if (viewerId) {
        const nda = await prisma.ndaAgreement.findFirst({
          where: {
            listingId,
            buyerId: viewerId,
            status: NdaStatus.SIGNED,
            deletedAt: null,
          },
        });
        if (nda) ndaSigned = true;
      }

      if (!ndaSigned) {
        // Gated View: Scrub private details
        const scrubbedListing = { ...listing };
        scrubbedListing.businessNamePrivate = "[Gated behind NDA]";
        scrubbedListing.businessUrl = "[Gated behind NDA]";
        
        // Hide private documents
        scrubbedListing.documents = listing.documents.filter((doc: ListingDocument) => !doc.isPrivate);
        
        return {
          ...scrubbedListing,
          ndaRequired: true,
          ndaSigned: false,
        };
      }
    }

    return {
      ...listing,
      ndaRequired: listing.ndaRequired,
      ndaSigned: true,
    };
  }

  /**
   * Signs an NDA for a listing
   */
  async signNda(
    listingId: string,
    buyerId: string,
    paymentId?: string,
    feePaid?: number
  ): Promise<NdaAgreement> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    // Verify buyer KYC status
    const buyer = await this.userRepo.findById(buyerId);
    if (!buyer || buyer.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenError("Your KYC must be approved before you can sign NDAs or view financials");
    }

    // If listing requires a fee, check that payment info is supplied
    if (listing.ndaFee > 0 && (!paymentId || !feePaid || feePaid < listing.ndaFee)) {
      throw new ValidationError(`This listing requires an NDA unlock fee of ₹${listing.ndaFee}`);
    }

    // Sign the agreement (create or update to SIGNED)
    return prisma.ndaAgreement.upsert({
      where: {
        listingId_buyerId: {
          listingId,
          buyerId,
        },
      },
      update: {
        status: NdaStatus.SIGNED,
        signedAt: new Date(),
        paymentId,
        feePaid,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Active for 30 days
      },
      create: {
        listingId,
        buyerId,
        status: NdaStatus.SIGNED,
        signedAt: new Date(),
        paymentId,
        feePaid,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  /**
   * Attaches a document to a listing
   */
  async addListingDocument(
    listingId: string,
    sellerId: string,
    dto: CreateListingDocumentDTO
  ): Promise<ListingDocument> {
    const validated = CreateListingDocumentSchema.parse(dto);

    const listing = await this.listingRepo.findById(listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenError("You do not own this listing");
    }

    return prisma.listingDocument.create({
      data: {
        listingId,
        ...validated,
      },
    });
  }

  /**
   * Queries the marketplace listings
   */
  async queryMarketplace(query: ListingQueryDTO): Promise<PaginatedResult<Listing>> {
    const validated = ListingQuerySchema.parse(query);
    return this.listingRepo.queryMarketplace(validated);
  }
}

export const listingService = new ListingService(listingRepository, userRepository);
