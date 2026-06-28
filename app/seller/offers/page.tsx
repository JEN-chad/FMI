import { auth } from "@/lib/auth";
import { offerRepository } from "@/lib/repositories/offer.repository";
import { SellerOffersClient } from "@/components/seller/seller-offers-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function SellerOffersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const offers = await offerRepository.findBySellerId(session.user.id);
  const stats = offers.reduce<Record<string, number>>((acc, offer) => {
    acc[offer.status] = (acc[offer.status] ?? 0) + 1;
    return acc;
  }, {});
  return <SellerOffersClient offers={offers as never} stats={stats} />;
}


