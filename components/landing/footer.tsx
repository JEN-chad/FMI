"use client"

import * as React from "react"
import Link from "next/link"
import { Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

export default function Footer() {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }
    setSubscribed(true)
    toast.success("Subscribed to FMI Newsletter!", {
      description: "You'll receive our monthly deal summaries and sector reports.",
    })
    setEmail("")
  }

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200/50 dark:bg-zinc-950 dark:border-zinc-900/50 py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-zinc-200/60 dark:border-zinc-900/60">
          
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2 select-none">
              <div className="flex size-8 items-center justify-center rounded-md bg-zinc-950 text-white font-bold dark:bg-white dark:text-black">
                F
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                FMI
              </span>
            </Link>
            
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-sm">
              FMI is the Indian digital business marketplace designed to facilitate trust-first acquisitions. We verify digital asset founders and PE buyers to make exits smooth, fast, and secure.
            </p>

            {/* Newsletter form */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Subscribe to Sector Reports
              </h4>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  className="h-9 text-xs rounded-lg border-zinc-250 bg-white focus-visible:bg-white dark:border-zinc-800 dark:bg-zinc-950"
                />
                <Button
                  type="submit"
                  disabled={subscribed}
                  size="sm"
                  className="rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 select-none cursor-pointer"
                >
                  {subscribed ? <Check className="size-4" /> : <Send className="size-4" />}
                </Button>
              </form>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Monthly reports on multiples, valuations, and digital M&A trends in India.
              </p>
            </div>
          </div>

          {/* Nav Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: Marketplace */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Marketplace
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><Link href="/buyer/listings" className="hover:text-zinc-950 dark:hover:text-zinc-50">Browse SaaS</Link></li>
                <li><Link href="/buyer/listings" className="hover:text-zinc-950 dark:hover:text-zinc-50">eCommerce</Link></li>
                <li><Link href="/buyer/listings" className="hover:text-zinc-950 dark:hover:text-zinc-50">Content Sites</Link></li>
                <li><Link href="/auth/signup?role=seller" className="hover:text-zinc-950 dark:hover:text-zinc-50">Sell Business</Link></li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Resources
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><a href="#how-it-works" className="hover:text-zinc-950 dark:hover:text-zinc-50">Deal Checklist</a></li>
                <li><a href="#features" className="hover:text-zinc-950 dark:hover:text-zinc-50">Escrow Security</a></li>
                <li><a href="#features" className="hover:text-zinc-950 dark:hover:text-zinc-50">Trust Center</a></li>
                <li><a href="#marketplace-preview" className="hover:text-zinc-950 dark:hover:text-zinc-50">Valuation Index</a></li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><Link href="/terms" className="hover:text-zinc-950 dark:hover:text-zinc-50">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-zinc-50">Privacy Policy</Link></li>
                <li><Link href="/nda-terms" className="hover:text-zinc-950 dark:hover:text-zinc-50">NDA Agreement</Link></li>
                <li><Link href="/escrow-policy" className="hover:text-zinc-950 dark:hover:text-zinc-50">Escrow Policy</Link></li>
              </ul>
            </div>

            {/* Column 4: Platform */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <li><Link href="/about" className="hover:text-zinc-950 dark:hover:text-zinc-50">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-zinc-950 dark:hover:text-zinc-50">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-zinc-950 dark:hover:text-zinc-50">Contact Support</Link></li>
                <li><Link href="/press" className="hover:text-zinc-950 dark:hover:text-zinc-50">Press Kit</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Socials & Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} FMI India Technologies Private Limited. All rights reserved.
          </p>

          <div className="flex gap-4 text-zinc-400 dark:text-zinc-55">
            <a href="https://twitter.com/fmi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white">
              <Twitter className="size-4" />
            </a>
            <a href="https://github.com/fmi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white">
              <Github className="size-4" />
            </a>
            <a href="https://linkedin.com/company/fmi" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white">
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

