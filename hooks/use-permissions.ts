"use client";

import { useAuth } from "./use-auth";
import { hasPermission, Permission } from "@/lib/permissions";

export function usePermissions() {
  const { role } = useAuth();

  /**
   * Evaluates if the authenticated user has a specific granular capability.
   * Usage: const { can } = usePermissions(); ... if (can("listing:create")) { ... }
   */
  const can = (permission: Permission): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  return {
    can,
    role,
  };
}
