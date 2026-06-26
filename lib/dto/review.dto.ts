import { z } from "zod";
import { ReviewRole } from "@prisma/client";

export const CreateReviewSchema = z.object({
  dealId: z.string().uuid("Invalid deal ID"),
  revieweeId: z.string().uuid("Invalid reviewee user ID"),
  role: z.nativeEnum(ReviewRole),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional().nullable(),
});

export type CreateReviewDTO = z.infer<typeof CreateReviewSchema>;
