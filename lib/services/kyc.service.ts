import { KycProfile, KycStatus, KycType, BuyerProfile, Role } from "@prisma/client";
import { kycProfileRepository, KycProfileRepository } from "@/lib/repositories/kyc.repository";
import { userRepository, UserRepository } from "@/lib/repositories/user.repository";
import { buyerProfileRepository, BuyerProfileRepository } from "@/lib/repositories/buyer.repository";
import { SubmitKycDTO, ReviewKycDTO, CreateBuyerProfileDTO, SubmitKycSchema, ReviewKycSchema, CreateBuyerProfileSchema } from "@/lib/dto/kyc.dto";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors/app-error";
import { prisma, PrismaTx } from "@/lib/db/prisma";

export class KycService {
  constructor(
    private readonly kycRepo: KycProfileRepository,
    private readonly userRepo: UserRepository,
    private readonly buyerRepo: BuyerProfileRepository
  ) {}

  /**
   * Submits KYC details for a user (Individual or Company path)
   */
  async submitKyc(
    userId: string,
    kycType: KycType,
    dto: SubmitKycDTO
  ): Promise<KycProfile> {
    const validated = SubmitKycSchema.parse(dto);

    // Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Company path validations
    if (kycType === KycType.COMPANY) {
      if (!validated.companyName || !validated.cin || !validated.gstin || !validated.companyPan) {
        throw new ValidationError("Company name, CIN, GSTIN, and Company PAN are required for Company KYC");
      }
    }

    // Perform operations in a database transaction
    return prisma.$transaction(async (tx) => {
      // Find existing profile
      const existingProfile = await this.kycRepo.findByUserId(userId, tx);

      let profile: KycProfile;
      if (existingProfile) {
        profile = await this.kycRepo.update(
          existingProfile.id,
          {
            ...validated,
            status: KycStatus.PENDING,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
          },
          tx
        );
      } else {
        profile = await this.kycRepo.create(
          {
            ...validated,
            userId,
            status: KycStatus.PENDING,
          },
          tx
        );
      }

      // Update user KYC status to pending review
      await this.userRepo.update(userId, { kycStatus: KycStatus.PENDING, kycType }, tx);

      return profile;
    });
  }

  /**
   * Saves a draft of the KYC profile (partial details)
   */
  async saveKycDraft(
    userId: string,
    kycType: KycType | null,
    dto: Partial<Record<keyof SubmitKycDTO, string | null>>
  ): Promise<KycProfile> {
    return prisma.$transaction(async (tx) => {
      const existingProfile = await this.kycRepo.findByUserId(userId, tx);

      const user = await this.userRepo.findById(userId, tx);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      let profile: KycProfile;
      if (existingProfile) {
        profile = await this.kycRepo.update(
          existingProfile.id,
          dto,
          tx
        );
      } else {
        profile = await this.kycRepo.create(
          {
            ...dto,
            userId,
            status: KycStatus.NOT_STARTED,
          } as unknown as Parameters<typeof this.kycRepo.create>[0],
          tx
        );
      }

      // Update user kycType if provided
      if (kycType) {
        await this.userRepo.update(userId, { kycType }, tx);
      }

      return profile;
    });
  }

  /**
   * Admin: Approves or rejects a user's KYC profile
   */
  async reviewKyc(
    reviewerId: string,
    userId: string,
    dto: ReviewKycDTO
  ): Promise<KycProfile> {
    const validated = ReviewKycSchema.parse(dto);

    // Verify reviewer is admin
    const reviewer = await this.userRepo.findById(reviewerId);
    if (!reviewer || reviewer.role !== Role.ADMIN) {
      throw new ForbiddenError("Only platform administrators can review KYC documents");
    }

    // Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Find latest KYC profile
    const profile = await this.kycRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError("No KYC profile found for this user");
    }

    if (validated.status === KycStatus.REJECTED && !validated.rejectionReason) {
      throw new ValidationError("A reason must be provided when rejecting KYC documents");
    }

    return prisma.$transaction(async (tx) => {
      // Update KYC profile status
      const updatedProfile = await this.kycRepo.update(
        profile.id,
        {
          status: validated.status,
          rejectionReason: validated.rejectionReason,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
        tx
      );

      // Update User main record status
      await this.userRepo.update(userId, { kycStatus: validated.status }, tx);

      return updatedProfile;
    });
  }

  /**
   * Creates or updates a buyer profile (investment preferences)
   */
  async submitBuyerProfile(
    userId: string,
    dto: CreateBuyerProfileDTO,
    tx?: PrismaTx
  ): Promise<BuyerProfile> {
    const validated = CreateBuyerProfileSchema.parse(dto);

    // Verify user exists
    const user = await this.userRepo.findById(userId, tx);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingProfile = await this.buyerRepo.findByUserId(userId, tx);
    if (existingProfile) {
      return this.buyerRepo.update(existingProfile.id, validated, tx);
    } else {
      return this.buyerRepo.create(
        {
          ...validated,
          userId,
        },
        tx
      );
    }
  }

  /**
   * Admin: Verifies proof of funds for a buyer
   */
  async verifyProofOfFunds(
    reviewerId: string,
    buyerId: string,
    verified: boolean
  ): Promise<BuyerProfile> {
    const reviewer = await this.userRepo.findById(reviewerId);
    if (!reviewer || reviewer.role !== Role.ADMIN) {
      throw new ForbiddenError("Only platform administrators can verify Proof of Funds");
    }

    const profile = await this.buyerRepo.findByUserId(buyerId);
    if (!profile) {
      throw new NotFoundError("Buyer profile not found");
    }

    return this.buyerRepo.updateProofOfFundsStatus(profile.id, verified);
  }
}

export const kycService = new KycService(
  kycProfileRepository,
  userRepository,
  buyerProfileRepository
);
