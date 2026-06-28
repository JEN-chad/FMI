"use client";

import { useState, useEffect, startTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, User, CreditCard, ArrowRight, ArrowLeft, 
  CheckCircle2, Clock, Save, FileText, Camera, 
  Loader2, Globe, HelpCircle, Check, Briefcase, MapPin, 
  TrendingUp, Award, DollarSign
} from "lucide-react";
import { z } from "zod";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { saveKycDraftAction, submitKycAction, submitBuyerProfileAction, getKycDraftAction } from "@/actions/kyc.actions";
import { KycType } from "@prisma/client";

// Form schemas for steps
const step1Schema = z.object({
  kycType: z.enum(["INDIVIDUAL", "COMPANY"]),
});

const step2Schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid Indian PAN format (e.g. ABCDE1234F)"),
  aadhaarLast4: z.string().regex(/^\d{4}$/, "Must be the last 4 digits of Aadhaar (e.g. 1234)"),
  panDocUrl: z.string().url("Please upload your PAN card document"),
  aadhaarDocUrl: z.string().url("Please upload your Aadhaar document"),
});

const step3Schema = z.object({
  selfieUrl: z.string().url("Please upload a selfie photo"),
});

const step4Schema = z.object({
  bankAccountName: z.string().min(2, "Bank account holder name is required"),
  bankAccountNumber: z.string().min(8, "Invalid bank account number (must be at least 8 digits)"),
  bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid Indian Bank IFSC code format (e.g. SBIN0001234)"),
});

const step5Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  cin: z.string().regex(/^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/, "Invalid Corporate Identification Number (CIN) format"),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, "Invalid GSTIN format"),
  companyPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid Company PAN format"),
  directorName: z.string().min(2, "Director name is required"),
});

const step6Schema = z.object({
  investorType: z.enum(["INDIVIDUAL", "PE_FUND", "FAMILY_OFFICE", "CORPORATE"]),
  industries: z.array(z.string()).min(1, "Select at least one target industry"),
  states: z.array(z.string()).min(1, "Select at least one state of operation"),
  budgetMin: z.number().int().nonnegative("Budget minimum must be non-negative"),
  budgetMax: z.number().int().positive("Budget maximum must be positive"),
  acquisitionGoal: z.string().min(10, "Acquisition goal details must be at least 10 characters"),
  experienceLevel: z.enum(["FIRST_TIME", "SOME", "EXPERIENCED", "SERIAL"]),
});

const industriesList = [
  "SaaS", "E-commerce", "Mobile Apps", "Content Blogs", "Domain Names", 
  "Agency/Services", "Web3/Crypto", "AI/ML Startups", "Marketplaces"
];

const statesList = [
  "Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Telangana", 
  "Gujarat", "West Bengal", "Haryana", "Kerala", "Other States"
];

