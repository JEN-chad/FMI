import { Review } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateReviewDTO } from "@/lib/dto/review.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class ReviewRepository extends BaseRepository<
  Review,
  CreateReviewDTO & { reviewerId: string },
  Partial<CreateReviewDTO>
> {
  constructor() {
    super(prisma, "review");
  }

  /**
   * Retrieves all reviews written about a specific user
   */
  async findByRevieweeId(revieweeId: string, tx?: PrismaTx): Promise<Review[]> {
    return this.getModel(tx).findMany({
      where: { revieweeId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  /**
   * Calculates the average rating of a user directly in the database
   */
  async calculateAverageRating(revieweeId: string, tx?: PrismaTx): Promise<number> {
    const aggregation = await this.getModel(tx).aggregate({
      where: {
        revieweeId,
        deletedAt: null,
      },
      _avg: {
        rating: true,
      },
    });
    
    return aggregation._avg.rating || 0;
  }
}

export const reviewRepository = new ReviewRepository();
