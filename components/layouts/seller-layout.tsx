"use client";

import { BarChart3, Building2, FileText, Handshake, LayoutDashboard, List, ListPlus, Settings, Sparkles, TrendingUp } from "lucide-react";
import { RoleLayoutShell } from "./role-layout-shell";
import { SharedSidebar } from "./shared-sidebar";

export function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayoutShell
      sidebar={
        <SharedSidebar
          brand={{ title: "FMI", subtitle: "Seller Portal", icon: Building2 }}
          role={{ label: "SELLER", fallbackInitial: "S", badgeClassName: "border-brand/30 bg-brand/5 text-brand" }}
          primaryItems={[
            { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
            { label: "My Listings", href: "/seller/listings", icon: List },
            { label: "New Listing", href: "/seller/listings/new", icon: ListPlus },
            { label: "Offers", href: "/seller/offers", icon: TrendingUp },
            { label: "Deals", href: "/seller/deals", icon: Handshake },
            { label: "Documents", href: "/seller/documents", icon: FileText },
            { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
          ]}
          secondaryItems={[{ label: "Settings", href: "/seller/settings", icon: Settings }]}
          promo={{
            icon: Sparkles,
            title: "AI Listing Assistant",
            body: "Auto-generate descriptions, valuations, and SEO tags.",
            href: "/seller/listings/new",
            cta: "Try Now",
            className: "fmi-gradient-subtle border-brand/20",
            accentClassName: "text-brand",
          }}
        />
      }
    >
      {children}
    </RoleLayoutShell>
  );
}