export function KycWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<"BUYER" | "SELLER" | "BOTH">("BUYER");
  const [kycStatus, setKycStatus] = useState<string>("NOT_STARTED");

  // Step state
  const [activeStep, setActiveStep] = useState(0);

  // Form hooks
  const step1Form = useForm({ resolver: zodResolver(step1Schema), defaultValues: { kycType: "INDIVIDUAL" as const } });
  const step2Form = useForm({ resolver: zodResolver(step2Schema), defaultValues: { panNumber: "", aadhaarLast4: "", panDocUrl: "", aadhaarDocUrl: "" } });
  const step3Form = useForm({ resolver: zodResolver(step3Schema), defaultValues: { selfieUrl: "" } });
  const step4Form = useForm({ resolver: zodResolver(step4Schema), defaultValues: { bankAccountName: "", bankAccountNumber: "", bankIfsc: "" } });
  const step5Form = useForm({ resolver: zodResolver(step5Schema), defaultValues: { companyName: "", cin: "", gstin: "", companyPan: "", directorName: "" } });
  
  const step6Form = useForm({ 
    resolver: zodResolver(step6Schema), 
    defaultValues: { 
      investorType: "INDIVIDUAL" as const, 
      industries: [] as string[], 
      states: [] as string[], 
      budgetMin: 50000, 
      budgetMax: 500000, 
      acquisitionGoal: "", 
      experienceLevel: "FIRST_TIME" as const 
    } 
  });

  const selectedKycType = step1Form.watch("kycType");

  // Load draft on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await getKycDraftAction();
        if (res.success && res.data) {
          const { kycType, role, kycStatus: dbStatus, kycProfile, buyerProfile } = res.data;
          
          setUserRole(role as any);
          setKycStatus(dbStatus);

          if (kycType) {
            step1Form.setValue("kycType", kycType as any);
          }

          if (kycProfile) {
            if (kycProfile.panNumber) step2Form.setValue("panNumber", kycProfile.panNumber);
            if (kycProfile.aadhaarLast4) step2Form.setValue("aadhaarLast4", kycProfile.aadhaarLast4);
            if (kycProfile.panDocUrl) step2Form.setValue("panDocUrl", kycProfile.panDocUrl);
            if (kycProfile.aadhaarDocUrl) step2Form.setValue("aadhaarDocUrl", kycProfile.aadhaarDocUrl);
            
            if (kycProfile.selfieUrl) step3Form.setValue("selfieUrl", kycProfile.selfieUrl);

            if (kycProfile.bankAccountName) step4Form.setValue("bankAccountName", kycProfile.bankAccountName);
            if (kycProfile.bankAccountNumber) step4Form.setValue("bankAccountNumber", kycProfile.bankAccountNumber);
            if (kycProfile.bankIfsc) step4Form.setValue("bankIfsc", kycProfile.bankIfsc);

            if (kycProfile.companyName) step5Form.setValue("companyName", kycProfile.companyName);
            if (kycProfile.cin) step5Form.setValue("cin", kycProfile.cin);
            if (kycProfile.gstin) step5Form.setValue("gstin", kycProfile.gstin);
            if (kycProfile.companyPan) step5Form.setValue("companyPan", kycProfile.companyPan);
            if (kycProfile.directorName) step5Form.setValue("directorName", kycProfile.directorName);
          }

          if (buyerProfile) {
            if (buyerProfile.investorType) step6Form.setValue("investorType", buyerProfile.investorType as any);
            if (buyerProfile.industries) step6Form.setValue("industries", buyerProfile.industries);
            if (buyerProfile.states) step6Form.setValue("states", buyerProfile.states);
            if (buyerProfile.budgetMin) step6Form.setValue("budgetMin", buyerProfile.budgetMin);
            if (buyerProfile.budgetMax) step6Form.setValue("budgetMax", buyerProfile.budgetMax);
            if (buyerProfile.acquisitionGoal) step6Form.setValue("acquisitionGoal", buyerProfile.acquisitionGoal);
            if (buyerProfile.experienceLevel) step6Form.setValue("experienceLevel", buyerProfile.experienceLevel as any);
          }

          // Restore step index from localStorage if it exists
          const savedStep = localStorage.getItem("fmi_kyc_wizard_step");
          if (savedStep) {
            const stepNum = parseInt(savedStep, 10);
            if (stepNum > 0 && stepNum < getSteps().length) {
              setActiveStep(stepNum);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load KYC draft", err);
        toast.error("Could not resume saved progress");
      } finally {
        setLoading(false);
      }
    }

    loadDraft();
  }, []);

  // Sync current step to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("fmi_kyc_wizard_step", activeStep.toString());
    }
  }, [activeStep, loading]);

  // Compute active steps list
  const getSteps = (): StepItem[] => {
    const list: StepItem[] = [
      { title: "Entity Type", description: "Select structure", icon: Building },
      { title: "Identity Details", description: "PAN & Aadhaar", icon: User },
      { title: "Liveness Check", description: "Upload Selfie", icon: Camera },
      { title: "Bank Info", description: "Payout account", icon: CreditCard },
    ];

    if (selectedKycType === "COMPANY") {
      list.push({ title: "Company Details", description: "CIN & GSTIN", icon: Building });
    }

    if (userRole === "BUYER" || userRole === "BOTH") {
      list.push({ title: "Buyer Preferences", description: "Investment target", icon: DollarSign });
    }

    return list;
  };

  const steps = getSteps();

  // Combine draft data from all forms
  const getCombinedFormData = () => {
    return {
      ...step2Form.getValues(),
      ...step3Form.getValues(),
      ...step4Form.getValues(),
      ...step5Form.getValues(),
    };
  };

  // Save draft Server Action trigger
  const handleSaveDraft = async (silent = false) => {
    setSavingDraft(true);
    try {
      const kycType = step1Form.getValues("kycType");
      const dto = getCombinedFormData();

      const res = await saveKycDraftAction({
        kycType,
        dto,
      });

      if (res.success) {
        if (!silent) toast.success("Draft saved successfully to FMI Vault");
      } else {
        if (!silent) toast.error(res.error || "Failed to save draft");
      }
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Something went wrong saving progress");
    } finally {
      setSavingDraft(false);
    }
  };

  // Next Step validation & submission trigger
  const handleNext = async () => {
    const currentStepName = steps[activeStep].title;
    let isValid = false;

    if (currentStepName === "Entity Type") {
      isValid = await step1Form.trigger();
    } else if (currentStepName === "Identity Details") {
      isValid = await step2Form.trigger();
    } else if (currentStepName === "Liveness Check") {
      isValid = await step3Form.trigger();
    } else if (currentStepName === "Bank Info") {
      isValid = await step4Form.trigger();
    } else if (currentStepName === "Company Details") {
      isValid = await step5Form.trigger();
    } else if (currentStepName === "Buyer Preferences") {
      isValid = await step6Form.trigger();
    }

    if (isValid) {
      // Save progress to database on continue
      await handleSaveDraft(true);

      if (activeStep < steps.length - 1) {
        setActiveStep(prev => prev + 1);
      } else {
        // Submit entire flow!
        await handleSubmitAll();
      }
    } else {
      toast.error("Please resolve validation errors before continuing");
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Submit complete KYC to server action
  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const kycType = step1Form.getValues("kycType");
      const dto = getCombinedFormData();

      // 1. Submit KYC details
      const kycRes = await submitKycAction({
        kycType,
        dto,
      });

      if (!kycRes.success) {
        throw new Error(kycRes.error || "KYC verification failed");
      }

      // 2. Submit Buyer Profile if needed
      if (userRole === "BUYER" || userRole === "BOTH") {
        const buyerDto = step6Form.getValues();
        const buyerRes = await submitBuyerProfileAction(buyerDto);
        if (!buyerRes.success) {
          throw new Error(buyerRes.error || "Buyer profile registration failed");
        }
      }

      // Success! Clear step tracker and update status locally
      localStorage.removeItem("fmi_kyc_wizard_step");
      setKycStatus("PENDING");
      toast.success("KYC submitted successfully for review!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit onboarding files");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold tracking-tight">Initializing secure onboarding vault...</span>
      </div>
    );
  }

  // If already approved or in review, show status screen
  if (kycStatus === "PENDING" || kycStatus === "APPROVED" || kycStatus === "IN_REVIEW") {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl max-w-xl mx-auto shadow-2xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {kycStatus === "APPROVED" ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <Clock className="w-8 h-8 animate-pulse" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {kycStatus === "APPROVED" ? "Onboarding Completed" : "KYC Verification Gated"}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {kycStatus === "APPROVED"
              ? "Your FMI Indian Business Marketplace account is verified. You have full access to lists, financials, and escrow contracts."
              : "Our compliance managers are reviewing your digital ID, Aadhaar OCR proof, and bank status. Review completes in 1-2 hours."}
          </p>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Compliance Verification Status:</span>
            <span className={`font-semibold capitalize px-2.5 py-0.5 rounded-full text-[10px] ${
              kycStatus === "APPROVED" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {kycStatus.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Workspace Active:</span>
            <span className="text-slate-300 font-semibold">{userRole}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (userRole === "BUYER" || userRole === "BOTH") {
              router.push("/buyer/dashboard");
            } else {
              router.push("/seller/dashboard");
            }
          }}
          className="w-full py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer hover:scale-[1.01]"
        >
          Proceed to Dashboard <ArrowRight className="w-4 h-4 inline ml-1.5" />
        </button>
      </div>
    );
  }

  const currentStepTitle = steps[activeStep].title;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Progress Stepper */}
      <div className="lg:col-span-4 bg-slate-900/25 border border-slate-850 p-6 rounded-2xl backdrop-blur-md">
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Indian Compliance Gating</span>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">Registration Checklist</h3>
        </div>
        <Stepper
          orientation="vertical"
          steps={steps}
          activeStep={activeStep}
          size="sm"
        />
        <div className="border-t border-slate-850 mt-6 pt-5 flex flex-col gap-3">
          <button
            onClick={() => handleSaveDraft(false)}
            disabled={savingDraft || submitting}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {savingDraft ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Progress Draft
          </button>
          <span className="text-[10px] text-slate-500 text-center">
            Fintech-grade data residency secure vault.
          </span>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="border-b border-slate-800/80 px-6 py-5 flex justify-between items-center bg-slate-950/20">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step {activeStep + 1} of {steps.length}</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">{currentStepTitle}</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {userRole} Workspace
          </span>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepTitle}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Step 1: Entity Type */}
              {currentStepTitle === "Entity Type" && (
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Business Structure</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          id: "INDIVIDUAL" as const,
                          title: "Individual / Solo Founder",
                          description: "I manage operations personally, freelancing, or domain holding. Validated via Personal PAN.",
                          icon: User,
                          color: "border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60 bg-indigo-500/5",
                        },
                        {
                          id: "COMPANY" as const,
                          title: "Registered Corporate Entity",
                          description: "Private Limited, LLP, Partnership, or Sole Proprietorship in India. Validated via Corporate CIN & GSTIN.",
                          icon: Building,
                          color: "border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60 bg-emerald-500/5",
                        }
                      ].map((item) => {
                        const isSelected = selectedKycType === item.id;
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => step1Form.setValue("kycType", item.id)}
                            className={`p-5 border rounded-xl flex flex-col gap-3 transition-all cursor-pointer ${
                              isSelected 
                                ? `${item.color} ring-2 ring-indigo-500/20 scale-[1.01]`
                                : "border-slate-800 bg-slate-900/10 text-slate-400 hover:bg-slate-900/20"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className={`p-2.5 rounded-lg bg-slate-950 shrink-0 border border-slate-850`}>
                                <Icon className="w-5 h-5 text-indigo-400" />
                              </div>
                              {isSelected && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{item.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              )}

              {/* Step 2: Identity Details */}
              {currentStepTitle === "Identity Details" && (
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="panNumber" className="block text-xs font-medium text-slate-300">Indian PAN Card Number</label>
                      <input
                        id="panNumber"
                        type="text"
                        placeholder="ABCDE1234F"
                        {...step2Form.register("panNumber")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                      {step2Form.formState.errors.panNumber && (
                        <p className="text-xs text-rose-400 mt-1">{step2Form.formState.errors.panNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="aadhaarLast4" className="block text-xs font-medium text-slate-300">Aadhaar (Last 4 Digits)</label>
                      <input
                        id="aadhaarLast4"
                        type="text"
                        placeholder="1234"
                        maxLength={4}
                        {...step2Form.register("aadhaarLast4")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {step2Form.formState.errors.aadhaarLast4 && (
                        <p className="text-xs text-rose-400 mt-1">{step2Form.formState.errors.aadhaarLast4.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <Controller
                      name="panDocUrl"
                      control={step2Form.control}
                      render={({ field, fieldState }) => (
                        <FileDropzone
                          label="PAN Card Image/PDF"
                          description="PNG, JPG, PDF up to 5MB"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />

                    <Controller
                      name="aadhaarDocUrl"
                      control={step2Form.control}
                      render={({ field, fieldState }) => (
                        <FileDropzone
                          label="Aadhaar Card Copy"
                          description="Aadhaar front or merged copy up to 5MB"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>
                </form>
              )}

              {/* Step 3: Liveness Check */}
              {currentStepTitle === "Liveness Check" && (
                <form className="space-y-5 text-center flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
                  <div className="max-w-md w-full space-y-4">
                    <div className="flex flex-col items-center p-4 bg-slate-950/40 rounded-xl border border-slate-850 gap-2">
                      <div className="w-10 h-10 bg-indigo-950/60 border border-indigo-900/40 rounded-full flex items-center justify-center text-indigo-400">
                        <Camera className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Selfie Image Matching</h4>
                      <p className="text-[11px] text-slate-400 leading-normal max-w-xs">
                        Please upload a clear selfie photo of your face. We match this against the photo on your Aadhaar card for fraud prevention.
                      </p>
                    </div>

                    <Controller
                      name="selfieUrl"
                      control={step3Form.control}
                      render={({ field, fieldState }) => (
                        <FileDropzone
                          label="Take or Upload Selfie Photo"
                          description="Clear headshot, PNG/JPG up to 5MB"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          accept="image/*"
                        />
                      )}
                    />
                  </div>
                </form>
              )}

              {/* Step 4: Bank Info */}
              {currentStepTitle === "Bank Info" && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="bankAccountName" className="block text-xs font-medium text-slate-300">Account Holder Name (Must match PAN/Aadhaar)</label>
                    <input
                      id="bankAccountName"
                      type="text"
                      placeholder="Enter bank account name"
                      {...step4Form.register("bankAccountName")}
                      className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {step4Form.formState.errors.bankAccountName && (
                      <p className="text-xs text-rose-400 mt-1">{step4Form.formState.errors.bankAccountName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bankAccountNumber" className="block text-xs font-medium text-slate-300">Bank Account Number</label>
                      <input
                        id="bankAccountNumber"
                        type="text"
                        placeholder="Enter account number"
                        {...step4Form.register("bankAccountNumber")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {step4Form.formState.errors.bankAccountNumber && (
                        <p className="text-xs text-rose-400 mt-1">{step4Form.formState.errors.bankAccountNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="bankIfsc" className="block text-xs font-medium text-slate-300">Bank IFSC Code</label>
                      <input
                        id="bankIfsc"
                        type="text"
                        placeholder="SBIN0001234"
                        {...step4Form.register("bankIfsc")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                      {step4Form.formState.errors.bankIfsc && (
                        <p className="text-xs text-rose-400 mt-1">{step4Form.formState.errors.bankIfsc.message}</p>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {/* Step 5: Company Details */}
              {currentStepTitle === "Company Details" && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="companyName" className="block text-xs font-medium text-slate-300">Registered Corporate Name</label>
                    <input
                      id="companyName"
                      type="text"
                      placeholder="e.g. Acme Digital Solutions Pvt Ltd"
                      {...step5Form.register("companyName")}
                      className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {step5Form.formState.errors.companyName && (
                      <p className="text-xs text-rose-400 mt-1">{step5Form.formState.errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cin" className="block text-xs font-medium text-slate-300">Corporate Identification Number (CIN)</label>
                      <input
                        id="cin"
                        type="text"
                        placeholder="U12345MH2020PTC123456"
                        {...step5Form.register("cin")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                      {step5Form.formState.errors.cin && (
                        <p className="text-xs text-rose-400 mt-1">{step5Form.formState.errors.cin.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="gstin" className="block text-xs font-medium text-slate-300">GST Registration Number (GSTIN)</label>
                      <input
                        id="gstin"
                        type="text"
                        placeholder="27AAAAA1111A1Z1"
                        {...step5Form.register("gstin")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                      {step5Form.formState.errors.gstin && (
                        <p className="text-xs text-rose-400 mt-1">{step5Form.formState.errors.gstin.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyPan" className="block text-xs font-medium text-slate-300">Company PAN Number</label>
                      <input
                        id="companyPan"
                        type="text"
                        placeholder="AAAAA1111A"
                        {...step5Form.register("companyPan")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                      {step5Form.formState.errors.companyPan && (
                        <p className="text-xs text-rose-400 mt-1">{step5Form.formState.errors.companyPan.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="directorName" className="block text-xs font-medium text-slate-300">Managing Director / Signatory Name</label>
                      <input
                        id="directorName"
                        type="text"
                        placeholder="Director's full name"
                        {...step5Form.register("directorName")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {step5Form.formState.errors.directorName && (
                        <p className="text-xs text-rose-400 mt-1">{step5Form.formState.errors.directorName.message}</p>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {/* Step 6: Buyer Profile */}
              {currentStepTitle === "Buyer Preferences" && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="investorType" className="block text-xs font-medium text-slate-300">Investor Structure Type</label>
                      <select
                        id="investorType"
                        {...step6Form.register("investorType")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="INDIVIDUAL">Individual Investor</option>
                        <option value="PE_FUND">Private Equity (PE) Fund</option>
                        <option value="FAMILY_OFFICE">Family Office</option>
                        <option value="CORPORATE">Corporate Acquirer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="experienceLevel" className="block text-xs font-medium text-slate-300">M&A Experience Level</label>
                      <select
                        id="experienceLevel"
                        {...step6Form.register("experienceLevel")}
                        className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="FIRST_TIME">First-Time Acquirer</option>
                        <option value="SOME">Some Experience (1-2 Deals)</option>
                        <option value="EXPERIENCED">Experienced Professional</option>
                        <option value="SERIAL">Serial Acquirer (5+ Deals)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="budgetMin" className="block text-xs font-medium text-slate-300">Minimum Budget (INR)</label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          id="budgetMin"
                          type="number"
                          placeholder="50,000"
                          {...step6Form.register("budgetMin", { valueAsNumber: true })}
                          className="pl-9 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      {step6Form.formState.errors.budgetMin && (
                        <p className="text-xs text-rose-400 mt-1">{step6Form.formState.errors.budgetMin.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="budgetMax" className="block text-xs font-medium text-slate-300">Maximum Budget (INR)</label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          id="budgetMax"
                          type="number"
                          placeholder="5,000,000"
                          {...step6Form.register("budgetMax", { valueAsNumber: true })}
                          className="pl-9 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      {step6Form.formState.errors.budgetMax && (
                        <p className="text-xs text-rose-400 mt-1">{step6Form.formState.errors.budgetMax.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Industries</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {industriesList.map((ind) => {
                        const selectedInds = step6Form.watch("industries") || [];
                        const isChecked = selectedInds.includes(ind);

                        return (
                          <div
                            key={ind}
                            onClick={() => {
                              const newInds = isChecked
                                ? selectedInds.filter(i => i !== ind)
                                : [...selectedInds, ind];
                              step6Form.setValue("industries", newInds, { shouldValidate: true });
                            }}
                            className={`px-3 py-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-all ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {ind}
                          </div>
                        );
                      })}
                    </div>
                    {step6Form.formState.errors.industries && (
                      <p className="text-xs text-rose-400 mt-1.5">{step6Form.formState.errors.industries.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Operating States</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {statesList.map((state) => {
                        const selectedStates = step6Form.watch("states") || [];
                        const isChecked = selectedStates.includes(state);

                        return (
                          <div
                            key={state}
                            onClick={() => {
                              const newStates = isChecked
                                ? selectedStates.filter(s => s !== state)
                                : [...selectedStates, state];
                              step6Form.setValue("states", newStates, { shouldValidate: true });
                            }}
                            className={`px-3 py-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-all ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {state}
                          </div>
                        );
                      })}
                    </div>
                    {step6Form.formState.errors.states && (
                      <p className="text-xs text-rose-400 mt-1.5">{step6Form.formState.errors.states.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="acquisitionGoal" className="block text-xs font-medium text-slate-300">Investment Strategy / Goal</label>
                    <textarea
                      id="acquisitionGoal"
                      rows={3}
                      placeholder="Briefly explain your acquisition goals, criteria, and what kinds of digital businesses you want to buy..."
                      {...step6Form.register("acquisitionGoal")}
                      className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                    {step6Form.formState.errors.acquisitionGoal && (
                      <p className="text-xs text-rose-400 mt-1">{step6Form.formState.errors.acquisitionGoal.message}</p>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="border-t border-slate-800/80 px-6 py-4 flex justify-between items-center bg-slate-950/20">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeStep === 0 || submitting}
            className="flex items-center gap-1.5 py-2 px-4 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center gap-1.5 py-2 px-5 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer hover:scale-[1.005]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : activeStep === steps.length - 1 ? (
              <>
                Submit KYC & Finish <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

