"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { offerService } from "@/lib/services/offer.service";
import { AppError } from "@/lib/errors/app-error";
import { z } from "zod";
import type { ActionResult } from "./listings";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

const CreateOfferSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.coerce.number().positive("Offer amount must be positive"),
  upfrontPercent: z.coerce.number().min(0).max(100).default(100),
  earnoutPercent: z.coerce.number().min(0).max(100).default(0),
  earnoutTerms: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function createOfferAction(
  input: z.infer<typeof CreateOfferSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = CreateOfferSchema.parse(input);
    const offer = await offerService.submitOffer(user.id, {
      listingId: validated.listingId,
      amount: validated.amount,
      upfrontPercent: validated.upfrontPercent,
      earnoutPercent: validated.earnoutPercent,
      earnoutTerms: validated.earnoutTerms ?? undefined,
      message: validated.message ?? undefined,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
    });
    revalidatePath("/buyer/offers");
    revalidatePath("/seller/offers");
    return { success: true, data: { id: offer.id } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    return { success: false, error: "Failed to create offer" };
  }
}

const CounterOfferSchema = z.object({
  counterAmount: z.coerce.number().positive("Counter amount must be positive"),
  counterMessage: z.string().optional().nullable(),
});

export async function counterOfferAction(
  offerId: string,
  input: z.infer<typeof CounterOfferSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = CounterOfferSchema.parse(input);
    const offer = await offerService.counterOffer(user.id, offerId, {
      amount: validated.counterAmount,
      message: validated.counterMessage ?? undefined,
    });
    revalidatePath("/seller/offers");
    revalidatePath("/buyer/offers");
    return { success: true, data: { id: offer.id } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to counter offer" };
  }
}

export async function acceptOfferAction(offerId: string): Promise<ActionResult<{ dealId: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const deal = await offerService.acceptOffer(user.id, offerId);
    revalidatePath("/seller/offers");
    revalidatePath("/seller/deals");
    revalidatePath("/buyer/offers");
    revalidatePath("/buyer/deals");
    return { success: true, data: { dealId: deal.id } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to accept offer" };
  }
}

export async function rejectOfferAction(offerId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await offerService.rejectOffer(user.id, offerId);
    revalidatePath("/seller/offers");
    revalidatePath("/buyer/offers");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to reject offer" };
  }
}

export async function withdrawOfferAction(offerId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await offerService.withdrawOffer(offerId, user.id);
    revalidatePath("/buyer/offers");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to withdraw offer" };
  }
}
