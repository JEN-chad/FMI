import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { BuyerDashboardClient } from "@/components/buyer/buyer-dashboard-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DealStage, OfferStatus } from "@prisma/client";

export default async function BuyerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;
  const [activeOffers, totalOffers, activeDeals, featuredListings, recentListings, recentOffers, recentDeals] = await Promise.all([
    prisma.offer.count({ where: { buyerId: userId, deletedAt: null, status: { in: [OfferStatus.PENDING, OfferStatus.COUNTERED] } } }),
    prisma.offer.count({ where: { buyerId: userId, deletedAt: null } }),
    prisma.deal.count({ where: { buyerId: userId, deletedAt: null, stage: { notIn: [DealStage.CLOSED, DealStage.CANCELLED] } } }),
    prisma.listing.findMany({ where: { deletedAt: null, status: "LIVE", isFeatured: true }, include: { _count: { select: { offers: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.listing.findMany({ where: { deletedAt: null, status: "LIVE" }, include: { _count: { select: { offers: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.offer.findMany({ where: { buyerId: userId, deletedAt: null }, include: { listing: { select: { title: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.deal.findMany({ where: { buyerId: userId, deletedAt: null }, include: { listing: { select: { title: true, slug: true } }, seller: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  return <BuyerDashboardClient stats={{ activeOffers, activeDeals, totalOffers }} recentOffers={recentOffers} recentDeals={recentDeals} featuredListings={featuredListings} recentListings={recentListings} />;
}

