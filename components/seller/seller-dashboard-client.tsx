"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  TrendingUp, Eye, BarChart3, Handshake, PlusCircle, ArrowRight,
  ArrowUpRight, DollarSign, List, Clock, CheckCircle2, AlertCircle,
  FileText, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AssetType, ListingStatus, DealStage } from "@prisma/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  totalListings: number;
  liveListings: number;
  draftListings: number;
  pendingListings: number;
  totalViews: number;
  pendingOffers: number;
  activeDeals: number;
  monthlyRevenue: number;
}

interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  status: ListingStatus;
  askingPrice: number;
  viewCount: number;
  assetType: AssetType;
  coverImageUrl: string | null;
  monthlyRevenue: number | null;
  createdAt: Date;
  publishedAt: Date | null;
  _count: { offers: number };
}

interface OfferSummary {
  id: string;
  amount: unknown;
  status: string;
  createdAt: Date;
  listing: { title: string; slug: string };
  buyer: { name: string; avatarUrl: string | null };
}

interface DealSummary {
  id: string;
  stage: DealStage;
  dealValue: unknown;
  createdAt: Date;
  updatedAt: Date;
  listing: { title: string; slug: string };
  buyer: { name: string; avatarUrl: string | null };
}

interface SellerDashboardClientProps {
  stats: Stats;
  listings: ListingSummary[];
  recentOffers: OfferSummary[];
  recentDeals: DealSummary[];
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ─── Status Badges ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  LIVE: { label: "Live", variant: "default", color: "bg-success/10 text-success border-success/20" },
  DRAFT: { label: "Draft", variant: "secondary", color: "bg-muted text-muted-foreground border-border" },
  IN_REVIEW: { label: "In Review", variant: "outline", color: "bg-warning/10 text-warning border-warning/20" },
  PAUSED: { label: "Paused", variant: "secondary", color: "bg-muted text-muted-foreground border-border" },
  SOLD: { label: "Sold", variant: "default", color: "bg-brand/10 text-brand border-brand/20" },
  REJECTED: { label: "Rejected", variant: "destructive", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const DEAL_STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  NDA: { label: "NDA Signed", color: "bg-muted text-muted-foreground" },
  DUE_DILIGENCE: { label: "Due Diligence", color: "bg-warning/10 text-warning" },
  AGREEMENT: { label: "Agreement", color: "bg-brand/10 text-brand" },
  ESCROW: { label: "Escrow", color: "bg-info/10 text-info" },
  TRANSFER: { label: "Transfer", color: "bg-success/10 text-success" },
  CLOSED: { label: "Closed", color: "bg-success/10 text-success" },
  CANCELLED: { label: "Cancelled", color: "bg-destructive/10 text-destructive" },
};

// ─── Mock chart data (replace with real analytics later) ─────────────────────

function generateViewsData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, i) => ({
    month,
    views: Math.floor(Math.random() * 800 + 200 + i * 100),
    offers: Math.floor(Math.random() * 12 + i * 2),
  }));
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  positive?: boolean;
  href?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, change, positive, href, color = "bg-brand/10 text-brand border-brand/20" }: StatCardProps) {
  const content = (
    <Card className="group border border-border/80 bg-card/65 shadow-xs hover:border-brand/20 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
            {change && (
              <div className={cn("flex items-center gap-1 text-[11px] font-semibold", positive ? "text-success" : "text-destructive")}>
                <ArrowUpRight className={cn("h-3 w-3", !positive && "rotate-180")} />
                {change}
              </div>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl border", color)}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
        {href && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-brand font-semibold hover:underline">
            View details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SellerDashboardClient({ stats, listings, recentOffers, recentDeals }: SellerDashboardClientProps) {
  const viewsData = generateViewsData();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Live Listings"
          value={stats.liveListings}
          icon={List}
          href="/seller/listings"
          color="bg-success/10 text-success border-success/20"
          change="+2 this month"
          positive
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          color="bg-brand/10 text-brand border-brand/20"
          change="+18% this week"
          positive
        />
        <StatCard
          title="Pending Offers"
          value={stats.pendingOffers}
          icon={TrendingUp}
          href="/seller/offers"
          color="bg-warning/10 text-warning border-warning/20"
        />
        <StatCard
          title="Active Deals"
          value={stats.activeDeals}
          icon={Handshake}
          href="/seller/deals"
          color="bg-info/10 text-info border-info/20"
        />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard title="Draft Listings" value={stats.draftListings} icon={FileText} color="bg-secondary text-muted-foreground border-border" />
        <StatCard title="In Review" value={stats.pendingListings} icon={Clock} color="bg-warning/10 text-warning border-warning/20" />
        <StatCard title="Total Revenue" value={formatCurrency(stats.monthlyRevenue)} icon={DollarSign} color="bg-success/10 text-success border-success/20" />
        <StatCard title="Total Listings" value={stats.totalListings} icon={BarChart3} color="bg-brand/10 text-brand border-brand/20" />
      </motion.div>

      {/* Charts + Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Views Chart */}
        <Card className="lg:col-span-2 border border-border/80 bg-card/65 backdrop-blur-md">
          <CardHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground tracking-tight">Listing Performance</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">Exit page views and incoming offers (6 Months)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={viewsData} margin={{ top: 0, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.20 260)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(0.55 0.20 260)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="offersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.15 150)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(0.62 0.15 150)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" className="text-[10px] text-muted-foreground font-semibold" tickLine={false} axisLine={false} />
                <YAxis className="text-[10px] text-muted-foreground font-semibold" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="oklch(0.55 0.20 260)" fill="url(#viewsGrad)" strokeWidth={2} name="Page Views" />
                <Area type="monotone" dataKey="offers" stroke="oklch(0.62 0.15 150)" fill="url(#offersGrad)" strokeWidth={2} name="Offers" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border/80 bg-card/65 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/40 mb-3">
            <CardTitle className="text-base font-bold text-foreground tracking-tight">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 px-6 pb-6 pt-0">
            {[
              { label: "Create Exit Listing", href: "/seller/listings/new", icon: PlusCircle, color: "text-brand bg-brand/10 border-brand/15" },
              { label: "Review incoming bids", href: "/seller/offers", icon: TrendingUp, color: "text-warning bg-warning/10 border-warning/15" },
              { label: "Manage Active Deals", href: "/seller/deals", icon: Handshake, color: "text-success bg-success/10 border-success/15" },
              { label: "Compliance Document Vault", href: "/seller/documents", icon: FileText, color: "text-info bg-info/10 border-info/15" },
              { label: "Export Exit Analytics", href: "/seller/analytics", icon: BarChart3, color: "text-muted-foreground bg-secondary border-border/40" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 border border-transparent hover:border-border/50 transition-all group cursor-pointer"
                  >
                    <div className={cn("p-1.5 rounded-lg border", action.color)}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </div>
                    <span className="text-xs font-bold text-foreground flex-1">{action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                  </motion.div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Listings + Offers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Recent Listings */}
        <Card className="border border-border/80 bg-card/65 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/40 mb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground tracking-tight">My Exit Listings</CardTitle>
              <Link href="/seller/listings">
                <Button variant="ghost" size="sm" className="text-xs h-8 text-brand font-semibold hover:bg-secondary/50">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 px-6 pb-6 pt-0">
            {listings.length === 0 ? (
              <div className="text-center py-8 space-y-2 border border-dashed border-border rounded-xl">
                <List className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">No listings yet</p>
                <Link href="/seller/listings/new">
                  <Button size="sm" className="mt-2 h-8">Create Exit Listing</Button>
                </Link>
              </div>
            ) : (
              listings.slice(0, 5).map((listing) => {
                const cfg = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.DRAFT;
                return (
                  <Link key={listing.id} href={`/seller/listings/${listing.id}`}>
                    <div className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-secondary/30 transition-all group border border-transparent hover:border-border/40">
                      <div className="h-9 w-9 rounded-lg fmi-gradient text-white flex items-center justify-center text-sm font-extrabold shrink-0 shadow-xs">
                        {listing.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-brand transition-colors">{listing.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground font-semibold">{formatCurrency(listing.askingPrice)}</span>
                          <span className="text-[11px] text-muted-foreground/50">·</span>
                          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">
                            <Eye className="h-3 w-3" /> {listing.viewCount} views
                          </span>
                        </div>
                      </div>
                      <span className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0", cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Offers */}
        <Card className="border border-border/80 bg-card/65 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/40 mb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground tracking-tight">Incoming Bids</CardTitle>
              <Link href="/seller/offers">
                <Button variant="ghost" size="sm" className="text-xs h-8 text-brand font-semibold hover:bg-secondary/50">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 px-6 pb-6 pt-0">
            {recentOffers.length === 0 ? (
              <div className="text-center py-8 space-y-2 border border-dashed border-border rounded-xl">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">No incoming offers yet</p>
                <p className="text-xs text-muted-foreground/60">Bids from verified buyers will appear here</p>
              </div>
            ) : (
              recentOffers.map((offer) => (
                <Link key={offer.id} href={`/seller/offers`}>
                  <div className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-secondary/30 transition-colors group border border-transparent hover:border-border/40">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={offer.buyer.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[10px] font-bold fmi-gradient text-white">
                        {offer.buyer.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-bold text-foreground truncate">{offer.buyer.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{offer.listing.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-success">
                        {formatCurrency(Number(offer.amount))}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                        {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Deals Pipeline */}
      {recentDeals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground tracking-tight">Deal Pipeline</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">Active closing rooms across transfer stages</CardDescription>
                </div>
                <Link href="/seller/deals">
                  <Button variant="ghost" size="sm" className="text-xs h-8 text-brand font-semibold hover:bg-secondary/50">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <div className="space-y-3.5">
                {recentDeals.map((deal) => {
                  const stageCfg = DEAL_STAGE_CONFIG[deal.stage] ?? { label: deal.stage, color: "bg-muted text-muted-foreground" };
                  return (
                    <Link key={deal.id} href={`/seller/deals/${deal.id}`}>
                      <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card/45 hover:border-brand/40 hover:shadow-xs transition-all group">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={deal.buyer.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-[10px] font-bold fmi-gradient text-white">
                            {deal.buyer.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-xs font-bold text-foreground truncate">{deal.listing.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Acquirer: {deal.buyer.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground">{formatCurrency(Number(deal.dealValue))}</p>
                          <span className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 tracking-wide uppercase border border-transparent", stageCfg.color)}>
                            {stageCfg.label}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-brand transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
