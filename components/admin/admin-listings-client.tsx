"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Eye, ArrowRight, ExternalLink, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApproveListingAction, adminRejectListingAction } from "@/actions/admin";
import { toast } from "sonner";
import { ListingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  slug: string;
  askingPrice: number;
  monthlyRevenue: number | null;
  assetType: string;
  industry: string;
  status: ListingStatus;
  createdAt: Date;
  seller: {
    name: string;
    email: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  LIVE: { label: "Live", color: "bg-success/10 text-success border-success/20" },
  DRAFT: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  IN_REVIEW: { label: "Pending Review", color: "bg-warning/10 text-warning border-warning/20" },
  APPROVED: { label: "Approved", color: "bg-success/10 text-success border-success/20" },
  REJECTED: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20" },
  PAUSED: { label: "Paused", color: "bg-muted text-muted-foreground border-border" },
  SOLD: { label: "Sold", color: "bg-brand/10 text-brand border-brand/20" },
};

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export function AdminListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const [listings, setListings] = useState(initialListings);
  const [filter, setFilter] = useState<"ALL" | ListingStatus>("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = filter === "ALL" ? listings : listings.filter((l) => l.status === filter);

  function handleApprove(id: string) {
    startTransition(async () => {
      const result = await adminApproveListingAction(id);
      if (result.success) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: ListingStatus.LIVE } : l))
        );
        toast.success("Listing approved!");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReject(id: string) {
    const reason = prompt("Enter rejection reason (min 10 characters):");
    if (!reason || reason.length < 10) return;
    startTransition(async () => {
      const result = await adminRejectListingAction(id, { reason });
      if (result.success) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: ListingStatus.REJECTED } : l))
        );
        toast.success("Listing rejected.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {["ALL", "IN_REVIEW", "LIVE", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={cn(
              "px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap",
              filter === tab ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No listings found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => {
            const cfg = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.DRAFT;
            return (
              <Card key={listing.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                      <Badge variant="outline" className={cn("text-[10px] font-bold border", cfg.color)}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>Seller: {listing.seller.name}</span>
                      <span>·</span>
                      <span className="font-semibold text-foreground">{formatCurrency(listing.askingPrice)}</span>
                      {listing.monthlyRevenue && <span>MRR: {formatCurrency(listing.monthlyRevenue)}</span>}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {listing.status === ListingStatus.IN_REVIEW && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] border-success/30 text-success hover:bg-success/5" disabled={isPending} onClick={() => handleApprove(listing.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] border-destructive/30 text-destructive hover:bg-destructive/5" disabled={isPending} onClick={() => handleReject(listing.id)}>
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    <Link href={`/buyer/listings/${listing.slug}`}>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] text-brand">
                        <ExternalLink className="h-3 w-3 mr-1" /> Preview
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

