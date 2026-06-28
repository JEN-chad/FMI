import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  const users = await prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Recent platform accounts and access roles.</p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">KYC</th></tr>
          </thead>
          <tbody>
            {users.map((user) => <tr key={user.id} className="border-t"><td className="p-3 font-medium">{user.name}</td><td className="p-3 text-muted-foreground">{user.email}</td><td className="p-3">{user.role}</td><td className="p-3">{user.kycStatus}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

