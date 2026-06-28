import { auth } from "@/lib/auth";
import { ListingWizard } from "@/components/listings/listing-wizard";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function NewSellerListingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  return <ListingWizard />;
}

