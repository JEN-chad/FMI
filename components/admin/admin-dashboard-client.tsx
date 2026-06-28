"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2, XCircle, Users, List, ShieldCheck, Handshake,
  AlertTriangle, ArrowRight, Clock, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { adminApproveListingAction, adminRejectListingAction, adminApproveKycAction } from "@/actions/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PendingListing {
  id: string;
  title: string;
  assetType: string;
  askingPrice: number;
  createdAt: Date;
  seller: { name: string; email: string };
}

interface PendingKyc {
  id: string;
  status: string;
  createdAt: Date;
  kycType: string;
  user: { name: string; email: string };
}

interface Stats {
  totalUsers: number;
  totalDeals: number;
  listingsByStatus: Record<string, number>;
  kycByStatus: Record<string, number>;
}

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export function AdminDashboardClient({
  stats,
  pendingListings,
  pendingKyc,
}: {
  stats: Stats;
  pendingListings: PendingListing[];
  pendingKyc: PendingKyc[];
}) {
  const [isPending, startTransition] = useTransition();
  const [localListings, setLocalListings] = useState(pendingListings);
  const [localKyc, setLocalKyc] = useState(pendingKyc);

  function handleApproveListing(id: string) {
    startTransition(async () => {
      const result = await adminApproveListingAction(id);
      if (result.success) {
        setLocalListings((prev) => prev.filter((l) => l.id !== id));
        toast.success("Listing approved and is now live!");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRejectListing(id: string) {
    const reason = prompt("Enter rejection reason (min 10 characters):");
    if (!reason || reason.length < 10) return;
    startTransition(async () => {
      const result = await adminRejectListingAction(id, { reason });
      if (result.success) {
        setLocalListings((prev) => prev.filter((l) => l.id !== id));
        toast.success("Listing rejected and seller notified.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleApproveKyc(id: string) {
    startTransition(async () => {
      const result = await adminApproveKycAction(id);
      if (result.success) {
        setLocalKyc((prev) => prev.filter((k) => k.id !== id));
        toast.success("KYC approved! User can now transact.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-brand/10 text-brand" },
    { title: "Live Listings", value: stats.listingsByStatus.LIVE ?? 0, icon: List, color: "bg-success/10 text-success" },
    { title: "Pending KYC", value: stats.kycByStatus.PENDING ?? 0, icon: ShieldCheck, color: "bg-warning/10 text-warning" },
    { title: "Active Deals", value: stats.totalDeals, icon: Handshake, color: "bg-info/10 text-info" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value.toLocaleString()}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl", card.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Listing Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listing Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.listingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs font-medium">{status.replace("_", " ")}</span>
                <Badge variant="secondary" className="text-[10px]">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Pending Listings
                  {localListings.length > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{localListings.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Review and approve seller submissions</CardDescription>
              </div>
              <Link href="/admin/listings">
                <Button variant="ghost" size="sm" className="text-xs text-brand">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {localListings.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-success/40" />
                All listings reviewed. No pending items.
              </div>
            ) : (
              localListings.map((listing) => (
                <div key={listing.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border/80 bg-card">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-[10px] font-bold fmi-gradient text-white">
                      {listing.seller.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{listing.title}</p>
                    <p className="text-[11px] text-muted-foreground">{listing.seller.name} · {formatCurrency(listing.askingPrice)}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-[11px] border-success/30 text-success hover:bg-success/5" disabled={isPending} onClick={() => handleApproveListing(listing.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] border-destructive/30 text-destructive hover:bg-destructive/5" disabled={isPending} onClick={() => handleRejectListing(listing.id)}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending KYC */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  Pending KYC
                  {localKyc.length > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{localKyc.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Verify user identity documents</CardDescription>
              </div>
              <Link href="/admin/kyc">
                <Button variant="ghost" size="sm" className="text-xs text-brand">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {localKyc.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-success/40" />
                All KYC applications reviewed.
              </div>
            ) : (
              localKyc.map((kyc) => (
                <div key={kyc.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border/80 bg-card">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-[10px] font-bold fmi-gradient text-white">
                      {kyc.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{kyc.user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{kyc.user.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] h-4">{kyc.kycType}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-0.5" />
                        {formatDistanceToNow(new Date(kyc.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-[11px] border-success/30 text-success hover:bg-success/5" disabled={isPending} onClick={() => handleApproveKyc(kyc.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] border-destructive/30 text-destructive hover:bg-destructive/5" disabled={isPending}>
                      <XCircle className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

