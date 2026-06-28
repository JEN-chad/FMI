import { auth } from "@/lib/auth";
import { dealRepository } from "@/lib/repositories/deal.repository";
import { SellerDealsClient } from "@/components/seller/seller-deals-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function SellerDealsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const deals = await dealRepository.findBySellerId(session.user.id);
  return <SellerDealsClient deals={deals as never} />;
}


