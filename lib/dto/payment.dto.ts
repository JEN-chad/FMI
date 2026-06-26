import { z } from "zod";
import { PaymentPurpose, PaymentStatus } from "@prisma/client";

export const CreatePaymentSchema = z.object({
  listingId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
  purpose: z.nativeEnum(PaymentPurpose),
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
  currency: z.string().default("INR"),
});

export const VerifyPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid platform payment ID"),
  providerOrderId: z.string().min(1, "Razorpay Order ID is required"),
  providerPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  providerSignature: z.string().min(1, "Razorpay Signature is required"),
});

export const UpdatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

export type CreatePaymentDTO = z.infer<typeof CreatePaymentSchema>;
export type VerifyPaymentDTO = z.infer<typeof VerifyPaymentSchema>;
export type UpdatePaymentStatusDTO = z.infer<typeof UpdatePaymentStatusSchema>;
