import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { SellerListingsClient } from "@/components/seller/seller-listings-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ListingStatus } from "@prisma/client";

export default async function SellerListingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const sellerId = session.user.id;
  const [listings, total, live, draft, inReview, sold] = await Promise.all([
    prisma.listing.findMany({ where: { sellerId, deletedAt: null }, include: { _count: { select: { offers: true, ndas: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.LIVE } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.DRAFT } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.IN_REVIEW } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.SOLD } }),
  ]);
  return <SellerListingsClient listings={listings as never} stats={{ total, live, draft, inReview, sold }} />;
}


