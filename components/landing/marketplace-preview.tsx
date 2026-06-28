"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, ShieldCheck, Check, Info, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Listing {
  id: string
  title: string
  maskedTitle: string
  type: "SaaS" | "eCommerce" | "Content" | "App"
  industry: string
  askingPrice: string
  monthlyRevenue: string
  monthlyProfit: string
  multiple: string
  established: number
  description: string
  verifiedGST: boolean
  verifiedStripe: boolean
  verifiedKYC: boolean
}

const mockListings: Listing[] = [
  {
    id: "l1",
    title: "LogiTrack India - Logistics SaaS",
    maskedTitle: "Project LogiTrack [NDA Protected]",
    type: "SaaS",
    industry: "Supply Chain & Logistics",
    askingPrice: "₹1,85,00,000",
    monthlyRevenue: "₹14,50,000",
    monthlyProfit: "₹5,20,000",
    multiple: "3.2x ARR",
    established: 2022,
    description: "B2B SaaS platform automating local delivery dispatching and warehousing routes for mid-market Indian enterprises. Highly sticky client base.",
    verifiedGST: true,
    verifiedStripe: true,
    verifiedKYC: true,
  },
  {
    id: "l2",
    title: "ChaiVibe - D2C Beverage Brand",
    maskedTitle: "Project ChaiVibe [NDA Protected]",
    type: "eCommerce",
    industry: "Food & Beverage",
    askingPrice: "₹72,00,000",
    monthlyRevenue: "₹8,90,000",
    monthlyProfit: "₹2,40,000",
    multiple: "2.5x EBITDA",
    established: 2023,
    description: "High-growth direct-to-consumer specialty tea brand with 65% repeat purchase rates and strong Instagram presence in tier-1 metro cities.",
    verifiedGST: true,
    verifiedStripe: false,
    verifiedKYC: true,
  },
  {
    id: "l3",
    title: "FinGyaan - Financial Planning Portal",
    maskedTitle: "Project FinGyaan [NDA Protected]",
    type: "Content",
    industry: "Personal Finance & Media",
    askingPrice: "₹45,00,000",
    monthlyRevenue: "₹4,10,000",
    monthlyProfit: "₹3,00,000",
    multiple: "1.25x Revenue",
    established: 2021,
    description: "Ad-revenue and affiliate-supported finance blog focusing on tax planning and mutual funds for young Indian millennials.",
    verifiedGST: false,
    verifiedStripe: false,
    verifiedKYC: true,
  },
  {
    id: "l4",
    title: "FitTrack - Workout Companion App",
    maskedTitle: "Project FitTrack [NDA Protected]",
    type: "App",
    industry: "Health & Fitness",
    askingPrice: "₹95,00,000",
    monthlyRevenue: "₹9,80,000",
    monthlyProfit: "₹3,40,000",
    multiple: "2.8x Profit",
    established: 2022,
    description: "Subscription-based android and iOS app tracking calorie inputs and workout routines with local language support. 50k+ active users.",
    verifiedGST: true,
    verifiedStripe: true,
    verifiedKYC: true,
  },
]

