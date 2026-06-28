import { auth } from "@/lib/auth";
import { dealRepository } from "@/lib/repositories/deal.repository";
import { BuyerDealsClient } from "@/components/buyer/buyer-deals-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function BuyerDealsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const deals = await dealRepository.findByBuyerId(session.user.id);
  return <BuyerDealsClient deals={deals as never} />;
}


