import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { canAccessRolePrefix, getWorkspacePrefix, ROLE_HOME } from "@/middleware/rbac";

const AUTH_ROUTES = new Set(["/auth/login", "/auth/signup"]);
const AUTH_PREFIXES = ["/auth/verify", "/auth/verify-email", "/auth/verify-phone"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.has(pathname) || AUTH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectWithCallback(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({ headers: request.headers });
  const role = (session?.user as { role?: Role } | undefined)?.role;
  const workspacePrefix = getWorkspacePrefix(pathname);
  const onboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  if (!session?.user) {
    if (workspacePrefix || onboardingRoute) return redirectWithCallback(request);
    return NextResponse.next();
  }

  const user = session.user as typeof session.user & {
    emailVerified?: boolean;
    banned?: boolean;
    deletedAt?: string | Date | null;
  };

  if (user.deletedAt || user.banned) {
    logger.warn("Blocked inactive account request", { userId: user.id, pathname });
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL(role ? ROLE_HOME[role] : "/onboarding/role", request.url));
  }

  if (!role && !onboardingRoute) {
    return NextResponse.redirect(new URL("/onboarding/role", request.url));
  }

  if (workspacePrefix && !canAccessRolePrefix(role, workspacePrefix)) {
    logger.warn("Forbidden workspace access", { userId: user.id, role, pathname });
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (workspacePrefix && user.emailVerified === false) {
    return NextResponse.redirect(new URL("/auth/verify-email", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/buyer/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/auth/login",
    "/auth/signup",
    "/auth/verify/:path*",
    "/auth/verify-email/:path*",
    "/auth/verify-phone/:path*",
  ],
};

