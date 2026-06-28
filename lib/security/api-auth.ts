import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export async function requireApiSession(headers: Headers, allowedRoles?: Role[]) {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) throw new UnauthorizedError("Authentication required");

  const user = await prisma.user.findFirst({ where: { id: session.user.id, deletedAt: null } });
  if (!user) throw new UnauthorizedError("Session user no longer exists");
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission to access this resource");
  }
  if (!user.emailVerified) {
    throw new ForbiddenError("Email verification is required");
  }

  return { session, user };
}

