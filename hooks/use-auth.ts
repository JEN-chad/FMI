"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Role } from "@prisma/client";

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending: isLoading, error, refetch } = authClient.useSession();
  const [isMutating, setIsMutating] = useState(false);

  const isAuthenticated = !!session;
  const user = session?.user || null;
  const role = (session?.user as { role?: Role } | undefined)?.role ?? null;
  const kycStatus = (session?.user as { kycStatus?: string } | undefined)?.kycStatus || "NOT_STARTED";

  // Wrapper for credentials login
  const signInWithCredentials = async (email: string, password: string) => {
    setIsMutating(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });
      await refetch();
      return result;
    } finally {
      setIsMutating(false);
    }
  };

  // Wrapper for credentials sign up
  const signUpWithCredentials = async (email: string, password: string, name: string) => {
    setIsMutating(true);
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      } as unknown as Parameters<typeof authClient.signUp.email>[0]);
      await refetch();
      return result;
    } finally {
      setIsMutating(false);
    }
  };

  // Wrapper for sending Email OTP
  const sendEmailOtp = async (email: string, type: "sign-in" | "email-verification" | "forget-password" = "sign-in") => {
    setIsMutating(true);
    try {
      return await authClient.emailOtp.sendVerificationOtp({
        email,
        type,
      });
    } finally {
      setIsMutating(false);
    }
  };

  // Wrapper for signing in with Email OTP
  const signInWithEmailOtp = async (email: string, otp: string) => {
    setIsMutating(true);
    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
      });
      await refetch();
      return result;
    } finally {
      setIsMutating(false);
    }
  };

  // Wrapper for sending Phone OTP
  const sendPhoneOtp = async (phoneNumber: string) => {
    setIsMutating(true);
    try {
      return await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });
    } finally {
      setIsMutating(false);
    }
  };

  // Wrapper for verifying Phone OTP (which signs the user in)
  const signInWithPhoneOtp = async (phoneNumber: string, code: string) => {
    setIsMutating(true);
    try {
      const result = await authClient.phoneNumber.verify({
        phoneNumber,
        code,
      });
      await refetch();
      return result;
    } finally {
      setIsMutating(false);
    }
  };

  // Wrapper for signing out
  const signOut = async () => {
    setIsMutating(true);
    try {
      await authClient.signOut();
      router.push("/auth/login");
      router.refresh();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    session,
    user,
    role,
    kycStatus,
    isAuthenticated,
    isLoading: isLoading || isMutating,
    error,
    signInWithCredentials,
    signUpWithCredentials,
    sendEmailOtp,
    signInWithEmailOtp,
    sendPhoneOtp,
    signInWithPhoneOtp,
    signOut,
    refetchSession: refetch,
  };
}



