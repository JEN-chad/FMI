import * as React from "react"
import NavbarLanding from "@/components/landing/navbar-landing"
import Hero from "@/components/landing/hero"
import Stats from "@/components/landing/stats"
import Features from "@/components/landing/features"
import MarketplacePreview from "@/components/landing/marketplace-preview"
import Categories from "@/components/landing/categories"
import HowItWorks from "@/components/landing/how-it-works"
import Testimonials from "@/components/landing/testimonials"
import FAQ from "@/components/landing/faq"
import Footer from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black transition-colors duration-300">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] size-[80%] rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/2" />
        <div className="absolute top-[30%] -right-[30%] size-[80%] rounded-full bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/2" />
        <div className="absolute -bottom-[20%] -left-[10%] size-[70%] rounded-full bg-teal-500/5 blur-[120px] dark:bg-teal-500/2" />
      </div>

      {/* Floating Navbar */}
      <NavbarLanding />

      {/* Main Content Layout */}
      <main className="flex-1">
        {/* Hero Area with interactive dashboard element */}
        <Hero />

        {/* Traction Statistics Panel */}
        <Stats />

        {/* Trust Gated features section */}
        <Features />

        {/* Marketplace preview table/feed */}
        <MarketplacePreview />

        {/* Asset business categories */}
        <Categories />

        {/* How it works (stepper pipeline) */}
        <HowItWorks />

        {/* Founders and investors testimonials */}
        <Testimonials />

        {/* Interactive FAQ accordion */}
        <FAQ />
      </main>

      {/* Footer Area with news signups and social links */}
      <Footer />
    </div>
  )
}
