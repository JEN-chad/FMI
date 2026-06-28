"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

const faqs = [
  {
    value: "faq-1",
    question: "What is FMI and how is it different from other platforms?",
    answer: "FMI (Flippa for Modern India) is a trust-first digital business marketplace built specifically for the Indian ecosystem. Unlike generic platforms, we require mandatory identity verification (KYC/GSTIN/PAN), protect sensitive business details with digital NDAs, and secure transactions using integrated escrow services.",
  },
  {
    value: "faq-2",
    question: "Who can buy and sell digital businesses on FMI?",
    answer: "We support Indian SME owners, SaaS founders, eCommerce operators, app developers, and domain holders on the seller side. Buyers include individual digital investors, PE funds, family offices, and corporate acquirers looking for vetted web properties.",
  },
  {
    value: "faq-3",
    question: "How does the KYC and GST verification process work?",
    answer: "During onboarding, buyers and sellers complete a brief KYC check. We validate individual PAN and Aadhaar records, and verify corporate entities using GSTIN and CIN records. Listings are only activated once details are validated by our compliance moderators.",
  },
  {
    value: "faq-4",
    question: "Why do you gate listing details behind an NDA?",
    answer: "To protect founders and their proprietary information. Sensitive details like URL addresses, detailed tax statements, codebase structures, and customer profiles are restricted. Buyers must sign a legally binding digital NDA and have an approved KYC status to unlock these details.",
  },
  {
    value: "faq-5",
    question: "Is there transaction protection or escrow support?",
    answer: "Yes. Once an offer is accepted, FMI Escrow is funded by the buyer. The deposit is held securely in compliance with Indian regulatory practices. Funds are only transferred to the seller after the buyer completes the due diligence checklist and confirms asset handovers.",
  },
  {
    value: "faq-6",
    question: "What are the fees for using the FMI platform?",
    answer: "Listing is free for sellers. Upon a successful transaction, FMI charges a 5% to 8% success fee based on the deal size. Buyers may incur nominal charges for NDA gate fee validations, which are fully credited towards final acquisitions.",
  },
  {
    value: "faq-7",
    question: "How are digital assets transferred during handovers?",
    answer: "FMI provides a structured checklist within the Deal Room. We guide you through transferring source code repositories, domain name registrars, Stripe/merchant gateways, social media profiles, and database access. The compliance manager monitors and approves each milestone.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Common Inquiries
          </h2>
          <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h3>
          <p className="text-base text-zinc-500 dark:text-zinc-400">
            Everything you need to know about KYC compliance, listing rules, NDAs, and escrow protection.
          </p>
        </div>

        {/* Accordion Component */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-900 dark:bg-zinc-950/20"
        >
          <Accordion className="gap-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.value} value={faq.value} className="border-b border-zinc-100 dark:border-zinc-900 py-2.5">
                <AccordionTrigger className="text-base font-bold text-zinc-900 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:no-underline py-2 select-none cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 mt-2">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

      </div>
    </section>
  )
}
