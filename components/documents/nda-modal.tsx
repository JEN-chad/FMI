"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CreditCard, CheckCircle2, FileText, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signNdaAction } from "@/actions/listings";
import { toast } from "sonner";

interface NdaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  ndaFee: number;
  onSuccess: () => void;
}

type Step = "review" | "payment" | "success";

export function NdaModal({ open, onOpenChange, listingId, listingTitle, ndaFee, onSuccess }: NdaModalProps) {
  const [step, setStep] = useState<Step>("review");
  const [agreed, setAgreed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAgreeAndSign() {
    if (ndaFee > 0) {
      setStep("payment");
    } else {
      // Free NDA — sign immediately
      startTransition(async () => {
        const result = await signNdaAction(listingId);
        if (result.success) {
          setStep("success");
          toast.success("NDA signed! Documents unlocked.");
          setTimeout(() => {
            onSuccess();
            onOpenChange(false);
            setStep("review");
            setAgreed(false);
          }, 2000);
        } else {
          toast.error(result.error);
        }
      });
    }
  }

  function handleSimulatePayment() {
    // In dev: simulate payment success
    startTransition(async () => {
      const result = await signNdaAction(listingId, `mock_payment_${Date.now()}`, ndaFee);
      if (result.success) {
        setStep("success");
        toast.success("Payment successful! NDA signed and documents unlocked.");
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setStep("review");
          setAgreed(false);
        }, 2500);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand" />
            Sign Non-Disclosure Agreement
          </DialogTitle>
          <DialogDescription>
            For: <span className="font-medium text-foreground">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "review" && (
            <motion.div key="review" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                <p className="font-semibold">Non-Disclosure Agreement</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By signing this NDA, you ("Buyer") agree to maintain strict confidentiality regarding all
                  proprietary business information disclosed by the Seller in connection with the acquisition
                  of the above-referenced business listing on FMI (Flippa for Modern India).
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You agree that: (1) All disclosed information will be used solely for evaluation purposes.
                  (2) You will not share, copy, or distribute any confidential materials. (3) This agreement
                  remains in effect for 24 months from the date of signing. (4) Breach of this agreement
                  may result in legal action under applicable Indian law.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This agreement is governed by the laws of India, and any disputes shall be subject to the
                  exclusive jurisdiction of courts in Mumbai, Maharashtra.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-brand cursor-pointer"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I have read and agree to the terms of this Non-Disclosure Agreement
                </span>
              </label>

              <Separator />

              {ndaFee > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">NDA Unlock Fee</span>
                  <span className="font-bold text-foreground">₹{ndaFee.toLocaleString()}</span>
                </div>
              )}

              <Button
                className="w-full fmi-gradient text-white"
                disabled={!agreed || isPending}
                onClick={handleAgreeAndSign}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                {ndaFee > 0 ? `Proceed to Payment (₹${ndaFee.toLocaleString()})` : "Sign NDA (Free)"}
              </Button>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="p-4 rounded-xl border border-brand/20 bg-brand/5 text-center space-y-2">
                <CreditCard className="h-8 w-8 text-brand mx-auto" />
                <p className="font-semibold">Payment Gateway</p>
                <p className="text-xs text-muted-foreground">Razorpay Integration (Test Mode)</p>
                <p className="text-2xl font-bold">₹{ndaFee.toLocaleString()}</p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="text-xs">In production, this will open Razorpay checkout with UPI, Cards, Net Banking support.</p>
              </div>

              <Button className="w-full fmi-gradient text-white" disabled={isPending} onClick={handleSimulatePayment}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                {isPending ? "Processing..." : "Simulate Payment (Dev Mode)"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("review")}>← Back</Button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center space-y-3">
              <div className="h-16 w-16 rounded-full fmi-gradient flex items-center justify-center mx-auto shadow-lg shadow-brand/30">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">NDA Signed!</h3>
              <p className="text-sm text-muted-foreground">
                Private documents are now unlocked. The seller has been notified of your interest.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

