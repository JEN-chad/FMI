import { auth } from "@/lib/auth";
import { listingService } from "@/lib/services/listing.service";
import { MarketplaceClient } from "@/components/listings/marketplace-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function BuyerListingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");

  const params = await searchParams;
  const normalizedParams = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const page = Number(normalizedParams.page ?? 1);
  const limit = Number(normalizedParams.limit ?? 12);
  const search = typeof normalizedParams.q === "string" ? normalizedParams.q : undefined;
  const result = await listingService.queryMarketplace({ page, limit, search, sortBy: "createdAt", sortOrder: "desc" });
  const industries = Array.from(new Set(result.data.map((listing) => listing.industry).filter(Boolean)));

  return <MarketplaceClient listings={result.data as never} total={result.meta.total ?? 0} page={result.meta.page ?? page} limit={result.meta.limit} industries={industries} searchParams={normalizedParams} />;
}






