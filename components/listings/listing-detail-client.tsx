"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Lock, Eye, TrendingUp, Users, Globe, Building2, Calendar,
  DollarSign, ChevronRight, ArrowLeft, Send, FileText, CheckCircle2,
  Sparkles, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NdaModal } from "@/components/documents/nda-modal";
import { OfferModal } from "@/components/deal-room/offer-modal";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AssetType } from "@prisma/client";

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

interface Listing {
  id: string;
  title: string;
  slug: string;
  assetType: AssetType;
  industry: string;
  businessModel: string | null;
  description: string | null;
  tagline: string | null;
  yearEstablished: number | null;
  teamSize: number | null;
  hoursPerWeek: number | null;
  askingPrice: number;
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  monthlyTraffic: number | null;
  trafficSources: string | null;
  ndaRequired: boolean;
  ndaFee: number;
  isFeatured: boolean;
  tags: string[];
  coverImageUrl: string | null;
  viewCount: number;
  reasonForSale: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  seller: { id: string; name: string; createdAt: Date };
  documents: Array<{ id: string; type: string; name: string; url: string; isPrivate: boolean }>;
  _count: { offers: number; ndaAgreements: number };
}

interface Props {
  listing: Listing;
  currentUserId: string;
  hasNda: boolean;
  isOwner: boolean;
  existingOfferId: string | null;
}

