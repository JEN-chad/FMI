"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { dealService } from "@/lib/services/deal.service";
import { AppError } from "@/lib/errors/app-error";
import { z } from "zod";
import { EscrowStatus, DealDocumentType, Visibility } from "@prisma/client";
import type { ActionResult } from "./listings";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function signAgreementAction(dealId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await dealService.signAgreement(user.id, dealId);
    revalidatePath(`/buyer/deals/${dealId}`);
    revalidatePath(`/seller/deals/${dealId}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to sign agreement" };
  }
}

export async function updateChecklistItemAction(
  dealId: string,
  itemId: string,
  isCompleted: boolean
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await dealService.updateChecklistItem(user.id, dealId, itemId, { isCompleted });
    revalidatePath(`/buyer/deals/${dealId}`);
    revalidatePath(`/seller/deals/${dealId}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to update checklist item" };
  }
}

const UploadDealDocumentSchema = z.object({
  type: z.nativeEnum(DealDocumentType),
  name: z.string().min(2),
  url: z.string().url(),
  cloudinaryId: z.string().optional().nullable(),
  visibility: z.nativeEnum(Visibility).default(Visibility.BOTH),
});

export async function uploadDealDocumentAction(
  dealId: string,
  input: z.infer<typeof UploadDealDocumentSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = UploadDealDocumentSchema.parse(input);
    const doc = await dealService.uploadDealDocument(user.id, dealId, validated);
    revalidatePath(`/buyer/deals/${dealId}`);
    revalidatePath(`/seller/deals/${dealId}`);
    return { success: true, data: { id: doc.id } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to upload document" };
  }
}

export async function adminUpdateEscrowAction(
  dealId: string,
  status: EscrowStatus,
  reference?: string
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await dealService.updateEscrowStatus(user.id, dealId, status, reference);
    revalidatePath(`/admin/deals`);
    revalidatePath(`/buyer/deals/${dealId}`);
    revalidatePath(`/seller/deals/${dealId}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to update escrow status" };
  }
}
