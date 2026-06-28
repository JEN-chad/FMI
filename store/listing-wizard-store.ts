"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AssetType, PricingModel, DocumentType } from "@prisma/client";

// Step data types
export interface Step1Data {
  title: string;
  businessNamePrivate: string;
  assetType: AssetType;
  industry: string;
  businessModel: string;
  description: string;
  tagline: string;
  businessUrl: string;
  yearEstablished: number | null;
  teamSize: number | null;
  hoursPerWeek: number | null;
}

export interface Step2Data {
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  monthlyTraffic: number | null;
  trafficSources: string;
}

export interface Step3Data {
  trafficSources: string;
  monthlyTraffic: number | null;
}

export interface Step4Data {
  // Domains, social accounts, etc. (stored as tags/metadata)
  tags: string[];
  coverImageUrl: string;
}

export interface Step5Data {
  askingPrice: number;
  reservePrice: number | null;
  pricingModel: PricingModel;
  ndaRequired: boolean;
  ndaFee: number;
  reasonForSale: string;
}

export interface Step6Data {
  uploadedDocuments: Array<{
    type: DocumentType;
    name: string;
    url: string;
    cloudinaryId?: string;
    isPrivate: boolean;
  }>;
}

export interface ListingWizardState {
  // Current saved listing ID (null if not yet created)
  listingId: string | null;
  currentStep: number;
  totalSteps: number;
  lastSavedAt: Date | null;

  // Step data
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  step4: Partial<Step4Data>;
  step5: Partial<Step5Data>;
  step6: Partial<Step6Data>;

  // Actions
  setListingId: (id: string) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep3: (data: Partial<Step3Data>) => void;
  updateStep4: (data: Partial<Step4Data>) => void;
  updateStep5: (data: Partial<Step5Data>) => void;
  updateStep6: (data: Partial<Step6Data>) => void;
  markSaved: () => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  listingId: null,
  currentStep: 0,
  totalSteps: 6,
  lastSavedAt: null,
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {
    pricingModel: PricingModel.CLASSIFIED,
    ndaRequired: true,
    ndaFee: 0,
    askingPrice: 0,
  },
  step6: { uploadedDocuments: [] },
};

export const useListingWizardStore = create<ListingWizardState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setListingId: (id) => set({ listingId: id }),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
      updateStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
      updateStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } })),
      updateStep3: (data) => set((s) => ({ step3: { ...s.step3, ...data } })),
      updateStep4: (data) => set((s) => ({ step4: { ...s.step4, ...data } })),
      updateStep5: (data) => set((s) => ({ step5: { ...s.step5, ...data } })),
      updateStep6: (data) => set((s) => ({ step6: { ...s.step6, ...data } })),
      markSaved: () => set({ lastSavedAt: new Date() }),
      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: "fmi-listing-wizard",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        listingId: state.listingId,
        currentStep: state.currentStep,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        step4: state.step4,
        step5: state.step5,
        step6: state.step6,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
