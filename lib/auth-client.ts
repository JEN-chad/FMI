import { createAuthClient } from "better-auth/react";
import { emailOTPClient, phoneNumberClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  plugins: [
    emailOTPClient(),
    phoneNumberClient(),
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        kycStatus: { type: "string", required: false },
        kycType: { type: "string", required: false },
        phoneNumber: { type: "string", required: false },
        phoneNumberVerified: { type: "boolean", required: false },
      },
    }),
  ],
});
