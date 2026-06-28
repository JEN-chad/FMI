"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  TrendingUp, Handshake, ArrowRight, DollarSign, CheckCircle2,
  XCircle, Clock, MessageSquare, RotateCcw, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { acceptOfferAction, rejectOfferAction, counterOfferAction } from "@/actions/offers";
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
  buyer: { name: string; email: string; avatarUrl: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  COUNTERED: { label: "Countered", color: "bg-brand/10 text-brand border-brand/20", icon: RotateCcw },
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

export function SellerOffersClient({ offers, stats }: { offers: Offer[]; stats: Record<string, number> }) {
  const [isPending, startTransition] = useTransition();
  const [localOffers, setLocalOffers] = useState(offers);
  const [activeTab, setActiveTab] = useState<"ALL" | OfferStatus>("ALL");

  const filtered = activeTab === "ALL" ? localOffers : localOffers.filter((o) => o.status === activeTab);

  function handleAccept(offerId: string) {
    startTransition(async () => {
      const result = await acceptOfferAction(offerId);
      if (result.success) {
        setLocalOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "ACCEPTED" as OfferStatus } : o));
        toast.success("Offer accepted! A deal room has been created.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReject(offerId: string) {
    startTransition(async () => {
      const result = await rejectOfferAction(offerId);
      if (result.success) {
        setLocalOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: "REJECTED" as OfferStatus } : o));
        toast.success("Offer rejected.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleCounter(offerId: string) {
    const amount = prompt("Enter your counter offer amount (₹):");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const message = prompt("Add a message (optional):") ?? "";
    startTransition(async () => {
      const result = await counterOfferAction(offerId, { counterAmount: Number(amount), counterMessage: message });
      if (result.success) {
        toast.success("Counter offer sent to buyer.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const tabs = [
    { value: "ALL", label: "All Offers", count: offers.length },
    { value: "PENDING", label: "Pending", count: stats.pending },
    { value: "COUNTERED", label: "Countered", count: stats.countered },
    { value: "ACCEPTED", label: "Accepted", count: stats.accepted },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending", value: stats.pending, color: "bg-warning/10 text-warning" },
          { label: "Countered", value: stats.countered, color: "bg-brand/10 text-brand" },
          { label: "Accepted", value: stats.accepted, color: "bg-success/10 text-success" },
          { label: "Rejected", value: stats.rejected, color: "bg-muted text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color.split(" ")[1])}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as "ALL" | OfferStatus)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.value ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 font-bold", activeTab === tab.value ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Offers */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <TrendingUp className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No offers in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((offer, i) => {
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
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={offer.buyer.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs font-bold fmi-gradient text-white">
                          {offer.buyer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{offer.buyer.name}</p>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", cfg.color)}>
                            <StatusIcon className="h-3 w-3" /> {cfg.label}
                          </span>
                        </div>
                        <Link href={`/seller/listings/${offer.listing.slug}`} className="text-xs text-brand hover:underline">
                          {offer.listing.title}
                        </Link>
                        {offer.message && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 bg-muted/40 rounded-lg p-2">
                            "{offer.message}"
                          </p>
                        )}
                        {isCountered && offer.counterMessage && (
                          <p className="text-xs text-brand mt-1.5 line-clamp-2 bg-brand/5 rounded-lg p-2">
                            Counter: "{offer.counterMessage}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold">{formatCurrency(displayAmount)}</p>
                        <p className="text-[11px] text-muted-foreground">{pct}% of asking</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isPendingOffer && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button size="sm" variant="outline" className="flex-1 border-success/30 text-success hover:bg-success/5 text-xs" disabled={isPending} onClick={() => handleAccept(offer.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Accept Offer
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs" disabled={isPending} onClick={() => handleCounter(offer.id)}>
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Counter
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 text-xs" disabled={isPending} onClick={() => handleReject(offer.id)}>
                          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                        </Button>
                      </div>
                    )}
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

