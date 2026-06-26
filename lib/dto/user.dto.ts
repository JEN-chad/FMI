import { z } from "zod";
import { Role, KycStatus, KycType } from "@prisma/client";

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  role: z.nativeEnum(Role).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url("Invalid URL format").optional().nullable(),
  role: z.nativeEnum(Role).optional(),
  kycStatus: z.nativeEnum(KycStatus).optional(),
  kycType: z.nativeEnum(KycType).optional().nullable(),
});

export const UserQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
  kycStatus: z.nativeEnum(KycStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UserQueryDTO = z.infer<typeof UserQuerySchema>;
