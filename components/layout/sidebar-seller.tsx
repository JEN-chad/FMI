"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ListPlus, List, TrendingUp, MessageSquare,
  Handshake, FileText, Settings, ChevronRight, Building2, LogOut, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/seller/listings", icon: List },
  { label: "New Listing", href: "/seller/listings/new", icon: ListPlus },
  { label: "Offers", href: "/seller/offers", icon: TrendingUp, badge: null },
  { label: "Deals", href: "/seller/deals", icon: Handshake },
  { label: "Documents", href: "/seller/documents", icon: FileText },
  { label: "Analytics", href: "/seller/analytics", icon: MessageSquare },
];

const SECONDARY_ITEMS = [
  { label: "Settings", href: "/seller/settings", icon: Settings },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "S";

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shrink-0">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg fmi-gradient shrink-0">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">FMI</span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Seller Portal</span>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="text-[9px] font-bold border-brand/30 text-brand bg-brand/5 px-1.5">
            SELLER
          </Badge>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary-foreground")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <Badge className="text-[10px] h-4 min-w-4 px-1 bg-destructive text-destructive-foreground">
                      {item.badge}
                    </Badge>
                  )}
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

        {/* AI Assistant Promo */}
        <div className="mt-4 mx-1 rounded-xl fmi-gradient-subtle border border-brand/20 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span className="text-xs font-semibold text-brand">AI Listing Assistant</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Auto-generate descriptions, valuations, and SEO tags.
          </p>
          <Link
            href="/seller/listings/new"
            className="block text-center text-[11px] font-semibold text-brand hover:underline"
          >
            Try Now →
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={(user as { avatarUrl?: string | null })?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs font-bold fmi-gradient text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name ?? "Seller"}</span>
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