export default function MarketplacePreview() {
  const [activeTab, setActiveTab] = React.useState<"All" | "SaaS" | "eCommerce" | "Content" | "App">("All")
  const [selectedListing, setSelectedListing] = React.useState<Listing | null>(null)
  const [submittingNDA, setSubmittingNDA] = React.useState(false)
  const [termsAccepted, setTermsAccepted] = React.useState(false)

  const filteredListings = mockListings.filter(
    (listing) => activeTab === "All" || listing.type === activeTab
  )

  const handleNDASign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      toast.error("Please accept the terms of the Non-Disclosure Agreement.")
      return
    }
    setSubmittingNDA(true)
    setTimeout(() => {
      setSubmittingNDA(false)
      toast.success("Demo NDA Signed Successfully!", {
        description: "In production, this would grant you immediate access to verified documents and financials.",
      })
      setSelectedListing(null)
      setTermsAccepted(false)
    }, 1500)
  }

  return (
    <section id="marketplace-preview" className="py-20 md:py-28 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Opportunities
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
              Vetted Digital Assets on Marketplace
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Explore digital businesses listed directly by verified Indian founders. Sign NDA to unlock due diligence files, URLs, and tax filings.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 self-start md:self-auto">
            {(["All", "SaaS", "eCommerce", "Content", "App"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold select-none cursor-pointer transition-colors ${
                  activeTab === tab
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-55"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/20 p-6 hover:shadow-lg dark:border-zinc-900 dark:bg-zinc-950/20 transition-all duration-300"
              >
                {/* NDA Lock overlay hint on hover */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                  <Lock className="size-3" />
                  <span>NDA Gated</span>
                </div>

                <div className="space-y-4">
                  {/* Top Stats */}
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      {listing.type}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Est. {listing.established}</span>
                  </div>

                  {/* Masked / Private Title */}
                  <div>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {listing.maskedTitle}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{listing.industry}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Key Metrics Panel */}
                  <div className="grid grid-cols-3 gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/40">
                    <div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Asking Price</p>
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{listing.askingPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Mo. Profit</p>
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{listing.monthlyProfit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Multiple</p>
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{listing.multiple}</p>
                    </div>
                  </div>

                  {/* Verification Flags */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {listing.verifiedKYC && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="size-3" />
                        <span>KYC Verified</span>
                      </div>
                    )}
                    {listing.verifiedGST && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="size-3" />
                        <span>GSTIN Vetted</span>
                      </div>
                    )}
                    {listing.verifiedStripe && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="size-3" />
                        <span>Stripe Linked</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <Button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full h-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 select-none cursor-pointer"
                  >
                    <Lock className="mr-1.5 size-3.5" />
                    <span>Sign NDA to Reveal Details</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* NDA Modal Overlay */}
        <AnimatePresence>
          {selectedListing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Mutual Non-Disclosure Agreement</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedListing(null)
                      setTermsAccepted(false)
                    }}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    &times;
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleNDASign} className="mt-4 space-y-4">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 flex items-start gap-2.5">
                    <Info className="size-4 shrink-0 mt-0.5" />
                    <p>
                      You are requesting access to <strong>{selectedListing.maskedTitle}</strong>. In compliance with FMI standards, you must digitally sign this NDA.
                    </p>
                  </div>

                  {/* Summary Text Box */}
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-[11px] leading-relaxed text-zinc-600 dark:border-zinc-900 dark:bg-zinc-900 dark:text-zinc-400">
                    <p className="font-semibold mb-2">NDA terms summary:</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li><strong>Confidentiality:</strong> The Buyer agrees to hold all business financials, operations logs, private assets, and client profiles in strict confidence.</li>
                      <li><strong>Permitted Use:</strong> Information provided is solely for the purpose of evaluating the acquisition of the listed digital assets.</li>
                      <li><strong>Non-Circumvention:</strong> The Buyer agrees not to contact employees, clients, or vendors of the Seller directly, nor bypass FMI transaction systems.</li>
                      <li><strong>Term:</strong> This agreement is binding for a period of 2 years from today's signature timestamp.</li>
                    </ol>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="nda-consent"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 size-4 rounded border-zinc-300 text-emerald-600 dark:border-zinc-800"
                    />
                    <label htmlFor="nda-consent" className="text-xs text-zinc-600 dark:text-zinc-400">
                      I agree to the terms of the Non-Disclosure Agreement and confirm that my verified profile (KYC status: Approved) is accurate.
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedListing(null)
                        setTermsAccepted(false)
                      }}
                      className="flex-1 h-10 border-zinc-200 dark:border-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingNDA}
                      className="flex-1 h-10 bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 select-none cursor-pointer"
                    >
                      {submittingNDA ? "Signing..." : "Sign & Unlock"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}
