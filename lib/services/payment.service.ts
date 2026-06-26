import { Payment, PaymentStatus, PaymentPurpose, EscrowStatus } from "@prisma/client";
import { paymentRepository, PaymentRepository } from "@/lib/repositories/payment.repository";
import { listingService } from "@/lib/services/listing.service";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import { CreatePaymentDTO, VerifyPaymentDTO, CreatePaymentSchema, VerifyPaymentSchema } from "@/lib/dto/payment.dto";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors/app-error";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Generates a new payment order (mocking Razorpay integration in dev)
   */
  async createPaymentOrder(userId: string, dto: CreatePaymentDTO, tx?: PrismaTx): Promise<Payment> {
    const validated = CreatePaymentSchema.parse(dto);

    // Verify user exists
    const user = await this.userRepo.findById(userId, tx);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Mock Razorpay order ID generation
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;

    return this.paymentRepo.create(
      {
        userId,
        listingId: validated.listingId || null,
        dealId: validated.dealId || null,
        purpose: validated.purpose,
        amount: validated.amount,
        currency: validated.currency || "INR",
        provider: "razorpay",
        providerOrderId: mockOrderId,
        status: PaymentStatus.CREATED,
      },
      tx
    );
  }

  /**
   * Verifies Razorpay payment signature and activates the purchased services
   */
  async verifyPayment(userId: string, dto: VerifyPaymentDTO): Promise<Payment> {
    const validated = VerifyPaymentSchema.parse(dto);

    // Fetch local payment record
    const payment = await this.paymentRepo.findById(validated.paymentId);
    if (!payment) {
      throw new NotFoundError("Payment transaction record not found");
    }

    if (payment.userId !== userId) {
      throw new ForbiddenError("Not authorized to verify this payment");
    }

    if (payment.status === PaymentStatus.PAID) {
      return payment; // Already processed
    }

    // Simulate payment signature verification
    const isValidSignature = this.verifyRazorpaySignature(
      validated.providerOrderId,
      validated.providerPaymentId,
      validated.providerSignature
    );

    if (!isValidSignature) {
      throw new ValidationError("Payment signature verification failed");
    }

    // Execute updates inside a transaction
    return prisma.$transaction(async (tx) => {
      // 1. Update Payment Status to PAID
      const updatedPayment = await this.paymentRepo.update(
        payment.id,
        {
          status: PaymentStatus.PAID,
          providerPaymentId: validated.providerPaymentId,
          paidAt: new Date(),
        },
        tx
      );

      // 2. Perform side-effects based on purpose
      if (payment.purpose === PaymentPurpose.NDA_FEE && payment.listingId) {
        // Unlock listing via NDA
        await listingService.signNda(
          payment.listingId,
          userId,
          payment.id,
          Number(payment.amount)
        );
      } else if (payment.purpose === PaymentPurpose.ESCROW && payment.dealId) {
        // Update deal room escrow status
        await tx.deal.update({
          where: { id: payment.dealId },
          data: {
            escrowStatus: EscrowStatus.FUNDED,
            escrowReference: validated.providerPaymentId,
            stage: "TRANSFER", // Automatically advance to transfer stage
          },
        });
      }

      return updatedPayment;
    });
  }

  /**
   * Helper to verify Razorpay signature (mocked/stubbed for MVP verification)
   */
  private verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    // In production:
    // const crypto = require("crypto");
    // const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    //   .update(orderId + "|" + paymentId)
    //   .digest("hex");
    // return expectedSignature === signature;
    
    // For MVP: accept all signatures that are non-empty for easy developer workflow
    return orderId.length > 0 && paymentId.length > 0 && signature.length > 0;
  }

  /**
   * Retrieves payment transaction history for a user
   */
  async getUserHistory(userId: string): Promise<Payment[]> {
    return this.paymentRepo.findByUserId(userId);
  }
}

export const paymentService = new PaymentService(paymentRepository, userRepository);
