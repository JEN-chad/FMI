"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | null;
};

type SharedSidebarProps = {
  brand: {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconClassName?: string;
  };
  role: {
    label: string;
    fallbackInitial: string;
    badgeClassName?: string;
    variant?: "outline" | "destructive";
  };
  primaryItems: SidebarNavItem[];
  secondaryItems?: SidebarNavItem[];
  promo?: {
    icon: LucideIcon;
    title: string;
    body: string;
    href: string;
    cta: string;
    className?: string;
    accentClassName?: string;
  };
};

export function SharedSidebar({
  brand,
  role,
  primaryItems,
  secondaryItems = [],
  promo,
}: SharedSidebarProps) {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const BrandIcon = brand.icon;
  const PromoIcon = promo?.icon;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : role.fallbackInitial;

  const renderItems = (items: SidebarNavItem[], secondary = false) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <Link key={item.href} href={item.href}>
          <motion.div
            whileHover={{ x: 2 }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? secondary
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <Badge className="h-4 min-w-4 px-1 text-[10px]">{item.badge}</Badge>
            )}
            {isActive && !secondary && <ChevronRight className="h-3 w-3 opacity-60" />}
          </motion.div>
        </Link>
      );
    });

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", brand.iconClassName ?? "fmi-gradient")}>
          <BrandIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">{brand.title}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{brand.subtitle}</span>
        </div>
        <div className="ml-auto">
          <Badge variant={role.variant ?? "outline"} className={cn("px-1.5 text-[9px] font-bold", role.badgeClassName)}>
            {role.label}
          </Badge>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">{renderItems(primaryItems)}</div>

        {secondaryItems.length > 0 && (
          <>
            <Separator className="my-4 bg-sidebar-border" />
            <div className="space-y-0.5">{renderItems(secondaryItems, true)}</div>
          </>
        )}

        {promo && PromoIcon && (
          <div className={cn("mx-1 mt-4 space-y-1.5 rounded-xl border p-3", promo.className)}>
            <div className="flex items-center gap-2">
              <PromoIcon className={cn("h-3.5 w-3.5", promo.accentClassName)} />
              <span className={cn("text-xs font-semibold", promo.accentClassName)}>{promo.title}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{promo.body}</p>
            <Link href={promo.href} className={cn("block text-center text-[11px] font-semibold hover:underline", promo.accentClassName)}>
              {promo.cta}
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={(user as { avatarUrl?: string | null })?.avatarUrl ?? undefined} />
            <AvatarFallback className="fmi-gradient text-xs font-bold text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-semibold text-sidebar-foreground">{user?.name ?? role.label}</span>
            <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            disabled={isLoading}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
