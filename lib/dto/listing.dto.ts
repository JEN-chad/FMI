import { z } from "zod";
import { AssetType, PricingModel, ListingStatus, DocumentType } from "@prisma/client";

export const CreateListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  businessNamePrivate: z.string().optional().nullable(),
  assetType: z.nativeEnum(AssetType),
  industry: z.string().min(2, "Industry must be specified"),
  businessModel: z.string().optional().nullable(),
  yearEstablished: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  businessUrl: z.string().url("Invalid URL format").optional().nullable(),
  monthlyRevenue: z.number().int().nonnegative().optional().nullable(),
  monthlyProfit: z.number().int().optional().nullable(),
  monthlyTraffic: z.number().int().nonnegative().optional().nullable(),
  trafficSources: z.string().optional().nullable(),
  askingPrice: z.number().int().positive("Asking price must be positive"),
  reasonForSale: z.string().optional().nullable(),
  description: z.string().min(20, "Description must be at least 20 characters").optional().nullable(),
  tagline: z.string().max(100, "Tagline cannot exceed 100 characters").optional().nullable(),
  teamSize: z.number().int().nonnegative().optional().nullable(),
  hoursPerWeek: z.number().int().nonnegative().optional().nullable(),
  pricingModel: z.nativeEnum(PricingModel).default(PricingModel.CLASSIFIED),
  reservePrice: z.number().int().positive().optional().nullable(),
  ndaRequired: z.boolean().default(true),
  ndaFee: z.number().int().nonnegative().default(0),
  coverImageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const UpdateListingSchema = CreateListingSchema.partial().extend({
  status: z.nativeEnum(ListingStatus).optional(),
});

export const CreateListingDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  name: z.string().min(2, "Document name is required"),
  url: z.string().url("Invalid document URL"),
  cloudinaryId: z.string().optional().nullable(),
  isPrivate: z.boolean().default(true),
});

export const ListingQuerySchema = z.object({
  assetType: z.nativeEnum(AssetType).optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  minRevenue: z.coerce.number().int().nonnegative().optional(),
  maxRevenue: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().optional(),
});

export type CreateListingDTO = z.infer<typeof CreateListingSchema>;
export type UpdateListingDTO = z.infer<typeof UpdateListingSchema>;
export type CreateListingDocumentDTO = z.infer<typeof CreateListingDocumentSchema>;
export type ListingQueryDTO = z.infer<typeof ListingQuerySchema>;
