import { Payment, PaymentStatus } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreatePaymentDTO } from "@/lib/dto/payment.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class PaymentRepository extends BaseRepository<
  Payment,
  CreatePaymentDTO & { userId: string; provider?: string; providerOrderId?: string; status?: PaymentStatus },
  Partial<Payment>
> {
  constructor() {
    super(prisma, "payment");
  }

  /**
   * Finds a payment record by the Razorpay/provider order ID
   */
  async findByProviderOrderId(providerOrderId: string, tx?: PrismaTx): Promise<Payment | null> {
    return this.findFirst({ providerOrderId }, tx);
  }

  /**
   * Retrieves the payment history for a user, including the details of the listing or deal
   */
  async findByUserId(userId: string, tx?: PrismaTx): Promise<Payment[]> {
    return this.getModel(tx).findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, slug: true },
        },
        deal: {
          select: { id: true, stage: true },
        },
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
