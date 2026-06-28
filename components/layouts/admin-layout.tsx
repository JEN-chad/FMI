"use client";

import { Activity, AlertTriangle, BarChart3, Handshake, LayoutDashboard, List, Settings, ShieldCheck, Users } from "lucide-react";
import { RoleLayoutShell } from "./role-layout-shell";
import { SharedSidebar } from "./shared-sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayoutShell
      status="Platform Operational"
      sidebar={
        <SharedSidebar
          brand={{ title: "FMI Admin", subtitle: "Control Panel", icon: AlertTriangle, iconClassName: "bg-destructive/90" }}
          role={{ label: "ADMIN", fallbackInitial: "A", variant: "destructive" }}
          primaryItems={[
            { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
            { label: "Listings", href: "/admin/listings", icon: List },
            { label: "Users", href: "/admin/users", icon: Users },
            { label: "KYC Review", href: "/admin/kyc", icon: ShieldCheck },
            { label: "Deals", href: "/admin/deals", icon: Handshake },
            { label: "Reports", href: "/admin/reports", icon: BarChart3 },
            { label: "Audit Log", href: "/admin/audit", icon: Activity },
          ]}
          secondaryItems={[{ label: "Platform Settings", href: "/admin/settings", icon: Settings }]}
        />
      }
    >
      {children}
    </RoleLayoutShell>
  );
}



