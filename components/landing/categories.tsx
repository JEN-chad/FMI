"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Monitor, ShoppingBag, Smartphone, BookOpen, Globe2, Briefcase } from "lucide-react"

const categories = [
  {
    icon: Monitor,
    title: "B2B & B2C SaaS",
    multiples: "3.5x – 5.5x ARR",
    deals: "12 Completed",
    description: "Subscription software businesses with recurring billing histories, low churn metrics, and high margin scalability.",
    color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5",
  },
  {
    icon: ShoppingBag,
    title: "eCommerce & D2C",
    multiples: "2.2x – 3.5x EBITDA",
    deals: "28 Completed",
    description: "Shopify stores, Amazon FBA, or custom D2C brands with inventory logistics, stable suppliers, and loyal customer cohorts.",
    color: "from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    multiples: "2.5x – 4.0x Profit",
    deals: "8 Completed",
    description: "iOS and Android apps monetized via in-app purchases, Apple/Google subscriptions, or SDK-based ad revenues.",
    color: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5",
  },
  {
    icon: BookOpen,
    title: "Content & Blogs",
    multiples: "1.5x – 3.0x Revenue",
    deals: "19 Completed",
    description: "Ad-revenue, sponsorship, and affiliate-heavy publications, newsletters, or blogs with organic SEO domain authorities.",
    color: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/5 dark:to-rose-500/5",
  },
  {
    icon: Globe2,
    title: "Premium Domains",
    multiples: "Valuation-Based",
    deals: "42 Completed",
    description: "High-value brandable domains, single-word .in/.com assets, or traffic-generating legacy redirect URLs.",
    color: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5",
  },
  {
    icon: Briefcase,
    title: "Digital Agencies",
    multiples: "1.8x – 2.8x EBITDA",
    deals: "7 Completed",
    description: "Software dev houses, design agencies, or SEO consultancies with recurring retainer clients and systemized staffing workflows.",
    color: "from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/5 dark:to-fuchsia-500/5",
  },
]

export default function Categories() {
  return (
    <section id="categories" className="py-20 md:py-28 bg-background border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
            Market Sectors
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Find the Business Vertical for Your Portfolio
          </h3>
          <p className="text-sm text-muted-foreground">
            India's digital marketplace is highly diversified. Review current transaction multiples and average sizes across critical business types.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, idx) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-brand/20 hover:shadow-md"
              >
                {/* Visual Icon Accent */}
                <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl ${category.color} rounded-bl-full`} />

                <div className="space-y-4">
                  {/* Icon */}
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="size-5" />
                  </div>

                  {/* Title and multiple badge */}
                  <div>
                    <h4 className="text-base font-bold text-foreground tracking-tight">
                      {category.title}
                    </h4>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs font-semibold text-brand">
                        {category.multiples}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">•</span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {category.deals}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
