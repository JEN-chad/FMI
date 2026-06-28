import { auth } from "@/lib/auth";
import { dealService } from "@/lib/services/deal.service";
import { DealRoomContainer } from "@/components/deal-room/deal-room-container";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function BuyerDealRoomPage({ params }: { params: Promise<{ dealId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const { dealId } = await params;
  const deal = await dealService.getDealDetails(session.user.id, dealId).catch(() => null);
  if (!deal) notFound();
  return <DealRoomContainer deal={deal as never} role="BUYER" currentUserId={session.user.id} initialMessages={[]} />;
}
