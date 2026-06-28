import type { Metadata } from "next";
import { BuyerLayout as BuyerLayoutShell } from "@/components/layouts/buyer-layout";

export const metadata: Metadata = {
  title: {
    template: "%s | FMI Marketplace",
    default: "Marketplace",
  },
};

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <BuyerLayoutShell>{children}</BuyerLayoutShell>;
}
