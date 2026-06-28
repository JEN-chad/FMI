"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Handshake, MessageSquare, ArrowRight, FileText, CheckSquare, CircleDollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DealStage } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  stage: DealStage;
  dealValue: unknown;
  createdAt: Date;
  updatedAt: Date;
  listing: { title: string; slug: string };
  buyer: { name: string; email: string; avatarUrl: string | null };
  _count: { messages: number; dealDocuments: number };
}

const STAGE_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  NDA: { label: "NDA Signed", color: "bg-muted text-muted-foreground", step: 1 },
  DUE_DILIGENCE: { label: "Due Diligence", color: "bg-warning/10 text-warning", step: 2 },
  AGREEMENT: { label: "Agreement", color: "bg-brand/10 text-brand", step: 3 },
  ESCROW: { label: "Escrow", color: "bg-info/10 text-info", step: 4 },
  TRANSFER: { label: "Asset Transfer", color: "bg-success/10 text-success", step: 5 },
  CLOSED: { label: "Deal Closed", color: "bg-success/10 text-success", step: 6 },
  CANCELLED: { label: "Cancelled", color: "bg-destructive/10 text-destructive", step: 0 },
};

const STAGES = ["NDA", "DUE_DILIGENCE", "AGREEMENT", "ESCROW", "TRANSFER", "CLOSED"];

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export function SellerDealsClient({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <Handshake className="h-12 w-12 text-muted-foreground/40" />
        <h3 className="font-semibold">No deals yet</h3>
        <p className="text-sm text-muted-foreground">When a buyer accepts your offer, a deal room will be created here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deals.map((deal, i) => {
        const stageCfg = STAGE_CONFIG[deal.stage] ?? STAGE_CONFIG.NDA;
        const currentStep = stageCfg.step;
        const isActive = !["CLOSED", "CANCELLED"].includes(deal.stage);

        return (
          <motion.div key={deal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn("hover:shadow-md transition-shadow", isActive && "border-brand/20")}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={deal.buyer.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs font-bold fmi-gradient text-white">
                      {deal.buyer.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{deal.listing.title}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", stageCfg.color)}>
                        {stageCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Buyer: {deal.buyer.name}</p>

                    {/* Progress bar for active deals */}
                    {deal.stage !== "CANCELLED" && (
                      <div className="flex gap-1 mt-2.5">
                        {STAGES.map((s, si) => (
                          <div
                            key={s}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all",
                              si < currentStep ? "fmi-gradient" : "bg-border"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      {deal._count.messages > 0 && (
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="h-3 w-3 text-brand" />
                          <span className="text-brand font-semibold">{deal._count.messages} unread</span>
                        </span>
                      )}
                      <span className="flex items-center gap-0.5"><FileText className="h-3 w-3" />{deal._count.dealDocuments} docs</span>
                      <span>Updated {formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-2">
                    <p className="font-bold">{formatCurrency(Number(deal.dealValue))}</p>
                    <Link href={`/seller/deals/${deal.id}`}>
                      <Button size="sm" variant={isActive ? "default" : "outline"} className={cn("text-xs", isActive && "fmi-gradient text-white border-0")}>
                        Open Deal <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
