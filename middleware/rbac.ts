import type { Role } from "@prisma/client";

export const ROLE_HOME: Record<Role, string> = {
  BUYER: "/buyer/dashboard",
  SELLER: "/seller/dashboard",
  BOTH: "/buyer/dashboard",
  ADMIN: "/admin/dashboard",
};

export function canAccessRolePrefix(role: Role | undefined, prefix: "buyer" | "seller" | "admin") {
  if (!role) return false;
  if (prefix === "admin") return role === "ADMIN";
  if (prefix === "buyer") return role === "BUYER" || role === "BOTH";
  return role === "SELLER" || role === "BOTH";
}

export function getWorkspacePrefix(pathname: string) {
  if (pathname === "/buyer" || pathname.startsWith("/buyer/")) return "buyer" as const;
  if (pathname === "/seller" || pathname.startsWith("/seller/")) return "seller" as const;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin" as const;
  return null;
}
