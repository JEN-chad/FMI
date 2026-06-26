import { BuyerProfile } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateBuyerProfileDTO, UpdateBuyerProfileDTO } from "@/lib/dto/kyc.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class BuyerProfileRepository extends BaseRepository<
  BuyerProfile,
  CreateBuyerProfileDTO & { userId: string },
  UpdateBuyerProfileDTO & { proofOfFundsVerified?: boolean }
> {
  constructor() {
    super(prisma, "buyerProfile");
  }

  /**
   * Finds the buyer profile for a specific user
   */
  async findByUserId(userId: string, tx?: PrismaTx): Promise<BuyerProfile | null> {
    return this.findFirst({ userId }, tx);
  }

  /**
   * Updates the proof of funds verification status
   */
  async updateProofOfFundsStatus(
    id: string,
    verified: boolean,
    tx?: PrismaTx
  ): Promise<BuyerProfile> {
    return this.update(id, { proofOfFundsVerified: verified }, tx);
  }
}

export const buyerProfileRepository = new BuyerProfileRepository();
