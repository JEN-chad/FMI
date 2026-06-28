"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Eye, TrendingUp, MoreHorizontal, PlusCircle, Filter, Edit, ExternalLink, Pause, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetType, ListingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: ListingStatus;
  assetType: AssetType;
  askingPrice: number;
  monthlyRevenue: number | null;
  viewCount: number;
  coverImageUrl: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  _count: { offers: number; ndas: number };
}

interface Stats { total: number; live: number; draft: number; inReview: number; sold: number }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  LIVE: { label: "Live", color: "bg-success/10 text-success border-success/20" },
  DRAFT: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  IN_REVIEW: { label: "In Review", color: "bg-warning/10 text-warning border-warning/20" },
  PAUSED: { label: "Paused", color: "bg-muted text-muted-foreground border-border" },
  SOLD: { label: "Sold", color: "bg-brand/10 text-brand border-brand/20" },
  REJECTED: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const ASSET_ICONS: Record<string, string> = {
  SAAS: "☁️", ECOMMERCE: "🛒", APP: "📱", BLOG: "📝", DOMAIN: "🌐", CONTENT_SITE: "📰", SERVICE: "🏢",
};

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

type FilterStatus = "ALL" | ListingStatus;

export function SellerListingsClient({ listings, stats }: { listings: Listing[]; stats: Stats }) {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");

  const filtered = listings.filter((l) => {
    const matchesStatus = filter === "ALL" || l.status === filter;
    const matchesSearch = !search || l.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterTabs: { label: string; value: FilterStatus; count: number }[] = [
    { label: "All", value: "ALL", count: stats.total },
    { label: "Live", value: "LIVE" as ListingStatus, count: stats.live },
    { label: "In Review", value: "IN_REVIEW" as ListingStatus, count: stats.inReview },
    { label: "Draft", value: "DRAFT" as ListingStatus, count: stats.draft },
    { label: "Sold", value: "SOLD" as ListingStatus, count: stats.sold },
  ];

  return (
    <div className="space-y-5">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-0 scrollbar-thin">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              filter === tab.value
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 font-bold", filter === tab.value ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-72">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/seller/listings/new">
          <Button className="fmi-gradient text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> New Listing
          </Button>
        </Link>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <span className="text-5xl">📋</span>
          <h3 className="font-semibold">No listings found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "No listings match your filter" : "Create your first listing to get started"}
          </p>
          {!search && (
            <Link href="/seller/listings/new">
              <Button className="mt-2 fmi-gradient text-white">Create Listing</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing, i) => {
            const cfg = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.DRAFT;
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                        {listing.coverImageUrl ? (
                          <img src={listing.coverImageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                        ) : (
                          ASSET_ICONS[listing.assetType] ?? "💼"
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", cfg.color)}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{formatCurrency(listing.askingPrice)}</span>
                          {listing.monthlyRevenue && <span>MRR: {formatCurrency(listing.monthlyRevenue)}</span>}
                          <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{listing.viewCount} views</span>
                          <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{listing._count.offers} offers</span>
                          <span>Created {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={
                            <Link href={`/seller/listings/${listing.id}`} className="flex items-center gap-2">
                              <ExternalLink className="h-3.5 w-3.5" /> View Details
                            </Link>
                          } />
                          <DropdownMenuItem render={
                            <Link href={`/seller/listings/${listing.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-3.5 w-3.5" /> Edit Listing
                            </Link>
                          } />
                          {listing.status === ListingStatus.LIVE && (
                            <DropdownMenuItem className="text-warning">
                              <Pause className="h-3.5 w-3.5 mr-2" /> Pause Listing
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

