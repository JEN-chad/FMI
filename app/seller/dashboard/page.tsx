import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { SellerDashboardClient } from "@/components/seller/seller-dashboard-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DealStage, ListingStatus, OfferStatus } from "@prisma/client";

export default async function SellerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const sellerId = session.user.id;
  const [totalListings, liveListings, draftListings, pendingListings, totalViews, pendingOffers, activeDeals, listings, recentOffers, recentDeals] = await Promise.all([
    prisma.listing.count({ where: { sellerId, deletedAt: null } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.LIVE } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.DRAFT } }),
    prisma.listing.count({ where: { sellerId, deletedAt: null, status: ListingStatus.IN_REVIEW } }),
    prisma.listing.aggregate({ where: { sellerId, deletedAt: null }, _sum: { viewCount: true } }),
    prisma.offer.count({ where: { sellerId, deletedAt: null, status: { in: [OfferStatus.PENDING, OfferStatus.COUNTERED] } } }),
    prisma.deal.count({ where: { sellerId, deletedAt: null, stage: { notIn: [DealStage.CLOSED, DealStage.CANCELLED] } } }),
    prisma.listing.findMany({ where: { sellerId, deletedAt: null }, include: { _count: { select: { offers: true } } }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.offer.findMany({ where: { sellerId, deletedAt: null }, include: { listing: { select: { title: true, slug: true } }, buyer: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.deal.findMany({ where: { sellerId, deletedAt: null }, include: { listing: { select: { title: true, slug: true } }, buyer: { select: { name: true, avatarUrl: true } } }, orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  return <SellerDashboardClient stats={{ totalListings, liveListings, draftListings, pendingListings, totalViews: totalViews._sum.viewCount ?? 0, pendingOffers, activeDeals, monthlyRevenue: 0 }} listings={listings as never} recentOffers={recentOffers as never} recentDeals={recentDeals as never} />;
}


