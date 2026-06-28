"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, List, Users, Handshake, ShieldCheck,
  BarChart3, Settings, LogOut, AlertTriangle, Activity, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Listings", href: "/admin/listings", icon: List },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "KYC Review", href: "/admin/kyc", icon: ShieldCheck },
  { label: "Deals", href: "/admin/deals", icon: Handshake },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Audit Log", href: "/admin/audit", icon: Activity },
];

const SECONDARY_ITEMS = [
  { label: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shrink-0">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/90 shrink-0">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">FMI Admin</span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Control Panel</span>
        </div>
        <div className="ml-auto">
          <Badge variant="destructive" className="text-[9px] font-bold px-1.5">
            ADMIN
          </Badge>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/admin/dashboard");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                </motion.div>
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-sidebar-border" />

        <div className="space-y-0.5">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={(user as { avatarUrl?: string | null })?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs font-bold bg-destructive/80 text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name ?? "Admin"}</span>
            <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
          </div>
          <button
            onClick={() => signOut()}
            disabled={isLoading}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

