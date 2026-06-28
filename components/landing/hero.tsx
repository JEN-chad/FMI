"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, TrendingUp, Building2, Lock, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 bg-background transition-colors duration-300">
      {/* Decorative Grid Patterns */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(0.55_0.20_260/3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.20_260/3%)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]" />
      
      {/* Soft Premium Glows */}
      <div className="absolute top-0 left-1/4 -z-10 size-[400px] rounded-full bg-brand/5 blur-3xl dark:bg-brand/3 sm:size-[600px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 size-[350px] rounded-full bg-success/5 blur-3xl dark:bg-success/3 sm:size-[500px]" />

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Tag / Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1 text-xs font-semibold text-brand transition-all hover:bg-brand/10 select-none"
            >
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>India's Secure Digital Business M&A Platform</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.05]"
            >
              Buy and Sell verified <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand via-info to-success bg-clip-text text-transparent dark:from-brand dark:via-info dark:to-success">
                Indian Digital Businesses
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              FMI is the trust-first transactional marketplace built for the Indian ecosystem. We verify identity, validate financial ARR metrics, and manage compliance pipelines so you can transact with confidence.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 rounded-lg px-8 shadow-sm text-sm"
                render={<Link href="/auth/signup" />}
              >
                <span>Acquire a Business</span>
                <ArrowRight className="ml-2 size-4 transition-transform group-hover/button:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 rounded-lg px-8 border-border bg-background/55 text-foreground hover:bg-secondary/40 text-sm"
                render={<Link href="/auth/signup?role=seller" />}
              >
                <span>List for Exit</span>
              </Button>
            </motion.div>

            {/* Quick Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 border-t border-border/60"
            >
              <div className="flex flex-col items-center lg:items-start space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">₹150Cr+</span>
                <span className="text-xs text-muted-foreground font-medium">Total exit transactions</span>
              </div>
              <div className="flex flex-col items-center lg:items-start space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">10,000+</span>
                <span className="text-xs text-muted-foreground font-medium">Vetted acquirers</span>
              </div>
              <div className="flex flex-col items-center lg:items-start space-y-1">
                <span className="text-2xl font-bold tracking-tight text-foreground">100%</span>
                <span className="text-xs text-muted-foreground font-medium">KYC & GSTIN verified</span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Mockup Illustration */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full max-w-[440px] rounded-2xl border border-border bg-card/75 p-6 shadow-2xl backdrop-blur-md dark:bg-card/40"
            >
              {/* Top Bar Decoration */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-border/80" />
                  <span className="size-2.5 rounded-full bg-border/50" />
                  <span className="size-2.5 rounded-full bg-border/30" />
                </div>
                <span className="text-[10px] font-mono font-medium tracking-wider text-muted-foreground uppercase">dealroom-console</span>
              </div>

              {/* Mockup Card 1: Listing Header */}
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm tracking-tight">KonaCoffee India</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">eCommerce • Premium Beverage</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-[10px] font-semibold text-brand">
                  <ShieldCheck className="size-3.5" />
                  <span>Vetted Deal</span>
                </div>
              </div>

              {/* Mockup Card 2: Financial Graph Sim */}
              <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ARR Growth Trend</span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-success">
                    <TrendingUp className="size-3" />
                    <span>+24.8% YoY</span>
                  </div>
                </div>
                <div className="h-16 flex items-end gap-3 pt-3">
                  <div className="flex-1 rounded-md bg-secondary/50 h-[30%] hover:bg-brand/20 transition-all cursor-pointer" />
                  <div className="flex-1 rounded-md bg-secondary/50 h-[45%] hover:bg-brand/20 transition-all cursor-pointer" />
                  <div className="flex-1 rounded-md bg-secondary/50 h-[40%] hover:bg-brand/20 transition-all cursor-pointer" />
                  <div className="flex-1 rounded-md bg-secondary/50 h-[60%] hover:bg-brand/20 transition-all cursor-pointer" />
                  <div className="flex-1 rounded-md bg-secondary/50 h-[75%] hover:bg-brand/20 transition-all cursor-pointer" />
                  <div className="flex-1 rounded-md bg-brand h-[100%] shadow-[0_4px_12px_oklch(0.55_0.20_260/20%)] cursor-pointer" />
                </div>
              </div>

              {/* Mockup Card 3: Deal Ledger & Escrow Status */}
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <span className="text-muted-foreground font-medium">Asking Price</span>
                  <span className="font-bold text-foreground">₹1,85,00,000</span>
                </div>
                
                {/* Active Escrow Status Card */}
                <div className="rounded-xl border border-success/15 bg-success/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="size-3.5 text-success" />
                      <span className="text-xs font-bold text-foreground">Escrow Account Ledger</span>
                    </div>
                    <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[9px] font-bold uppercase text-success tracking-wider">
                      Funded
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Verification Deposit</span>
                    <span className="text-sm font-bold text-foreground">₹18,50,000</span>
                  </div>
                </div>

                {/* Offer Negotiation Mockup */}
                <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-foreground">HNI Investor Offer</p>
                      <p className="text-[9px] text-muted-foreground">Upfront 80% + Earnout 20%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="rounded-md px-2.5 py-1 text-[10px] font-bold bg-success text-success-foreground hover:opacity-90 select-none cursor-pointer transition-all active:scale-95 shadow-xs">
                      Accept
                    </button>
                    <button className="rounded-md px-2.5 py-1 text-[10px] font-bold border border-border bg-background hover:bg-secondary/40 text-foreground select-none cursor-pointer transition-all active:scale-95">
                      Counter
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Glowing decorative backdrop element */}
            <div className="absolute -bottom-8 -right-8 -z-10 size-48 rounded-full bg-brand/10 blur-3xl dark:bg-brand/5" />
          </div>

        </div>
      </div>
    </section>
  )
}
