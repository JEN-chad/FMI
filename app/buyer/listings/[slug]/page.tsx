import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ListingDetailClient } from "@/components/listings/listing-detail-client";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function BuyerListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");

  const { slug } = await params;
  const listing = await prisma.listing.findFirst({
    where: { slug, deletedAt: null },
    include: {
      seller: { select: { id: true, name: true, createdAt: true } },
      documents: { where: { deletedAt: null } },
      _count: { select: { offers: true, ndas: true } },
    },
  });
  if (!listing) notFound();

  const [nda, offer] = await Promise.all([
    prisma.ndaAgreement.findFirst({ where: { listingId: listing.id, buyerId: session.user.id, status: "SIGNED", deletedAt: null } }),
    prisma.offer.findFirst({ where: { listingId: listing.id, buyerId: session.user.id, deletedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);

  return <ListingDetailClient listing={listing as never} currentUserId={session.user.id} hasNda={!!nda} isOwner={listing.sellerId === session.user.id} existingOfferId={offer?.id ?? null} />;
}



