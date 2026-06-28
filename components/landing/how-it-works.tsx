"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCheck, ShieldCheck, FileSignature, Landmark, Send, ArrowRightLeft, FileUp, Sparkles, MessagesSquare, CheckCircle } from "lucide-react"

const buyerSteps = [
  {
    icon: UserCheck,
    title: "1. Vetting & KYC Onboarding",
    description: "Submit PAN and Aadhaar. FMI validates your credentials instantly in the background so sellers know you are a genuine investor.",
  },
  {
    icon: ShieldCheck,
    title: "2. Browse Verified Data",
    description: "Search SaaS and eCommerce businesses with actual Stripe-linked revenues and verified GSTIN reports.",
  },
  {
    icon: FileSignature,
    title: "3. Sign Digital NDA",
    description: "Digitally sign a Non-Disclosure Agreement with one click to unlock private credentials, pitch decks, and URLs.",
  },
  {
    icon: Send,
    title: "4. Make Structured Offers",
    description: "Submit acquisition offers detailing upfront payments, earnout schedules, and escrow terms directly via the platform.",
  },
  {
    icon: Landmark,
    title: "5. Safe Escrow Funding",
    description: "Lock deal funds securely in FMI Escrow. Funds are not released to the seller until due diligence matches expectations.",
  },
  {
    icon: ArrowRightLeft,
    title: "6. Managed Handover",
    description: "FMI monitors the transfer of codebases, domains, and payment keys. Once complete, escrow is released, and ownership is transferred.",
  },
]

const sellerSteps = [
  {
    icon: FileUp,
    title: "1. Create Verified Listing",
    description: "Enter your industry metrics, link your Stripe account, and upload tax/analytics proofs. Our system compiles a professional listing summary.",
  },
  {
    icon: Sparkles,
    title: "2. Platform Moderation",
    description: "FMI compliance team reviews your business records and verifies details. Once approved, the listing goes live to vetted buyers.",
  },
  {
    icon: FileSignature,
    title: "3. Gate Sensitive Files",
    description: "Review and approve NDA requests from registered investors. Control who sees your codebase, pitch deck, and domain details.",
  },
  {
    icon: MessagesSquare,
    title: "4. Deal Room Negotiations",
    description: "Communicate directly with interested buyers via FMI's secure messaging console. Send offers and negotiate terms safely.",
  },
  {
    icon: Landmark,
    title: "5. Escrow Deposited",
    description: "Buyer deposits purchase funds into our secure escrow vault. FMI notifies you that the funds are secured before you transfer any assets.",
  },
  {
    icon: CheckCircle,
    title: "6. Confirm Exited Payout",
    description: "Complete asset handover checklists. FMI verifies transfer, releases escrow funds to your bank account, and the deal is closed.",
  },
]

export default function HowItWorks() {
  const [roleTab, setRoleTab] = React.useState<"buyer" | "seller">("buyer")

  const activeSteps = roleTab === "buyer" ? buyerSteps : sellerSteps

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Heading and Toggles */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left lg:sticky lg:top-24">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              The Protocol
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50 leading-tight">
              A Structured Path <br /> From Discovery to Exit
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
              We replace chaotic spreadsheet sharing and unsafe bank transfers with a compliance-driven, role-based transaction workflow.
            </p>

            {/* Toggle Switch */}
            <div className="inline-flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
              <button
                onClick={() => setRoleTab("buyer")}
                className={`rounded-full px-6 py-2 text-xs font-bold select-none cursor-pointer transition-colors ${
                  roleTab === "buyer"
                    ? "bg-zinc-950 text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                For Buyers
              </button>
              <button
                onClick={() => setRoleTab("seller")}
                className={`rounded-full px-6 py-2 text-xs font-bold select-none cursor-pointer transition-colors ${
                  roleTab === "seller"
                    ? "bg-zinc-950 text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                For Sellers
              </button>
            </div>
          </div>

          {/* Right Column: Step list */}
          <div className="lg:col-span-7 relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-zinc-100 dark:bg-zinc-900 -z-10" />

            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={roleTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {activeSteps.map((step, idx) => {
                    const Icon = step.icon
                    return (
                      <div key={step.title} className="flex gap-4 relative group">
                        
                        {/* Step Icon Container */}
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-800/50 group-hover:bg-zinc-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                          <Icon className="size-5" />
                        </div>

                        {/* Step Description */}
                        <div className="space-y-1.5 pt-1.5">
                          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {step.title}
                          </h4>
                          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-lg">
                            {step.description}
                          </p>
                        </div>

                      </div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
