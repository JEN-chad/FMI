"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, ShieldCheck } from "lucide-react"

const testimonials = [
  {
    quote: "FMI completely changed how digital transactions are done in India. The KYC and GST integration meant we only spoke to verified, qualified buyers. We closed our exit in just 16 days.",
    author: "Rohan Deshmukh",
    role: "Founder, LogiTrack India",
    exitDetails: "Exited B2B SaaS for ₹1.85Cr",
    rating: 5,
    avatar: "RD",
  },
  {
    quote: "As an angel investor, finding reliable dealflow in the Indian SaaS space was challenging. FMI's digital NDAs and structured document vaults allowed me to due-diligence financials with total confidence.",
    author: "Ananya Sen",
    role: "Partner, Malabar Capital",
    exitDetails: "Acquired 3 Digital Assets",
    rating: 5,
    avatar: "AS",
  },
  {
    quote: "We were looking to expand our D2C portfolio. Using FMI, we acquired an established Shopify beverage brand. The escrow ledger protected our token deposit throughout the transition phase.",
    author: "Vikram Malhotra",
    role: "M&A Director, BrandScale",
    exitDetails: "Acquired ChaiVibe eCommerce",
    rating: 5,
    avatar: "VM",
  },
  {
    quote: "The biggest issue on other platforms is fake listings and tyre-kickers. FMI solves this by gating financials behind PAN and GST checks. An investor-grade platform that India desperately needed.",
    author: "Preeti Nair",
    role: "Founder, EdGlow Learning",
    exitDetails: "Exited EdTech App for ₹92L",
    rating: 5,
    avatar: "PN",
  },
  {
    quote: "FMI's step-by-step Deal Room is incredibly polished. Having the legal contract templates, secure file sharing, and escrow milestones all in one page made the transaction process stress-free.",
    author: "Kabir Mehta",
    role: "Serial Entrepreneur",
    exitDetails: "Exited 2 Micro-SaaS Assets",
    rating: 5,
    avatar: "KM",
  },
  {
    quote: "I bought my first micro-SaaS on FMI. The support team walked us through the domain and Stripe account handovers. The escrow was held safely until I confirmed everything was working.",
    author: "Devendra Patil",
    role: "Independent Indie Hacker",
    exitDetails: "Acquired HabitHero App",
    rating: 5,
    avatar: "DP",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Trust & Exits
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
            Stories from Verified Founders & Investors
          </h3>
          <p className="text-base text-zinc-500 dark:text-zinc-400">
            Read how Indian digital entrepreneurs are finding liquidity and PE funds are securing vetted deal flow.
          </p>
        </div>

        {/* Masonry/Grid of Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Details */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <ShieldCheck className="size-4 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-1.5 py-0.2 rounded w-fit">
                    {t.exitDetails}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
