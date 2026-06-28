import { auth } from "@/lib/auth";
import { offerRepository } from "@/lib/repositories/offer.repository";
import { BuyerOffersClient } from "@/components/buyer/buyer-offers-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function BuyerOffersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const offers = await offerRepository.findByBuyerId(session.user.id);
  return <BuyerOffersClient offers={offers as never} />;
}


