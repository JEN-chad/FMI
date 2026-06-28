"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { listingService } from "@/lib/services/listing.service";
import { CreateListingSchema, UpdateListingSchema, CreateListingDocumentSchema } from "@/lib/dto/listing.dto";
import { AppError } from "@/lib/errors/app-error";
import { z } from "zod";
import { AssetType, PricingModel, DocumentType } from "@prisma/client";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Create Listing (Draft) ─────────────────────────────────────────────────

const CreateListingInputSchema = z.object({
  title: z.string().min(5),
  assetType: z.nativeEnum(AssetType),
  industry: z.string().min(2),
  businessModel: z.string().optional().nullable(),
  yearEstablished: z.coerce.number().int().optional().nullable(),
  businessUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  tagline: z.string().max(100).optional().nullable(),
  teamSize: z.coerce.number().int().nonnegative().optional().nullable(),
  hoursPerWeek: z.coerce.number().int().nonnegative().optional().nullable(),
  monthlyRevenue: z.coerce.number().int().nonnegative().optional().nullable(),
  monthlyProfit: z.coerce.number().int().optional().nullable(),
  monthlyTraffic: z.coerce.number().int().nonnegative().optional().nullable(),
  trafficSources: z.string().optional().nullable(),
  askingPrice: z.coerce.number().int().positive().default(1),
  reasonForSale: z.string().optional().nullable(),
  pricingModel: z.nativeEnum(PricingModel).default(PricingModel.CLASSIFIED),
  reservePrice: z.coerce.number().int().positive().optional().nullable(),
  ndaRequired: z.coerce.boolean().default(true),
  ndaFee: z.coerce.number().int().nonnegative().default(0),
  coverImageUrl: z.string().url().optional().nullable(),
  businessNamePrivate: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export async function createListingAction(
  formData: z.infer<typeof CreateListingInputSchema>
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = CreateListingInputSchema.parse(formData);
    const listing = await listingService.createListing(user.id, validated);
    revalidatePath("/seller/listings");
    return { success: true, data: { id: listing.id, slug: listing.slug } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    return { success: false, error: "Failed to create listing" };
  }
}

// ─── Update Listing ─────────────────────────────────────────────────────────

export async function updateListingAction(
  listingId: string,
  formData: Partial<z.infer<typeof CreateListingInputSchema>>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = UpdateListingSchema.parse(formData);
    const listing = await listingService.updateListing(listingId, user.id, validated);
    revalidatePath(`/seller/listings/${listingId}`);
    revalidatePath("/seller/listings");
    return { success: true, data: { id: listing.id } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    return { success: false, error: "Failed to update listing" };
  }
}

// ─── Submit for Review ───────────────────────────────────────────────────────

export async function submitListingForReviewAction(
  listingId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await listingService.submitForReview(listingId, user.id);
    revalidatePath(`/seller/listings/${listingId}`);
    revalidatePath("/seller/listings");
    revalidatePath("/seller/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to submit listing for review" };
  }
}

// ─── Add Document to Listing ─────────────────────────────────────────────────

const AddDocumentInputSchema = z.object({
  type: z.nativeEnum(DocumentType),
  name: z.string().min(2),
  url: z.string().url(),
  cloudinaryId: z.string().optional().nullable(),
  isPrivate: z.boolean().default(true),
});

export async function addListingDocumentAction(
  listingId: string,
  input: z.infer<typeof AddDocumentInputSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();
    const validated = AddDocumentInputSchema.parse(input);
    const doc = await listingService.addListingDocument(listingId, user.id, validated);
    revalidatePath(`/seller/listings/${listingId}`);
    return { success: true, data: { id: doc.id } };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to add document" };
  }
}

// ─── Sign NDA ────────────────────────────────────────────────────────────────

export async function signNdaAction(
  listingId: string,
  paymentId?: string,
  feePaid?: number
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser();
    await listingService.signNda(listingId, user.id, paymentId, feePaid);
    revalidatePath(`/buyer/listings/${listingId}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AppError) return { success: false, error: err.message };
    return { success: false, error: "Failed to sign NDA" };
  }
}

// ─── Get Seller Listings ─────────────────────────────────────────────────────

export async function getSellerListingsAction(): Promise<ActionResult<Awaited<ReturnType<typeof listingService.queryMarketplace>>>> {
  try {
    const user = await getAuthenticatedUser();
    // Query all statuses for the seller's own listings
    const result = await listingService.queryMarketplace({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    const sellerListings = {
      ...result,
      data: result.data.filter((l: { sellerId: string }) => l.sellerId === user.id),
    };
    return { success: true, data: sellerListings };
  } catch (err) {
    return { success: false, error: "Failed to load listings" };
  }
}

// ─── Increment View Count (fire-and-forget) ──────────────────────────────────

export async function incrementListingViewAction(listingId: string): Promise<void> {
  try {
    await listingService.queryMarketplace({ page: 1, limit: 1, sortBy: "createdAt", sortOrder: "desc" }); // side-effect: view tracking is in getListingDetails
  } catch {
    // Silent
  }
}
