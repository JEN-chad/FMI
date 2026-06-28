"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { DollarSign, Users, Clock, Percent } from "lucide-react"

const stats = [
  {
    icon: DollarSign,
    value: "₹150 Cr+",
    label: "Deal Volume Completed",
    description: "Successful exits across SaaS, eCommerce, and digital assets.",
  },
  {
    icon: Users,
    value: "10,000+",
    label: "Registered Acquirers",
    description: "Vetted PE firms, family offices, and HNIs in India.",
  },
  {
    icon: Clock,
    value: "14 Days",
    label: "Avg. Transaction Time",
    description: "From signed Letter of Intent to secure escrow payout.",
  },
  {
    icon: Percent,
    value: "98.7%",
    label: "Listing Vetting Rate",
    description: "PAN, GST and Aadhaar verified company data.",
  },
]

export default function Stats() {
  return (
    <section className="py-16 bg-white dark:bg-black border-y border-zinc-150/60 dark:border-zinc-900/60">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-900 dark:bg-zinc-900/20"
              >
                {/* Floating Glow behind icon */}
                <div className="absolute -top-4 -right-4 size-24 rounded-full bg-emerald-500/5 blur-xl dark:bg-emerald-500/2" />
                
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {stat.value}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {stat.label}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {stat.description}
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
