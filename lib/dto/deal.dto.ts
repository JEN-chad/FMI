import { z } from "zod";
import { DealStage, EscrowStatus, DealDocumentType, Visibility, ChecklistItemAssignee } from "@prisma/client";

export const CreateDealSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID format"),
  offerId: z.string().uuid("Invalid offer ID format"),
  buyerId: z.string().uuid("Invalid buyer ID format"),
  sellerId: z.string().uuid("Invalid seller ID format"),
  dealValue: z.coerce.number().positive("Deal value must be positive"),
});

export const UpdateDealStageSchema = z.object({
  stage: z.nativeEnum(DealStage),
});

export const UpdateEscrowStatusSchema = z.object({
  escrowStatus: z.nativeEnum(EscrowStatus),
  escrowReference: z.string().optional().nullable(),
});

export const CreateDealDocumentSchema = z.object({
  type: z.nativeEnum(DealDocumentType),
  name: z.string().min(2, "Document name is required"),
  url: z.string().url("Invalid document URL"),
  cloudinaryId: z.string().optional().nullable(),
  visibility: z.nativeEnum(Visibility).default(Visibility.BOTH),
});

export const CreateChecklistItemSchema = z.object({
  title: z.string().min(2, "Checklist item title is required"),
  description: z.string().optional().nullable(),
  assignedTo: z.nativeEnum(ChecklistItemAssignee),
  sortOrder: z.number().int().default(0),
});

export const UpdateChecklistItemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

export type CreateDealDTO = z.infer<typeof CreateDealSchema>;
export type UpdateDealStageDTO = z.infer<typeof UpdateDealStageSchema>;
export type UpdateEscrowStatusDTO = z.infer<typeof UpdateEscrowStatusSchema>;
export type CreateDealDocumentDTO = z.infer<typeof CreateDealDocumentSchema>;
export type CreateChecklistItemDTO = z.infer<typeof CreateChecklistItemSchema>;
export type UpdateChecklistItemDTO = z.infer<typeof UpdateChecklistItemSchema>;
