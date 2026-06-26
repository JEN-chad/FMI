import { KycProfile, KycStatus } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { SubmitKycDTO } from "@/lib/dto/kyc.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class KycProfileRepository extends BaseRepository<
  KycProfile,
  SubmitKycDTO & { userId: string; status?: KycStatus },
  Partial<KycProfile>
> {
  constructor() {
    super(prisma, "kycProfile");
  }

  /**
   * Finds the latest KYC profile for a user
   */
  async findByUserId(userId: string, tx?: PrismaTx): Promise<KycProfile | null> {
    return this.getModel(tx).findFirst({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves all KYC profiles with a status of PENDING or IN_REVIEW for admin review
   */
  async findPendingReviews(tx?: PrismaTx): Promise<KycProfile[]> {
    return this.findMany(
      {
        where: {
          status: { in: [KycStatus.PENDING, KycStatus.IN_REVIEW] },
        },
        orderBy: { createdAt: "asc" },
      },
      tx
    );
  }
}

export const kycProfileRepository = new KycProfileRepository();
