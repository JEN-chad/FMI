"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  TrendingUp, Handshake, ArrowRight, DollarSign, CheckCircle2,
  XCircle, Clock, RotateCcw, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { acceptOfferAction, rejectOfferAction, withdrawOfferAction } from "@/actions/offers";
import { toast } from "sonner";
import { OfferStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  amount: unknown;
  counterAmount: unknown;
  status: OfferStatus;
  message: string | null;
  counterMessage: string | null;
  upfrontPercent: unknown;
  earnoutPercent: unknown;
  expiresAt: Date | null;
  createdAt: Date;
  listing: { id: string; title: string; slug: string; askingPrice: unknown };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending Review", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  COUNTERED: { label: "Counter Offer Received", color: "bg-brand/10 text-brand border-brand/20", icon: RotateCcw },
  ACCEPTED: { label: "Accepted", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  EXPIRED: { label: "Expired", color: "bg-muted text-muted-foreground border-border", icon: Clock },
  WITHDRAWN: { label: "Withdrawn", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export function BuyerOffersClient({ offers }: { offers: Offer[] }) {
  const [isPending, startTransition] = useTransition();
  const [localOffers, setLocalOffers] = useState(offers);

  function handleWithdraw(offerId: string) {
    if (!confirm("Are you sure you want to withdraw this offer?")) return;
    startTransition(async () => {
      const result = await withdrawOfferAction(offerId);
      if (result.success) {
        setLocalOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "WITHDRAWN" as OfferStatus } : o));
        toast.success("Offer withdrawn successfully.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleAcceptCounter(offerId: string) {
    startTransition(async () => {
      const result = await acceptOfferAction(offerId);
      if (result.success) {
        setLocalOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "ACCEPTED" as OfferStatus } : o));
        toast.success("Counter offer accepted! Deal Room is ready.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRejectCounter(offerId: string) {
    startTransition(async () => {
      const result = await rejectOfferAction(offerId);
      if (result.success) {
        setLocalOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "REJECTED" as OfferStatus } : o));
        toast.success("Counter offer rejected.");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (localOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground/40" />
        <h3 className="font-semibold">No offers sent</h3>
        <p className="text-sm text-muted-foreground">Submit an offer on any business listing to get started.</p>
        <Link href="/buyer/listings">
          <Button className="fmi-gradient text-white">Browse Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localOffers.map((offer, i) => {
        const cfg = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.PENDING;
        const StatusIcon = cfg.icon;
        const isPendingOffer = offer.status === OfferStatus.PENDING;
        const isCountered = offer.status === OfferStatus.COUNTERED;
        const displayAmount = isCountered && offer.counterAmount
          ? Number(offer.counterAmount)
          : Number(offer.amount);
        const askingPrice = Number(offer.listing.askingPrice);
        const pct = askingPrice ? Math.round((displayAmount / askingPrice) * 100) : 0;

        return (
          <motion.div key={offer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn("hover:shadow-sm transition-shadow", isCountered && "border-brand/35 bg-brand/5")}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/buyer/listings/${offer.listing.slug}`} className="font-semibold text-sm hover:text-brand hover:underline truncate">
                        {offer.listing.title}
                      </Link>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0", cfg.color)}>
                        <StatusIcon className="h-3 w-3" /> {cfg.label}
                      </span>
                    </div>

                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Asking: {formatCurrency(askingPrice)}</span>
                      <span>·</span>
                      <span>Offer Upfront: {Number(offer.upfrontPercent)}%</span>
                      {Number(offer.earnoutPercent) > 0 && (
                        <>
                          <span>·</span>
                          <span>Earnout: {Number(offer.earnoutPercent)}%</span>
                        </>
                      )}
                    </div>

                    {offer.message && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/40 rounded-lg p-2 max-w-2xl">
                        "Your message: {offer.message}"
                      </p>
                    )}

                    {isCountered && offer.counterMessage && (
                      <p className="text-xs text-brand mt-2 bg-brand/10 border border-brand/20 rounded-lg p-2 max-w-2xl font-medium">
                        Seller Counter Message: "{offer.counterMessage}"
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{formatCurrency(displayAmount)}</p>
                    <p className="text-[11px] text-muted-foreground">{pct}% of asking</p>
                    {isCountered && (
                      <Badge variant="outline" className="text-[9px] mt-0.5 border-brand/30 text-brand">
                        Counter Offer
                      </Badge>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {(isPendingOffer || isCountered) && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border justify-end">
                    {isPendingOffer && (
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 text-xs" disabled={isPending} onClick={() => handleWithdraw(offer.id)}>
                        Withdraw Offer
                      </Button>
                    )}
                    {isCountered && (
                      <>
                        <Button size="sm" className="fmi-gradient text-white text-xs" disabled={isPending} onClick={() => handleAcceptCounter(offer.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Accept Counter
                        </Button>
                        <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 text-xs" disabled={isPending} onClick={() => handleRejectCounter(offer.id)}>
                          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject Counter
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" disabled={isPending} onClick={() => handleWithdraw(offer.id)}>
                          Withdraw
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

