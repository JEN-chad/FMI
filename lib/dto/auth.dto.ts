import { z } from "zod";

// Password strength complexity schema (production fintech standard)
export const PasswordPolicySchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: PasswordPolicySchema,
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const SendOtpSchema = z
  .object({
    email: z.string().email("Invalid email format").optional().nullable(),
    phoneNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +919876543210)")
      .optional()
      .nullable(),
    type: z.enum(["sign-in", "email-verification", "forget-password"]).default("sign-in"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required",
    path: ["email"],
  });

export const VerifyOtpSchema = z
  .object({
    email: z.string().email("Invalid email format").optional().nullable(),
    phoneNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +919876543210)")
      .optional()
      .nullable(),
    code: z.string().length(6, "OTP code must be exactly 6 digits"),
    type: z.enum(["sign-in", "email-verification", "forget-password"]).default("sign-in"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required",
    path: ["email"],
  });

export const SelectRoleSchema = z.object({
  role: z.enum(["BUYER", "SELLER", "BOTH"]),
});

export type SignUpDTO = z.infer<typeof SignUpSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type SendOtpDTO = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;
export type SelectRoleDTO = z.infer<typeof SelectRoleSchema>;
