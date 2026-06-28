"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Filter, SlidersHorizontal, Eye, TrendingUp, DollarSign, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AssetType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ListingCard {
  id: string;
  title: string;
  slug: string;
  assetType: AssetType;
  industry: string;
  askingPrice: number;
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  monthlyTraffic: number | null;
  coverImageUrl: string | null;
  ndaRequired: boolean;
  ndaFee: number;
  isFeatured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  viewCount: number;
  _count: { offers: number };
}

interface MarketplaceClientProps {
  listings: ListingCard[];
  total: number;
  page: number;
  limit: number;
  industries: string[];
  searchParams: Record<string, string | undefined>;
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  SAAS: "SaaS", ECOMMERCE: "eCommerce", APP: "App", BLOG: "Blog",
  DOMAIN: "Domain", CONTENT_SITE: "Content Site", SERVICE: "Agency",
};

const ASSET_TYPE_ICONS: Record<string, string> = {
  SAAS: "☁️", ECOMMERCE: "🛒", APP: "📱", BLOG: "📝",
  DOMAIN: "🌐", CONTENT_SITE: "📰", SERVICE: "🏢",
};

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function ListingCardUI({ listing }: { listing: ListingCard }) {
  const revenueMultiple = listing.monthlyRevenue && listing.askingPrice
    ? (listing.askingPrice / (listing.monthlyRevenue * 12)).toFixed(1)
    : null;

  return (
    <Link href={`/buyer/listings/${listing.slug}`}>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
        <Card className="group border border-border/75 bg-card/65 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.02)] hover:border-brand/20 hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col justify-between">
          <div>
            {/* Cover */}
            <div className="h-40 bg-gradient-to-br from-brand/5 via-secondary/40 to-brand/3 relative overflow-hidden">
              {listing.coverImageUrl ? (
                <img src={listing.coverImageUrl} alt={listing.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103" />
              ) : (
                <div className="h-full flex items-center justify-center text-4xl opacity-80">
                  {ASSET_TYPE_ICONS[listing.assetType] ?? "💼"}
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge className="bg-background/95 border-0 text-foreground text-[10px] font-bold py-0.5 px-2">
                  {ASSET_TYPE_ICONS[listing.assetType]} {ASSET_TYPE_LABELS[listing.assetType] ?? listing.assetType}
                </Badge>
                {listing.isFeatured && (
                  <Badge className="bg-brand/10 border border-brand/20 text-brand text-[10px] font-bold py-0.5 px-2">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />Featured
                  </Badge>
                )}
              </div>
              {listing.ndaRequired && (
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-background/95 border-warning/20 text-warning text-[10px] py-0.5 px-2.5 font-bold">
                    🔒 NDA
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Title */}
              <div>
                <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                  {listing.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{listing.industry}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                {listing.monthlyRevenue && (
                  <div className="bg-success/5 border border-success/15 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">MRR</p>
                    <p className="text-xs font-extrabold text-success mt-0.5">{formatCurrency(listing.monthlyRevenue)}</p>
                  </div>
                )}
                {listing.monthlyTraffic && (
                  <div className="bg-brand/5 border border-brand/15 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Traffic</p>
                    <p className="text-xs font-extrabold text-brand mt-0.5">{(listing.monthlyTraffic / 1000).toFixed(0)}K/mo</p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          <CardContent className="p-5 pt-0">
            <Separator className="mb-4 opacity-60" />
            {/* Asking Price */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Asking Price</p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{formatCurrency(listing.askingPrice)}</p>
                {revenueMultiple && (
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{revenueMultiple}× ARR multiple</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.viewCount}</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{listing._count.offers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

export function MarketplaceClient({ listings, total, page, limit, industries, searchParams }: MarketplaceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.q ?? "");

  const totalPages = Math.ceil(total / limit);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    startTransition(() => {
      router.push(`/buyer/listings?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: search || undefined, page: "1" });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search + Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by keywords, tech stack, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card/65 shadow-xs"
            />
          </div>
          <Button type="submit" className="h-10 px-5 shadow-xs" disabled={isPending}>Search</Button>
        </form>

        <div className="flex gap-2 shrink-0">
          <Select value={searchParams.assetType ?? ""} onValueChange={(v) => updateParams({ assetType: v || undefined, page: "1" })}>
            <SelectTrigger className="w-44 h-10 bg-card/65 shadow-xs">
              <SelectValue placeholder="Asset Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Asset Classes</SelectItem>
              {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{ASSET_TYPE_ICONS[k]} {v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={searchParams.sortBy ?? "newest"} onValueChange={(v) => updateParams({ sortBy: v ?? undefined, page: "1" })}>
            <SelectTrigger className="w-44 h-10 bg-card/65 shadow-xs">
              <SelectValue placeholder="Sort Listing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="most_viewed">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchParams.q || searchParams.assetType || searchParams.industry) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold">Active:</span>
          {searchParams.q && <Badge variant="secondary" className="gap-1 cursor-pointer font-bold px-2 py-0.5 border border-border/30" onClick={() => updateParams({ q: undefined })}>Query: {searchParams.q} ×</Badge>}
          {searchParams.assetType && <Badge variant="secondary" className="gap-1 cursor-pointer font-bold px-2 py-0.5 border border-border/30" onClick={() => updateParams({ assetType: undefined })}>{ASSET_TYPE_LABELS[searchParams.assetType] ?? searchParams.assetType} ×</Badge>}
          <Button variant="ghost" size="sm" className="text-xs h-6 font-semibold hover:bg-secondary/60 text-brand" onClick={() => { setSearch(""); router.push("/buyer/listings"); }}>Reset all</Button>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {isPending ? "Updating Directory..." : `${total.toLocaleString()} Verified Exits Listed`}
        </p>
      </div>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-dashed border-border/80 bg-card/45 rounded-2xl p-6">
          <span className="text-5xl opacity-80">🔍</span>
          <h3 className="font-bold text-foreground mt-2">No exit listings match</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">We couldn't find any Indian business listings matching your current criteria. Try resetting filters.</p>
          <Button variant="outline" className="mt-2 h-9" onClick={() => { setSearch(""); router.push("/buyer/listings"); }}>Clear Filters</Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
            >
              <ListingCardUI listing={listing} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            className="h-8 shadow-xs border-border"
            disabled={page <= 1 || isPending}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-xs font-bold text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shadow-xs border-border"
            disabled={page >= totalPages || isPending}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
