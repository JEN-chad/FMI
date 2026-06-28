import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const [totalUsers, totalDeals, listingsByStatusRows, kycByStatusRows, pendingListings, pendingKyc] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.deal.count({ where: { deletedAt: null } }),
    prisma.listing.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    prisma.user.groupBy({ by: ["kycStatus"], where: { deletedAt: null }, _count: true }),
    prisma.listing.findMany({ where: { deletedAt: null, status: "IN_REVIEW" }, include: { seller: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" }, take: 5 }),
    prisma.kycProfile.findMany({ where: { deletedAt: null, status: { in: ["PENDING", "IN_REVIEW"] } }, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" }, take: 5 }),
  ]);
  const listingsByStatus = Object.fromEntries(listingsByStatusRows.map((row) => [row.status, row._count]));
  const kycByStatus = Object.fromEntries(kycByStatusRows.map((row) => [row.kycStatus, row._count]));
  return <AdminDashboardClient stats={{ totalUsers, totalDeals, listingsByStatus, kycByStatus }} pendingListings={pendingListings as never} pendingKyc={pendingKyc as never} />;
}


