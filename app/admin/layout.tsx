import type { Metadata } from "next";
import { AdminLayout as AdminLayoutShell } from "@/components/layouts/admin-layout";

export const metadata: Metadata = {
  title: {
    template: "%s | FMI Admin",
    default: "Admin Panel",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
