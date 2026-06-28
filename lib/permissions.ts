import { Role } from "@prisma/client";

export type Permission =
  // Buyer permissions
  | "listing:view_all"
  | "listing:view_details"
  | "nda:request"
  | "nda:sign"
  | "offer:create"
  | "offer:cancel"
  
  // Seller permissions
  | "listing:create"
  | "listing:edit"
  | "listing:delete"
  | "listing:view_private"
  | "nda:review"
  | "offer:review"
  | "offer:accept"
  | "offer:counter"
  | "offer:reject"
  
  // Shared Deal Room / Chat permissions
  | "deal:view"
  | "chat:send"
  | "document:upload"
  | "document:view_shared"
  
  // Admin permissions
  | "kyc:view_queue"
  | "kyc:approve"
  | "kyc:reject"
  | "listing:view_moderation"
  | "listing:approve"
  | "listing:reject"
  | "deal:view_all"
  | "user:view_all"
  | "system:settings";

// Explicit permissions mapping for each role
const rolePermissions: Record<Role, Set<Permission>> = {
  BUYER: new Set<Permission>([
    "listing:view_all",
    "listing:view_details",
    "nda:request",
    "nda:sign",
    "offer:create",
    "offer:cancel",
    "deal:view",
    "chat:send",
    "document:upload",
    "document:view_shared",
  ]),
  SELLER: new Set<Permission>([
    "listing:create",
    "listing:edit",
    "listing:delete",
    "listing:view_private",
    "nda:review",
    "offer:review",
    "offer:accept",
    "offer:counter",
    "offer:reject",
    "deal:view",
    "chat:send",
    "document:upload",
    "document:view_shared",
  ]),
  BOTH: new Set<Permission>([
    // Union of BUYER and SELLER permissions
    "listing:view_all",
    "listing:view_details",
    "nda:request",
    "nda:sign",
    "offer:create",
    "offer:cancel",
    "listing:create",
    "listing:edit",
    "listing:delete",
    "listing:view_private",
    "nda:review",
    "offer:review",
    "offer:accept",
    "offer:counter",
    "offer:reject",
    "deal:view",
    "chat:send",
    "document:upload",
    "document:view_shared",
  ]),
  ADMIN: new Set<Permission>([
    "kyc:view_queue",
    "kyc:approve",
    "kyc:reject",
    "listing:view_moderation",
    "listing:approve",
    "listing:reject",
    "deal:view_all",
    "user:view_all",
    "system:settings",
    // Admins can also inspect deals or listings
    "listing:view_all",
    "listing:view_details",
    "deal:view",
    "document:view_shared",
  ]),
};

/**
 * Checks if a given role is authorized to perform a specific permission/action.
 * Used for both API and server-side checks.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return permissions.has(permission);
}
