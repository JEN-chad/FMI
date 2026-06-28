"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { listingService } from "@/lib/services/listing.service";
import { kycService } from "@/lib/services/kyc.service";
import { notificationService } from "@/lib/services/notification.service";
import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/prisma";
import { KycStatus } from "@prisma/client";
import { z } from "zod";
import type { ActionResult } from "./listings";

async function getAuthenticatedAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const user = session.user as { id: string; role?: string };
  if (user.role !== "ADMIN") throw new Error("Forbidden: Admin access required");
  return user;
}

export async function adminApproveListingAction(listingId: string): Promise<ActionResult> {
  try {
    const admin = await getAuthenticatedAdmin();
    await listingService.approveListing(listingId, admin.id);
    revalidatePath("/admin/listings");
    revalidatePath("/seller/listings");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to approve listing" };
  }
}

const RejectListingSchema = z.object({ reason: z.string().min(10, "Rejection reason must be at least 10 characters") });

export async function adminRejectListingAction(
  listingId: string,
  input: z.infer<typeof RejectListingSchema>
): Promise<ActionResult> {
  try {
    const admin = await getAuthenticatedAdmin();
    const validated = RejectListingSchema.parse(input);
    await listingService.rejectListing(listingId, admin.id, validated.reason);
    revalidatePath("/admin/listings");
    revalidatePath("/seller/listings");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to reject listing" };
  }
}

export async function adminApproveKycAction(kycProfileId: string): Promise<ActionResult> {
  try {
    const admin = await getAuthenticatedAdmin();
    const profile = await prisma.kycProfile.findUnique({ where: { id: kycProfileId } });
    if (!profile) throw new Error("KYC Profile not found");

    await kycService.reviewKyc(admin.id, profile.userId, {
      status: KycStatus.APPROVED,
    });

    revalidatePath("/admin/kyc");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to approve KYC" };
  }
}

const RejectKycSchema = z.object({ reason: z.string().min(10) });

export async function adminRejectKycAction(
  kycProfileId: string,
  input: z.infer<typeof RejectKycSchema>
): Promise<ActionResult> {
  try {
    const admin = await getAuthenticatedAdmin();
    const validated = RejectKycSchema.parse(input);
    const profile = await prisma.kycProfile.findUnique({ where: { id: kycProfileId } });
    if (!profile) throw new Error("KYC Profile not found");

    await kycService.reviewKyc(admin.id, profile.userId, {
      status: KycStatus.REJECTED,
      rejectionReason: validated.reason,
    });

    revalidatePath("/admin/kyc");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to reject KYC" };
  }
}
