import { Review, ReviewRole, DealStage } from "@prisma/client";
import { reviewRepository, ReviewRepository } from "@/lib/repositories/review.repository";
import { dealRepository, DealRepository } from "@/lib/repositories/deal.repository";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import { CreateReviewDTO, CreateReviewSchema } from "@/lib/dto/review.dto";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors/app-error";
import { PrismaTx } from "@/lib/db/prisma";

export class ReviewService {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly dealRepo: DealRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Submits a new review for a completed deal
   */
  async submitReview(reviewerId: string, dto: CreateReviewDTO, tx?: PrismaTx): Promise<Review> {
    const validated = CreateReviewSchema.parse(dto);

    // Verify deal exists
    const deal = await this.dealRepo.findById(validated.dealId, tx);
    if (!deal) {
      throw new NotFoundError("Deal record not found");
    }

    // Verify deal is closed
    if (deal.stage !== DealStage.CLOSED) {
      throw new ValidationError("Reviews can only be submitted for completed deals");
    }

    // Verify reviewer belongs to deal
    const isBuyerReviewer = deal.buyerId === reviewerId;
    const isSellerReviewer = deal.sellerId === reviewerId;

    if (!isBuyerReviewer && !isSellerReviewer) {
      throw new ForbiddenError("You are not a party to this deal");
    }

    // Verify reviewer matches role specified in review
    if (validated.role === ReviewRole.BUYER && !isBuyerReviewer) {
      throw new ValidationError("Reviewer role mismatch: You are the seller in this deal");
    }
    if (validated.role === ReviewRole.SELLER && !isSellerReviewer) {
      throw new ValidationError("Reviewer role mismatch: You are the buyer in this deal");
    }

    // Verify reviewee is the correct opposite party
    const expectedRevieweeId = isBuyerReviewer ? deal.sellerId : deal.buyerId;
    if (validated.revieweeId !== expectedRevieweeId) {
      throw new ValidationError("Reviewee must be the opposite party of the transaction");
    }

    // Check if reviewer has already reviewed this deal
    const existing = await this.reviewRepo.findFirst(
      {
        dealId: validated.dealId,
        reviewerId,
      },
      tx
    );
    if (existing) {
      throw new ValidationError("You have already submitted a review for this deal");
    }

    return this.reviewRepo.create(
      {
        dealId: validated.dealId,
        reviewerId,
        revieweeId: validated.revieweeId,
        role: validated.role,
        rating: validated.rating,
        comment: validated.comment,
      },
      tx
    );
  }

  /**
   * Retrieves all reviews written about a user
   */
  async getUserReviews(userId: string, tx?: PrismaTx): Promise<Review[]> {
    return this.reviewRepo.findByRevieweeId(userId, tx);
  }

  /**
   * Computes user average rating score
   */
  async getUserRating(userId: string, tx?: PrismaTx): Promise<number> {
    return this.reviewRepo.calculateAverageRating(userId, tx);
  }
}

export const reviewService = new ReviewService(
  reviewRepository,
  dealRepository,
  userRepository
);
