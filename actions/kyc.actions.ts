"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { kycService } from "@/lib/services/kyc.service";
import { SubmitKycSchema, CreateBuyerProfileSchema } from "@/lib/dto/kyc.dto";
import { KycType, KycStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

// Lenient schema for draft saving, allowing partial and empty/incomplete values
const KycDraftSchema = z.object({
  panNumber: z.string().optional().nullable(),
  aadhaarLast4: z.string().optional().nullable(),
  panDocUrl: z.string().optional().nullable(),
  aadhaarDocUrl: z.string().optional().nullable(),
  selfieUrl: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  cin: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  companyPan: z.string().optional().nullable(),
  directorName: z.string().optional().nullable(),
});

/**
 * Server Action: Save partial KYC data as a draft.
 * Does not validate strictly and does not change the user's KYC status to PENDING.
 */
export async function saveKycDraftAction(data: unknown) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = session.user.id;
    const validatedInput = z.object({
      kycType: z.nativeEnum(KycType).nullable(),
      dto: KycDraftSchema,
    }).parse(data);

    logger.info(`[Server Action] Saving KYC draft for user: ${userId}`);

    const profile = await kycService.saveKycDraft(userId, validatedInput.kycType, validatedInput.dto);

    return { success: true, data: profile };
  } catch (error: unknown) {
    logger.error(`[Server Action] Save KYC draft failed`, error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save draft";
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Submit complete KYC details.
 * Performs strict validations (PAN, Aadhaar, Bank) and triggers the review flow.
 */
export async function submitKycAction(data: unknown) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = session.user.id;
    const validatedInput = z.object({
      kycType: z.nativeEnum(KycType),
      dto: SubmitKycSchema,
    }).parse(data);

    logger.info(`[Server Action] Submitting KYC for user: ${userId}, type: ${validatedInput.kycType}`);

    const profile = await kycService.submitKyc(userId, validatedInput.kycType, validatedInput.dto);

    return { success: true, data: profile };
  } catch (error: unknown) {
    logger.error(`[Server Action] Submit KYC failed`, error);
    const errorMessage = error instanceof Error ? error.message : "KYC submission failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Submit buyer profile preferences.
 * Required for BUYER or BOTH roles.
 */
export async function submitBuyerProfileAction(data: unknown) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = session.user.id;
    const validatedDto = CreateBuyerProfileSchema.parse(data);

    logger.info(`[Server Action] Submitting Buyer Profile for user: ${userId}`);

    const profile = await kycService.submitBuyerProfile(userId, validatedDto);

    return { success: true, data: profile };
  } catch (error: unknown) {
    logger.error(`[Server Action] Submit Buyer Profile failed`, error);
    const errorMessage = error instanceof Error ? error.message : "Buyer profile submission failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Server Action: Get the user's current draft KYC profile and Buyer Profile.
 * Pre-populates the wizard on reload.
 */
export async function getKycDraftAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access" };
    }

    const userId = session.user.id;
    
    // Fetch profile and buyer profile
    const kycProfile = await prisma.kycProfile.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const buyerProfile = await prisma.buyerProfile.findFirst({
      where: { userId, deletedAt: null },
    });

    return {
      success: true,
      data: {
        kycType: session.user.kycType,
        role: session.user.role,
        kycStatus: session.user.kycStatus,
        kycProfile: kycProfile ? {
          panNumber: kycProfile.panNumber,
          aadhaarLast4: kycProfile.aadhaarLast4,
          panDocUrl: kycProfile.panDocUrl,
          aadhaarDocUrl: kycProfile.aadhaarDocUrl,
          selfieUrl: kycProfile.selfieUrl,
          bankAccountName: kycProfile.bankAccountName,
          bankAccountNumber: kycProfile.bankAccountNumber,
          bankIfsc: kycProfile.bankIfsc,
          companyName: kycProfile.companyName,
          cin: kycProfile.cin,
          gstin: kycProfile.gstin,
          companyPan: kycProfile.companyPan,
          directorName: kycProfile.directorName,
        } : null,
        buyerProfile: buyerProfile ? {
          investorType: buyerProfile.investorType,
          industries: buyerProfile.industries,
          states: buyerProfile.states,
          budgetMin: buyerProfile.budgetMin,
          budgetMax: buyerProfile.budgetMax,
          acquisitionGoal: buyerProfile.acquisitionGoal,
          experienceLevel: buyerProfile.experienceLevel,
        } : null,
      },
    };
  } catch (error: any) {
    logger.error(`[Server Action] Get KYC draft failed`, error);
    return { success: false, error: error.message || "Failed to retrieve onboarding data" };
  }
}
