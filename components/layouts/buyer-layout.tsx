"use client";

import { Handshake, Heart, LayoutDashboard, Search, Settings, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { RoleLayoutShell } from "./role-layout-shell";
import { SharedSidebar } from "./shared-sidebar";

export function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayoutShell
      sidebar={
        <SharedSidebar
          brand={{ title: "FMI", subtitle: "Buyer Portal", icon: ShoppingBag }}
          role={{ label: "BUYER", fallbackInitial: "B", badgeClassName: "border-success/30 bg-success/5 text-success" }}
          primaryItems={[
            { label: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
            { label: "Browse Listings", href: "/buyer/listings", icon: Search },
            { label: "My Offers", href: "/buyer/offers", icon: TrendingUp },
            { label: "Active Deals", href: "/buyer/deals", icon: Handshake },
            { label: "Watchlist", href: "/buyer/watchlist", icon: Heart },
          ]}
          secondaryItems={[{ label: "Settings", href: "/buyer/settings", icon: Settings }]}
          promo={{
            icon: Star,
            title: "Featured Today",
            body: "12 new verified businesses listed this week.",
            href: "/buyer/listings?featured=true",
            cta: "View All",
            className: "border-success/20 bg-gradient-to-br from-success/10 to-brand/10",
            accentClassName: "text-success",
          }}
        />
      }
    >
      {children}
    </RoleLayoutShell>
  );
}



