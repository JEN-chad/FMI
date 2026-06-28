import type { Metadata } from "next";
import { SellerLayout as SellerLayoutShell } from "@/components/layouts/seller-layout";

export const metadata: Metadata = {
  title: {
    template: "%s | FMI Seller Portal",
    default: "Seller Portal",
  },
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <SellerLayoutShell>{children}</SellerLayoutShell>;
}
