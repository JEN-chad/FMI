"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  TrendingUp, Handshake, ArrowRight, Eye, Star, Search, PlusCircle,
  Clock, ShieldCheck, CheckCircle2, Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AssetType } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface Stats {
  activeOffers: number;
  activeDeals: number;
  totalOffers: number;
}

interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  assetType: AssetType;
  industry: string;
  askingPrice: number;
  monthlyRevenue: number | null;
  coverImageUrl: string | null;
  ndaRequired: boolean;
  isFeatured: boolean;
  createdAt: Date;
  viewCount: number;
  _count: { offers: number };
}

interface OfferSummary {
  id: string;
  amount: unknown;
  status: string;
  createdAt: Date;
  listing: { title: string; slug: string };
}

interface DealSummary {
  id: string;
  stage: string;
  listing: { title: string; slug: string };
  seller: { name: string };
}

interface BuyerDashboardClientProps {
  stats: Stats;
  recentOffers: OfferSummary[];
  recentDeals: DealSummary[];
  featuredListings: ListingSummary[];
  recentListings: ListingSummary[];
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  SAAS: "SaaS", ECOMMERCE: "eCommerce", APP: "Mobile App", BLOG: "Blog",
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

export function BuyerDashboardClient({
  stats,
  recentOffers,
  recentDeals,
  featuredListings,
  recentListings,
}: BuyerDashboardClientProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: "Active Offers", value: stats.activeOffers, icon: TrendingUp, color: "text-brand bg-brand/10 border-brand/20" },
          { title: "Active Deals", value: stats.activeDeals, icon: Handshake, color: "text-success bg-success/10 border-success/20" },
          { title: "Total Offers Sent", value: stats.totalOffers, icon: Search, color: "text-info bg-info/10 border-info/20" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border border-border/80 bg-card/65 shadow-xs hover:border-brand/20 transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.title}</p>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight">{item.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl border", item.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Featured Businesses */}
      {featuredListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Star className="h-4.5 w-4.5 text-brand fill-brand" />
              Featured Opportunities
            </h2>
            <Link href="/buyer/listings">
              <Button variant="ghost" size="sm" className="text-xs h-8 text-brand font-semibold hover:bg-secondary/50">
                View all listings <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <Link href={`/buyer/listings/${listing.slug}`} key={listing.id} className="block group">
                <Card className="rounded-2xl border border-border/70 bg-card/50 overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-brand/20 hover:shadow-md">
                  <div className="h-36 bg-muted/40 relative overflow-hidden shrink-0">
                    {listing.coverImageUrl ? (
                      <img src={listing.coverImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-3xl opacity-80">
                        {ASSET_TYPE_ICONS[listing.assetType] ?? "💼"}
                      </div>
                    )}
                    {listing.ndaRequired && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-background/95 backdrop-blur-md text-[9px] border border-warning/20 text-warning px-2.5 py-0.5 shadow-sm">
                          🔒 NDA Gated
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">{listing.industry}</p>
                    </div>
                    <div>
                      <Separator className="my-3 opacity-60" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Asking Price</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(listing.askingPrice)}</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px] py-0.5 px-2 tracking-wide font-bold">
                          {ASSET_TYPE_LABELS[listing.assetType] ?? listing.assetType}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Activity + Recents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <Card className="lg:col-span-2 border border-border/80 bg-card/65 backdrop-blur-md shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-foreground">Recently Listed Businesses</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">Fresh acquisition opportunities in India</CardDescription>
            </div>
            <Link href="/buyer/listings">
              <Button variant="ghost" size="sm" className="text-xs h-8 text-brand font-semibold hover:bg-secondary/45">
                Marketplace <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/40">
            {recentListings.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground font-medium">
                No recent listings available.
              </div>
            ) : (
              recentListings.map((listing) => (
                <Link href={`/buyer/listings/${listing.slug}`} key={listing.id} className="block px-6 py-4 hover:bg-secondary/20 transition-all group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1">{listing.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <span className="font-semibold">{ASSET_TYPE_LABELS[listing.assetType] ?? listing.assetType}</span>
                        <span>·</span>
                        <span>{listing.industry}</span>
                        {listing.monthlyRevenue && (
                          <>
                            <span>·</span>
                            <span className="text-success font-semibold">MRR: {formatCurrency(listing.monthlyRevenue)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(listing.askingPrice)}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sidebar Activity */}
        <div className="space-y-6">
          {/* Active Deals */}
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40 mb-3">
              <CardTitle className="text-base font-bold tracking-tight text-foreground">My Active Deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 px-6 pb-6 pt-0">
              {recentDeals.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium border border-dashed border-border rounded-xl">
                  No active deal rooms. Submit an offer to start.
                </div>
              ) : (
                recentDeals.map((deal) => (
                  <Link href={`/buyer/deals/${deal.id}`} key={deal.id} className="block">
                    <div className="p-3.5 rounded-xl border border-border bg-card/45 hover:border-brand/45 hover:shadow-xs transition-all duration-300 flex items-center justify-between group">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand transition-colors">{deal.listing.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">Seller: {deal.seller.name}</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] font-bold tracking-wide capitalize px-2.5 py-0.5 shrink-0 bg-secondary/80 text-foreground/80 border border-border/40">
                        {deal.stage.toLowerCase().replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Offers Sent */}
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40 mb-3">
              <CardTitle className="text-base font-bold tracking-tight text-foreground">Recent Offers Sent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 px-6 pb-6 pt-0">
              {recentOffers.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-medium border border-dashed border-border rounded-xl">
                  No offers sent yet.
                </div>
              ) : (
                recentOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-1">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-semibold text-xs text-foreground truncate">{offer.listing.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs text-success">{formatCurrency(Number(offer.amount))}</p>
                      <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-1.5 uppercase bg-brand/10 text-brand border border-brand/15 mt-1">
                        {offer.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
