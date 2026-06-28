import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, phoneNumber } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db/prisma";
import { logger } from "./logger";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  
  emailAndPassword: {
    enabled: true,
  },

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  secret: process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET !== "fmi-development-secret-key-must-be-min-32-chars" ? process.env.BETTER_AUTH_SECRET : "fmi-local-build-secret-change-before-production-2026",

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },

  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 60, // 60 seconds
    max: 100, // 100 requests per window
    customRules: {
      "/sign-in/email": {
        window: 10,
        max: 3,
      },
      "/phone-number/send-otp": {
        window: 10,
        max: 3,
      },
      "/phone-number/verify": {
        window: 10,
        max: 3,
      },
    },
  },

  user: {
    fields: {
      image: "avatar_url", // Map image property in better auth to avatarUrl in Prisma/DB
    },
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },
      phoneNumberVerified: {
        type: "boolean",
        defaultValue: false,
      },
      role: {
        type: "string",
        defaultValue: "BUYER",
      },
      kycStatus: {
        type: "string",
        defaultValue: "NOT_STARTED",
      },
      kycType: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        logger.info(`[Auth Server] Sending email OTP to ${email}`, { type });
        if (process.env.NODE_ENV !== "production") {
          console.log("\n----------------------------------------");
          console.log(`[EMAIL OTP] To: ${email}`);
          console.log(`[EMAIL OTP] Type: ${type}`);
          console.log(`[EMAIL OTP] Code: ${otp}`);
          console.log("----------------------------------------\n");
        }

        if (process.env.RESEND_API_KEY) {
          try {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: "FMI Auth <onboarding@resend.dev>",
              to: email,
              subject: `FMI Verification Code: ${otp}`,
              text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
            });
            logger.info(`[Auth Server] Email OTP successfully sent via Resend to ${email}`);
          } catch (err) {
            logger.error(`[Auth Server] Failed to send email OTP via Resend`, err);
          }
        }
      },
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, ctx) => {
        logger.info(`[Auth Server] Sending SMS OTP to ${phoneNumber}`);
        if (process.env.NODE_ENV !== "production") {
          console.log("\n----------------------------------------");
          console.log(`[SMS OTP] To: ${phoneNumber}`);
          console.log(`[SMS OTP] Code: ${code}`);
          console.log("----------------------------------------\n");
        }

        // In production, we'd invoke MSG91 or Twilio API
        if (process.env.MSG91_AUTH_KEY) {
          try {
            logger.info(`[Auth Server] Attempting to send SMS via MSG91 to ${phoneNumber}`);
            // Implement MSG91 api call if needed
          } catch (err) {
            logger.error(`[Auth Server] Failed to send SMS via MSG91`, err);
          }
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber.replace("+", "")}@fmi.in`,
        getTempName: (phoneNumber) => `User ${phoneNumber}`,
      },
    }),
    nextCookies(),
  ],
});



