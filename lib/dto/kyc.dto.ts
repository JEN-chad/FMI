import { z } from "zod";
import { KycStatus, InvestorType, ExperienceLevel } from "@prisma/client";

// Regex patterns for Indian compliance validations
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAAR_LAST4_REGEX = /^\d{4}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const CIN_REGEX = /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

export const SubmitKycSchema = z.object({
  panNumber: z.string().regex(PAN_REGEX, "Invalid Indian PAN Card format"),
  aadhaarLast4: z.string().regex(AADHAAR_LAST4_REGEX, "Must be the last 4 digits of Aadhaar"),
  panDocUrl: z.string().url("Invalid PAN document URL"),
  aadhaarDocUrl: z.string().url("Invalid Aadhaar document URL"),
  selfieUrl: z.string().url("Invalid selfie photo URL"),
  bankAccountName: z.string().min(2, "Bank account holder name is required"),
  bankAccountNumber: z.string().min(8, "Invalid bank account number"),
  bankIfsc: z.string().regex(IFSC_REGEX, "Invalid Indian Bank IFSC code format"),
  
  // Company-specific KYC fields (conditional based on kycType in Service layer)
  companyName: z.string().optional().nullable(),
  cin: z.string().regex(CIN_REGEX, "Invalid Corporate Identification Number (CIN) format").optional().nullable(),
  gstin: z.string().regex(GSTIN_REGEX, "Invalid GSTIN format").optional().nullable(),
  companyPan: z.string().regex(PAN_REGEX, "Invalid Company PAN format").optional().nullable(),
  directorName: z.string().optional().nullable(),
});

export const ReviewKycSchema = z.object({
  status: z.enum([KycStatus.APPROVED, KycStatus.REJECTED]),
  rejectionReason: z.string().optional().nullable(),
});

export const CreateBuyerProfileSchema = z.object({
  investorType: z.nativeEnum(InvestorType),
  industries: z.array(z.string()).nonempty("Select at least one target industry"),
  states: z.array(z.string()).nonempty("Select at least one state of operation"),
  budgetMin: z.number().int().nonnegative("Budget minimum must be non-negative"),
  budgetMax: z.number().int().positive("Budget maximum must be positive"),
  acquisitionGoal: z.string().min(10, "Acquisition goal details must be at least 10 characters"),
  experienceLevel: z.nativeEnum(ExperienceLevel),
});

export const UpdateBuyerProfileSchema = CreateBuyerProfileSchema.partial();

export type SubmitKycDTO = z.infer<typeof SubmitKycSchema>;
export type ReviewKycDTO = z.infer<typeof ReviewKycSchema>;
export type CreateBuyerProfileDTO = z.infer<typeof CreateBuyerProfileSchema>;
export type UpdateBuyerProfileDTO = z.infer<typeof UpdateBuyerProfileSchema>;
