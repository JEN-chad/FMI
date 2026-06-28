"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, DollarSign, Info } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createOfferAction } from "@/actions/offers";
import { toast } from "sonner";

const OfferSchema = z.object({
  amount: z.coerce.number().positive("Offer amount must be positive"),
  upfrontPercent: z.coerce.number().min(0).max(100).default(100),
  earnoutPercent: z.coerce.number().min(0).max(100).default(0),
  earnoutTerms: z.string().optional(),
  message: z.string().min(10, "Please include a message of at least 10 characters"),
});

interface OfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  askingPrice: number;
}

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export function OfferModal({ open, onOpenChange, listingId, listingTitle, askingPrice }: OfferModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<{
    amount: number;
    upfrontPercent: number;
    earnoutPercent: number;
    earnoutTerms?: string;
    message: string;
  }>({
    resolver: zodResolver(OfferSchema) as any,
    defaultValues: {
      amount: askingPrice,
      upfrontPercent: 100,
      earnoutPercent: 0,
      message: "",
    },
  });

  const amount = watch("amount");
  const upfrontPct = watch("upfrontPercent");
  const earnoutPct = watch("earnoutPercent");
  const offerVsAsking = amount ? ((Number(amount) / askingPrice) * 100).toFixed(0) : "0";

  function onSubmit(data: any) {
    startTransition(async () => {
      const result = await createOfferAction({
        listingId,
        amount: data.amount,
        upfrontPercent: data.upfrontPercent,
        earnoutPercent: data.earnoutPercent,
        earnoutTerms: data.earnoutTerms,
        message: data.message,
      });
      if (result.success) {
        toast.success("Offer submitted! The seller will be notified.");
        onOpenChange(false);
        router.push("/buyer/offers");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-brand" /> Make an Offer
          </DialogTitle>
          <DialogDescription>
            For: <span className="font-medium text-foreground">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Asking Price Context */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Asking price: <span className="font-semibold text-foreground">{formatCurrency(askingPrice)}</span></span>
          </div>

          {/* Offer Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Your Offer Amount (INR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">₹</span>
              <Input id="amount" type="number" className="pl-7" {...register("amount")} />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            {amount > 0 && (
              <p className="text-xs text-muted-foreground">
                {Number(offerVsAsking) >= 100 ? "✅ At or above asking price" : `${offerVsAsking}% of asking price`}
              </p>
            )}
          </div>

          {/* Payment Structure */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="upfrontPercent">Upfront % *</Label>
              <Input id="upfrontPercent" type="number" min="0" max="100" {...register("upfrontPercent")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="earnoutPercent">Earnout %</Label>
              <Input id="earnoutPercent" type="number" min="0" max="100" {...register("earnoutPercent")} />
            </div>
          </div>

          {Number(earnoutPct) > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="earnoutTerms">Earnout Terms</Label>
              <Textarea id="earnoutTerms" rows={2} placeholder="e.g. 20% earnout over 12 months based on revenue targets..." {...register("earnoutTerms")} />
            </div>
          )}

          <Separator />

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">Message to Seller *</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Introduce yourself and explain your interest. Why is this a good fit? What's your acquisition experience?"
              {...register("message")}
            />
            {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
          </div>

          {/* Summary */}
          <div className="p-3 rounded-xl bg-brand/5 border border-brand/20 space-y-1.5 text-sm">
            <p className="font-semibold text-brand">Offer Summary</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Offer</span>
              <span className="font-bold">{amount ? formatCurrency(Number(amount)) : "—"}</span>
            </div>
            {Number(upfrontPct) < 100 && amount > 0 && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Upfront ({upfrontPct}%)</span>
                  <span className="font-medium">{formatCurrency(Number(amount) * Number(upfrontPct) / 100)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Earnout ({earnoutPct}%)</span>
                  <span className="font-medium">{formatCurrency(Number(amount) * Number(earnoutPct) / 100)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 fmi-gradient text-white" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {isPending ? "Submitting..." : "Submit Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
