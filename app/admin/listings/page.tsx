import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminListingsClient } from "@/components/admin/admin-listings-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminListingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const listings = await prisma.listing.findMany({ where: { deletedAt: null }, include: { seller: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } });
  return <AdminListingsClient initialListings={listings as never} />;
}


