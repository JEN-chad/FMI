import { z } from "zod";
import { OfferStatus } from "@prisma/client";

export const CreateOfferSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID format"),
  amount: z.coerce.number().positive("Offer amount must be greater than 0"),
  upfrontPercent: z.coerce.number().min(0).max(100).default(100),
  earnoutPercent: z.coerce.number().min(0).max(100).default(0),
  earnoutTerms: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
}).refine(
  (data) => Math.abs(data.upfrontPercent + data.earnoutPercent - 100) < 0.01,
  {
    message: "Upfront percentage and Earnout percentage must sum to 100%",
    path: ["upfrontPercent"],
  }
);

export const CounterOfferSchema = z.object({
  amount: z.coerce.number().positive("Counter-offer amount must be greater than 0"),
  message: z.string().optional().nullable(),
});

export const UpdateOfferStatusSchema = z.object({
  status: z.nativeEnum(OfferStatus),
});

export type CreateOfferDTO = z.infer<typeof CreateOfferSchema>;
export type CounterOfferDTO = z.infer<typeof CounterOfferSchema>;
export type UpdateOfferStatusDTO = z.infer<typeof UpdateOfferStatusSchema>;
