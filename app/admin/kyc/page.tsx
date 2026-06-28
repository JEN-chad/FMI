import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AdminKycReviewClient } from "@/components/admin/admin-kyc-client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminKycPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const profiles = await prisma.kycProfile.findMany({ where: { deletedAt: null }, include: { user: { select: { name: true, email: true, phoneNumber: true, kycType: true } } }, orderBy: { createdAt: "desc" } });
  return <AdminKycReviewClient initialProfiles={profiles as never} />;
}


