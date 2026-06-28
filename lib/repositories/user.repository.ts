import { User, KycStatus } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateUserDTO, UpdateUserDTO } from "@/lib/dto/user.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class UserRepository extends BaseRepository<User, CreateUserDTO, UpdateUserDTO> {
  constructor() {
    super(prisma, "user");
  }

  /**
   * Finds a user by their email address
   */
  async findByEmail(email: string, tx?: PrismaTx): Promise<User | null> {
    return this.findFirst({ email }, tx);
  }

  /**
   * Finds a user by their phone number
   */
  async findByPhoneNumber(phoneNumber: string, tx?: PrismaTx): Promise<User | null> {
    return this.findFirst({ phoneNumber }, tx);
  }

  /**
   * Updates a user's KYC status and role
   */
  async updateKycStatus(
    userId: string,
    status: KycStatus,
    tx?: PrismaTx
  ): Promise<User> {
    return this.update(userId, { kycStatus: status }, tx);
  }
}

export const userRepository = new UserRepository();
