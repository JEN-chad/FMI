"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignUpSchema, LoginSchema, SendOtpSchema, VerifyOtpSchema, SelectRoleSchema } from "@/lib/dto/auth.dto";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";
import { logger } from "@/lib/logger";

/**
 * Server Action: Register a new user using Email & Password.
 * Implements strict input validation and hashes passwords via Better Auth.
 */
export async function signUpWithCredentialsAction(data: unknown) {
  try {
    const validated = SignUpSchema.parse(data);
    logger.info(`[Server Action] SignUp attempted for email: ${validated.email}`);

    const result = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
      headers: await headers(),
    });

    return { success: true, data: result };
  } catch (error: any) {
    logger.error(`[Server Action] SignUp failed`, error);
    return { success: false, error: error.message || "Registration failed" };
  }
}

/**
 * Server Action: Authenticate a user with Email & Password.
 * Sets the Better Auth HTTP-only session cookies in the browser.
 */
export async function signInWithCredentialsAction(data: unknown) {
  try {
    const validated = LoginSchema.parse(data);
    logger.info(`[Server Action] Login attempted for email: ${validated.email}`);

    const result = await auth.api.signInEmail({
      body: {
        email: validated.email,
        password: validated.password,
      },
      headers: await headers(),
    });

    return { success: true, data: result };
  } catch (error: any) {
    logger.error(`[Server Action] Login failed`, error);
    return { success: false, error: error.message || "Authentication failed" };
  }
}

/**
 * Server Action: Dispatches an OTP to Email or Phone Number based on request type.
 */
export async function sendOtpAction(data: unknown) {
  try {
    const validated = SendOtpSchema.parse(data);
    
    if (validated.email) {
      logger.info(`[Server Action] Dispatching email OTP to ${validated.email}`);
      await auth.api.sendVerificationOTP({
        body: {
          email: validated.email,
          type: validated.type,
        },
        headers: await headers(),
      });
      return { success: true, message: "Email OTP sent successfully" };
    } 
    
    if (validated.phoneNumber) {
      logger.info(`[Server Action] Dispatching SMS OTP to ${validated.phoneNumber}`);
      await auth.api.sendPhoneNumberOTP({
        body: {
          phoneNumber: validated.phoneNumber,
        },
        headers: await headers(),
      });
      return { success: true, message: "SMS OTP sent successfully" };
    }

    return { success: false, error: "Email or Phone Number is required" };
  } catch (error: any) {
    logger.error(`[Server Action] Send OTP failed`, error);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

/**
 * Server Action: Verifies OTP code for Email or Phone Number and logs the user in.
 */
export async function verifyOtpAction(data: unknown) {
  try {
    const validated = VerifyOtpSchema.parse(data);
    
    if (validated.email) {
      logger.info(`[Server Action] Verifying email OTP for ${validated.email} with type ${validated.type}`);
      let result;
      if (validated.type === "sign-in") {
        result = await auth.api.signInEmailOTP({
          body: {
            email: validated.email,
            otp: validated.code,
          },
          headers: await headers(),
        });
      } else {
        result = await auth.api.verifyEmailOTP({
          body: {
            email: validated.email,
            otp: validated.code,
          },
          headers: await headers(),
        });
      }
      
      return { success: true, data: result };
    }
    
    if (validated.phoneNumber) {
      logger.info(`[Server Action] Verifying SMS OTP for ${validated.phoneNumber}`);
      // verifyPhoneNumber automatically signs the user in and establishes session cookies
      const result = await auth.api.verifyPhoneNumber({
        body: {
          phoneNumber: validated.phoneNumber,
          code: validated.code,
        },
        headers: await headers(),
      });
      return { success: true, data: result };
    }

    return { success: false, error: "Email or Phone Number is required" };
  } catch (error: any) {
    logger.error(`[Server Action] OTP verification failed`, error);
    return { success: false, error: error.message || "OTP verification failed" };
  }
}

/**
 * Server Action: Update a user's role on onboarding selection.
 */
export async function selectUserRoleAction(data: unknown) {
  try {
    const validated = SelectRoleSchema.parse(data);
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized access" };
    }

    logger.info(`[Server Action] Role selected: ${validated.role} for user: ${session.user.email}`);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: validated.role as Role },
    });

    return { success: true, user: updatedUser };
  } catch (error: any) {
    logger.error(`[Server Action] Select role failed`, error);
    return { success: false, error: error.message || "Failed to save role selection" };
  }
}

/**
 * Server Action: Sign out the user and invalidate the current session.
 */
export async function signOutAction() {
  try {
    logger.info(`[Server Action] User logging out`);
    await auth.api.signOut({
      headers: await headers(),
    });
    return { success: true };
  } catch (error: any) {
    logger.error(`[Server Action] SignOut failed`, error);
    return { success: false, error: error.message || "SignOut failed" };
  }
}