export function ListingDetailClient({ listing, currentUserId, hasNda, isOwner, existingOfferId }: Props) {
  const [ndaOpen, setNdaOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [localHasNda, setLocalHasNda] = useState(hasNda);

  const revenueMultiple = listing.monthlyRevenue
    ? (listing.askingPrice / (listing.monthlyRevenue * 12)).toFixed(1)
    : null;

  const publicDocs = listing.documents.filter((d) => !d.isPrivate);
  const privateDocs = listing.documents.filter((d) => d.isPrivate);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Link href="/buyer/listings" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Marketplace
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        <span className="text-foreground truncate max-w-64">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <Card className="overflow-hidden border border-border bg-card/65 backdrop-blur-md">
            {/* Cover */}
            <div className="h-64 relative bg-gradient-to-br from-brand/10 via-secondary/40 to-brand/5">
              {listing.coverImageUrl ? (
                <img src={listing.coverImageUrl} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-7xl opacity-85">
                  {ASSET_TYPE_ICONS[listing.assetType] ?? "💼"}
                </div>
              )}
              {listing.isFeatured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-brand text-brand-foreground border-0 text-xs font-extrabold px-3 py-1 shadow-sm">
                    <Sparkles className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 border border-border/30">
                    {ASSET_TYPE_ICONS[listing.assetType]} {ASSET_TYPE_LABELS[listing.assetType] ?? listing.assetType}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5">{listing.industry}</Badge>
                  {listing.ndaRequired && (
                    <Badge variant="outline" className="text-[10px] font-bold tracking-wide border-warning/20 text-warning px-2.5 py-0.5">
                      🔒 NDA Required
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">{listing.title}</h1>
                {listing.tagline && <p className="text-sm sm:text-base text-muted-foreground italic font-medium">"{listing.tagline}"</p>}
              </div>

              <Separator className="opacity-60" />

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Asking Price", value: formatCurrency(listing.askingPrice), icon: DollarSign, color: "text-foreground" },
                  { label: "Monthly Revenue", value: listing.monthlyRevenue ? formatCurrency(listing.monthlyRevenue) : "N/A", icon: TrendingUp, color: "text-success" },
                  { label: "Monthly Traffic", value: listing.monthlyTraffic ? `${(listing.monthlyTraffic / 1000).toFixed(0)}K` : "N/A", icon: Globe, color: "text-brand" },
                  { label: "Team Size", value: listing.teamSize ? `${listing.teamSize} people` : "Solo", icon: Users, color: "text-muted-foreground" },
                ].map((metric, idx) => {
                  const Icon = metric.icon;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-secondary/35 border border-border/50 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={cn("p-1 rounded-lg bg-background/80 shadow-xs")}>
                          <Icon className={cn("h-3.5 w-3.5", metric.color)} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                      </div>
                      <p className={cn("text-base font-extrabold tracking-tight mt-1", metric.color)}>{metric.value}</p>
                      {metric.label === "Asking Price" && revenueMultiple && (
                        <p className="text-[9px] text-muted-foreground/80 font-bold mt-1.5">{revenueMultiple}× ARR multiple</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40 mb-3">
              <CardTitle className="text-base font-extrabold tracking-tight">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {listing.description ?? "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40 mb-3"><CardTitle className="text-base font-extrabold tracking-tight">Business Overview</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {[
                  { label: "Year Founded", value: listing.yearEstablished },
                  { label: "Business Model", value: listing.businessModel },
                  { label: "Hours/Week Required", value: listing.hoursPerWeek ? `${listing.hoursPerWeek} hrs` : null },
                  { label: "Monthly Profit", value: listing.monthlyProfit ? formatCurrency(listing.monthlyProfit) : null },
                  { label: "Traffic Sources", value: listing.trafficSources },
                  { label: "Listed Date", value: formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) },
                ]
                  .filter((d) => d.value)
                  .map((detail, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{detail.label}</p>
                      <p className="text-sm font-semibold text-foreground">{detail.value}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40 mb-3"><CardTitle className="text-base font-extrabold tracking-tight">Investment Documents</CardTitle></CardHeader>
            <CardContent className="space-y-3.5 px-6 pb-6 pt-0">
              {publicDocs.length === 0 && privateDocs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No documents uploaded for this exit.</p>
              )}
              {/* Public Docs */}
              {publicDocs.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/30 hover:border-brand/45 hover:bg-secondary/40 transition-all group"
                >
                  <FileText className="h-4.5 w-4.5 text-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5 tracking-wider font-semibold">{doc.type.toLowerCase().replace("_", " ")}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-brand transition-colors" />
                </a>
              ))}

              {/* Private Docs (NDA Gate) */}
              {privateDocs.length > 0 && (
                <div className={cn("rounded-xl border p-5 text-center space-y-4 transition-all duration-300", localHasNda ? "border-success/20 bg-success/5" : "border-dashed border-border bg-muted/10")}>
                  {localHasNda ? (
                    <>
                      <div className="flex items-center justify-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-xs font-bold tracking-tight">NDA Agreement Signed — Confidential Vault Open</span>
                      </div>
                      <div className="space-y-2">
                        {privateDocs.map((doc) => (
                          <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-success/15 bg-card/45 hover:bg-success/5 transition-all group"
                          >
                            <FileText className="h-4.5 w-4.5 text-success shrink-0" />
                            <span className="text-xs font-semibold flex-1 text-left truncate text-foreground">{doc.name}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-success" />
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 space-y-3.5">
                      <Lock className="h-7 w-7 text-warning mx-auto opacity-80" />
                      <div>
                        <p className="text-xs font-bold text-foreground tracking-tight">Gated Documents ({privateDocs.length})</p>
                        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">Financial tax audits, customer cohorts, and proprietary source records require an executed NDA to view.</p>
                      </div>
                      <Button size="sm" onClick={() => setNdaOpen(true)} className="h-8 shadow-xs">
                        Unlock Gated Documents
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar Panel */}
        <div className="space-y-6 lg:col-span-1">
          {/* Exit Action Card */}
          <Card className="border border-border/80 bg-card/65 shadow-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Deal Execution</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Asking Exit Value</p>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">{formatCurrency(listing.askingPrice)}</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {isOwner ? (
                  <Link href={`/seller/listings/${listing.id}/edit`} className="block">
                    <Button className="w-full h-10 shadow-xs">Edit Exit Parameters</Button>
                  </Link>
                ) : localHasNda ? (
                  existingOfferId ? (
                    <Link href={`/buyer/deals/${existingOfferId}`} className="block">
                      <Button className="w-full h-10 shadow-xs bg-success text-success-foreground hover:bg-success/90">
                        View Active Deal Room
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={() => setOfferOpen(true)} className="w-full h-10 shadow-xs">
                      Make Acquisition Offer
                    </Button>
                  )
                ) : (
                  <Button onClick={() => setNdaOpen(true)} className="w-full h-10 shadow-xs">
                    Sign NDA to Access
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold pt-2 border-t border-border/40">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.viewCount} views</span>
                <span>·</span>
                <span>{listing._count.offers} bids received</span>
              </div>
            </CardContent>
          </Card>

          {/* Seller profile */}
          <Card className="border border-border/80 bg-card/65 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Founder Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="fmi-gradient text-xs font-bold text-white uppercase">
                    {listing.seller.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{listing.seller.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Verified Seller</p>
                </div>
              </div>
              <div className="flex gap-2 items-center text-[10px] text-muted-foreground font-semibold pt-1 border-t border-border/30">
                <Building2 className="h-3.5 w-3.5" />
                <span>On FMI since {new Date(listing.seller.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* NDA Modal Gating */}
      <NdaModal
        open={ndaOpen}
        onOpenChange={setNdaOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        ndaFee={listing.ndaFee}
        onSuccess={() => {
          setLocalHasNda(true);
        }}
      />

      {/* Acquisition Offer Modal */}
      <OfferModal
        open={offerOpen}
        onOpenChange={setOfferOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        askingPrice={listing.askingPrice}
      />
    </div>
  );
}
