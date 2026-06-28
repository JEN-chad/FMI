"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldAlert, FileText, CheckCircle2, Lock, MessageSquare, ClipboardList } from "lucide-react"

const features = [
  {
    icon: ShieldAlert,
    title: "Mandatory KYC & Verification",
    description: "Every buyer and seller must verify their identities using Aadhaar, PAN, and GSTIN before listing or bidding. Zero fake listings allowed.",
    gradient: "from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10",
  },
  {
    icon: FileText,
    title: "Automated NDA Gating",
    description: "Detailed financial reports, business URLs, and assets are hidden behind a legally binding NDA. Signed digitally with one-click consent.",
    gradient: "from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10",
  },
  {
    icon: Lock,
    title: "Secure Escrow Protection",
    description: "Transaction milestones are protected via automated escrow. Funds are locked securely and only released when both parties confirm asset handover.",
    gradient: "from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10",
  },
  {
    icon: ClipboardList,
    title: "Structured Deal Rooms",
    description: "No more messy email threads. Track due diligence, legal agreements, and handovers through an interactive, step-by-step role-based deal board.",
    gradient: "from-pink-500/20 to-rose-500/20 dark:from-pink-500/10 dark:to-rose-500/10",
  },
  {
    icon: FileText,
    title: "Watermarked Document Vault",
    description: "Sellers upload sensitive tax records, GST logs, and analytics screenshots to our secure vault. Files are dynamically watermarked to prevent leaks.",
    gradient: "from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10",
  },
  {
    icon: MessageSquare,
    title: "Encrypted Secure Messaging",
    description: "Discuss deal terms, conduct Q&A, and negotiate offers through our secure, real-time messaging console with built-in document attachment support.",
    gradient: "from-violet-500/20 to-fuchsia-500/20 dark:from-violet-500/10 dark:to-fuchsia-500/10",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-24">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Enterprise Grade Security
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
            Built on Trust, Gated by Verification
          </h3>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Traditional marketplaces suffer from fake listings, leak sensitive founder data, and offer no transaction safety. FMI fixes this at every layer.
          </p>
        </div>

        {/* Bento/Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white p-8 hover:shadow-xl hover:border-zinc-300 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:border-zinc-800 transition-all duration-300"
              >
                {/* Glowing Hover Background Gradient */}
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Top Corner Badge for Aesthetics */}
                <div className="absolute top-8 right-8 text-zinc-200 dark:text-zinc-800 group-hover:text-emerald-500/20 transition-colors">
                  <CheckCircle2 className="size-6" />
                </div>

                <div className="space-y-4">
                  {/* Icon */}
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-950 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-200 dark:group-hover:bg-zinc-50 dark:group-hover:text-black transition-all">
                    <Icon className="size-5" />
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {feature.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {feature.description}
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
