"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2, TrendingUp, Globe, Package, DollarSign, Upload,
  CheckCircle2, ArrowLeft, ArrowRight, Save, Loader2, Sparkles,
  ChevronRight,
} from "lucide-react";
import { AssetType, PricingModel, DocumentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { useListingWizardStore } from "@/store/listing-wizard-store";
import { createListingAction, updateListingAction, submitListingForReviewAction } from "@/actions/listings";
import { cn } from "@/lib/utils";

// ─── Step Schemas ─────────────────────────────────────────────────────────────

const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  businessNamePrivate: z.string().optional(),
  assetType: z.nativeEnum(AssetType),
  industry: z.string().min(2, "Please specify an industry"),
  businessModel: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  tagline: z.string().max(100).optional(),
  businessUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  yearEstablished: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  teamSize: z.coerce.number().int().nonnegative().optional(),
  hoursPerWeek: z.coerce.number().int().nonnegative().optional(),
});

const step2Schema = z.object({
  monthlyRevenue: z.coerce.number().int().nonnegative("Must be non-negative").optional(),
  monthlyProfit: z.coerce.number().int().optional(),
  monthlyTraffic: z.coerce.number().int().nonnegative().optional(),
  trafficSources: z.string().optional(),
});

const step5Schema = z.object({
  askingPrice: z.coerce.number().int().positive("Asking price must be a positive number"),
  reservePrice: z.coerce.number().int().positive().optional(),
  pricingModel: z.nativeEnum(PricingModel),
  ndaRequired: z.boolean().default(true),
  ndaFee: z.coerce.number().int().nonnegative().default(0),
  reasonForSale: z.string().min(10, "Please provide at least 10 characters"),
});

// ─── Constants ───────────────────────────────────────────────────────────────

const ASSET_TYPES = [
  { value: AssetType.SAAS, label: "SaaS", icon: "☁️" },
  { value: AssetType.ECOMMERCE, label: "eCommerce", icon: "🛒" },
  { value: AssetType.APP, label: "Mobile App", icon: "📱" },
  { value: AssetType.BLOG, label: "Blog / Media", icon: "📝" },
  { value: AssetType.DOMAIN, label: "Domain Name", icon: "🌐" },
  { value: AssetType.CONTENT_SITE, label: "Content Site", icon: "📰" },
  { value: AssetType.SERVICE, label: "Agency / Service", icon: "🏢" },
];

const INDUSTRIES = [
  "SaaS", "E-commerce", "Fintech", "Healthtech", "Edtech",
  "B2B", "B2C", "Consumer", "Enterprise", "Developer Tools",
  "AI/ML", "Marketing Tech", "HR Tech", "Legal Tech", "Logistics",
  "Food & Beverage", "Fashion", "Real Estate", "Media", "Gaming",
];

const STEPS = [
  { title: "Business Details", description: "Core info", icon: Building2 },
  { title: "Financials", description: "Revenue & profits", icon: TrendingUp },
  { title: "Traffic & SEO", description: "Audience data", icon: Globe },
  { title: "Assets Included", description: "What's being sold", icon: Package },
  { title: "Pricing", description: "Asking price", icon: DollarSign },
  { title: "Documents", description: "Upload proofs", icon: Upload },
];

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export function ListingWizard() {
  const router = useRouter();
  const store = useListingWizardStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalSlug, setFinalSlug] = useState<string | null>(null);

  // Step 1 form
  const form1 = useForm<{
    title: string;
    businessNamePrivate?: string;
    assetType: AssetType;
    industry: string;
    businessModel?: string;
    description: string;
    tagline?: string;
    businessUrl?: string;
    yearEstablished?: number;
    teamSize?: number;
    hoursPerWeek?: number;
  }>({
    resolver: zodResolver(step1Schema) as any,
    defaultValues: {
      title: store.step1.title ?? "",
      businessNamePrivate: store.step1.businessNamePrivate ?? "",
      assetType: store.step1.assetType ?? AssetType.SAAS,
      industry: store.step1.industry ?? "",
      businessModel: store.step1.businessModel ?? "",
      description: store.step1.description ?? "",
      tagline: store.step1.tagline ?? "",
      businessUrl: store.step1.businessUrl ?? "",
      yearEstablished: store.step1.yearEstablished ?? undefined,
      teamSize: store.step1.teamSize ?? undefined,
      hoursPerWeek: store.step1.hoursPerWeek ?? undefined,
    },
  });

  // Step 2 form
  const form2 = useForm<{
    monthlyRevenue?: number;
    monthlyProfit?: number;
    monthlyTraffic?: number;
    trafficSources?: string;
  }>({
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      monthlyRevenue: store.step2.monthlyRevenue ?? undefined,
      monthlyProfit: store.step2.monthlyProfit ?? undefined,
      monthlyTraffic: store.step3.monthlyTraffic ?? undefined,
      trafficSources: store.step3.trafficSources ?? "",
    },
  });

  // Step 5 form
  const form5 = useForm<{
    askingPrice: number;
    reservePrice?: number;
    pricingModel: PricingModel;
    ndaRequired: boolean;
    ndaFee: number;
    reasonForSale: string;
  }>({
    resolver: zodResolver(step5Schema) as any,
    defaultValues: {
      askingPrice: store.step5.askingPrice ?? 0,
      reservePrice: store.step5.reservePrice ?? undefined,
      pricingModel: store.step5.pricingModel ?? PricingModel.CLASSIFIED,
      ndaRequired: store.step5.ndaRequired ?? true,
      ndaFee: store.step5.ndaFee ?? 0,
      reasonForSale: store.step5.reasonForSale ?? "",
    },
  });

  // Tags state for assets step
  const [tags, setTags] = useState<string[]>(store.step4.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // Documents state
  const [coverImageUrl, setCoverImageUrl] = useState(store.step4.coverImageUrl ?? "");

  const handleNext = useCallback(async () => {
    const step = store.currentStep;

    if (step === 0) {
      const valid = await form1.trigger();
      if (!valid) return;
      const data = form1.getValues() as any;
      store.updateStep1(data);

      // Create or update listing
      setIsSaving(true);
      try {
        if (!store.listingId) {
          const result = await createListingAction({
            ...data,
            askingPrice: 1, // placeholder — set in step 5
            pricingModel: PricingModel.CLASSIFIED,
            ndaRequired: true,
            ndaFee: 0,
            tags: [],
            businessUrl: data.businessUrl || undefined,
            yearEstablished: data.yearEstablished ?? null,
            teamSize: data.teamSize ?? null,
            hoursPerWeek: data.hoursPerWeek ?? null,
          });
          if (!result.success) { toast.error(result.error); return; }
          store.setListingId(result.data.id);
        } else {
          const result = await updateListingAction(store.listingId, {
            ...data,
            businessUrl: data.businessUrl || undefined,
            yearEstablished: data.yearEstablished ?? null,
            teamSize: data.teamSize ?? null,
            hoursPerWeek: data.hoursPerWeek ?? null,
          });
          if (!result.success) { toast.error(result.error); return; }
        }
        store.markSaved();
        toast.success("Progress saved ✓", { duration: 1500 });
      } finally {
        setIsSaving(false);
      }
    }

    if (step === 1) {
      const valid = await form2.trigger();
      if (!valid) return;
      const data = form2.getValues();
      store.updateStep2({ monthlyRevenue: data.monthlyRevenue, monthlyProfit: data.monthlyProfit });
      store.updateStep3({ monthlyTraffic: data.monthlyTraffic, trafficSources: data.trafficSources });

      if (store.listingId) {
        setIsSaving(true);
        const result = await updateListingAction(store.listingId, {
          monthlyRevenue: data.monthlyRevenue ?? null,
          monthlyProfit: data.monthlyProfit ?? null,
          monthlyTraffic: data.monthlyTraffic ?? null,
          trafficSources: data.trafficSources ?? null,
        }).finally(() => setIsSaving(false));
        if (!result.success) { toast.error(result.error); return; }
        toast.success("Progress saved ✓", { duration: 1500 });
      }
    }

    if (step === 3) {
      store.updateStep4({ tags, coverImageUrl });
      if (store.listingId) {
        setIsSaving(true);
        await updateListingAction(store.listingId, { tags, coverImageUrl: coverImageUrl || null }).finally(() => setIsSaving(false));
        toast.success("Progress saved ✓", { duration: 1500 });
      }
    }

    if (step === 4) {
      const valid = await form5.trigger();
      if (!valid) return;
      const data = form5.getValues();
      store.updateStep5(data as Parameters<typeof store.updateStep5>[0]);
      if (store.listingId) {
        setIsSaving(true);
        const result = await updateListingAction(store.listingId, {
          askingPrice: data.askingPrice,
          reservePrice: data.reservePrice ?? null,
          pricingModel: data.pricingModel,
          ndaRequired: data.ndaRequired,
          ndaFee: data.ndaFee,
          reasonForSale: data.reasonForSale,
        }).finally(() => setIsSaving(false));
        if (!result.success) { toast.error(result.error); return; }
        toast.success("Progress saved ✓", { duration: 1500 });
      }
    }

    if (step === 5) {
      // Final step — submit for review
      if (!store.listingId) { toast.error("No listing found. Please start from step 1."); return; }
      setIsSubmitting(true);
      try {
        const listing = await updateListingAction(store.listingId, { coverImageUrl: coverImageUrl || null });
        const result = await submitListingForReviewAction(store.listingId);
        if (!result.success) { toast.error(result.error); return; }
        setIsComplete(true);
        store.reset();
        toast.success("Listing submitted for review!");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    store.nextStep();
  }, [store, form1, form2, form5, tags, coverImageUrl]);

  const handleBack = () => store.prevStep();

  // ─── Success Screen ─────────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-6 text-center"
      >
        <div className="w-20 h-20 rounded-full fmi-gradient flex items-center justify-center shadow-2xl shadow-brand/30">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Listing Submitted!</h2>
          <p className="text-muted-foreground max-w-md">
            Your listing is now under review. Our compliance team will approve it within 24 hours.
            You'll receive an email notification when it goes live.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/seller/listings")}>
            My Listings
          </Button>
          <Button onClick={() => { store.reset(); window.location.reload(); }} className="fmi-gradient text-white">
            Create Another Listing
          </Button>
        </div>
      </motion.div>
    );
  }

  const step = store.currentStep;
  const currentStep = STEPS[step];

  return (
    <div className="flex gap-8 items-start">
      {/* Sidebar Stepper */}
      <div className="w-64 shrink-0 hidden lg:block">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isDone = i < step;
                const isActive = i === step;
                const isFuture = i > step;
                return (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg">
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 transition-all",
                      isDone && "fmi-gradient text-white",
                      isActive && "bg-brand text-white ring-2 ring-brand/30",
                      isFuture && "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {s.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{s.description}</p>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-brand mt-1" />}
                  </div>
                );
              })}
            </div>

            <Separator className="my-3" />
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Auto-save</span>
                <span className="text-success font-medium">✓ Enabled</span>
              </div>
              {store.lastSavedAt && (
                <div className="flex justify-between">
                  <span>Last saved</span>
                  <span className="font-medium">just now</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 min-w-0">
        <Card>
          <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/30">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
                <div className="h-1 w-24 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full fmi-gradient rounded-full transition-all duration-500"
                    style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
              <h2 className="text-base font-bold">{currentStep.title}</h2>
            </div>
            <Badge variant="outline" className="text-xs">{currentStep.description}</Badge>
          </div>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* ─── Step 1: Business Details ─────────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="title">Listing Title <span className="text-destructive">*</span></Label>
                        <Input id="title" placeholder="e.g. Profitable SaaS tool for HR teams with 500+ paying customers" {...form1.register("title")} />
                        {form1.formState.errors.title && <p className="text-xs text-destructive">{form1.formState.errors.title.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="businessNamePrivate">Business Name (Private)</Label>
                        <Input id="businessNamePrivate" placeholder="Actual business name (hidden until NDA)" {...form1.register("businessNamePrivate")} />
                        <p className="text-[11px] text-muted-foreground">Only visible to buyers after NDA signing</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
                        <select
                          id="industry"
                          {...form1.register("industry")}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Select industry</option>
                          {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                        {form1.formState.errors.industry && <p className="text-xs text-destructive">{form1.formState.errors.industry.message}</p>}
                      </div>
                    </div>

                    {/* Asset Type */}
                    <div className="space-y-2">
                      <Label>Business Type <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {ASSET_TYPES.map((at) => {
                          const selected = form1.watch("assetType") === at.value;
                          return (
                            <button
                              key={at.value}
                              type="button"
                              onClick={() => form1.setValue("assetType", at.value, { shouldValidate: true })}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all",
                                selected ? "border-brand bg-brand/10 text-brand" : "border-border hover:border-border/80 hover:bg-accent"
                              )}
                            >
                              <span className="text-xl">{at.icon}</span>
                              <span className="text-[10px] font-semibold leading-tight">{at.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input id="tagline" placeholder="One-liner that captures your business value" {...form1.register("tagline")} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="description"
                        rows={5}
                        placeholder="Describe your business — what it does, who uses it, why it's valuable, its growth trajectory..."
                        {...form1.register("description")}
                      />
                      {form1.formState.errors.description && <p className="text-xs text-destructive">{form1.formState.errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="businessUrl">Website URL</Label>
                        <Input id="businessUrl" placeholder="https://..." {...form1.register("businessUrl")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="yearEstablished">Year Founded</Label>
                        <Input id="yearEstablished" type="number" placeholder="2020" {...form1.register("yearEstablished")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Input id="teamSize" type="number" placeholder="5" {...form1.register("teamSize")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="hoursPerWeek">Hrs/Week</Label>
                        <Input id="hoursPerWeek" type="number" placeholder="10" {...form1.register("hoursPerWeek")} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Step 2: Financials ───────────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-brand/5 border border-brand/20 text-sm text-brand flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>Financial transparency builds buyer trust. Be as accurate as possible — we verify all submitted data.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { id: "monthlyRevenue", label: "Monthly Revenue (MRR)", placeholder: "150000", hint: "Average revenue per month (INR)" },
                        { id: "monthlyProfit", label: "Monthly Profit / Net Income", placeholder: "60000", hint: "After all expenses" },
                        { id: "monthlyTraffic", label: "Monthly Traffic (Unique Visitors)", placeholder: "25000", hint: "Unique visitors per month" },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                              {field.id.includes("Traffic") ? "" : "₹"}
                            </span>
                            <Input
                              id={field.id}
                              type="number"
                              placeholder={field.placeholder}
                              className={!field.id.includes("Traffic") ? "pl-7" : ""}
                              {...form2.register(field.id as "monthlyRevenue" | "monthlyProfit" | "monthlyTraffic")}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">{field.hint}</p>
                        </div>
                      ))}

                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="trafficSources">Traffic Sources</Label>
                        <Textarea
                          id="trafficSources"
                          rows={3}
                          placeholder="e.g. 60% Organic SEO, 20% Paid Google Ads, 15% Direct, 5% Social Media"
                          {...form2.register("trafficSources")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Step 3: Traffic & SEO (reuse form2 data) ─────────────── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="text-center py-6 space-y-2 text-muted-foreground">
                      <Globe className="h-10 w-10 mx-auto opacity-40" />
                      <p className="text-sm">Traffic data is collected in Step 2 (Financials).</p>
                      <p className="text-xs">You can upload a Google Analytics screenshot below for verification.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Google Analytics Screenshot (Optional)</Label>
                      <FileDropzone
                        label="Upload Analytics Screenshot"
                        description="PNG, JPG up to 5MB — shows traffic trends"
                        value=""
                        onChange={() => {}}
                        accept="image/*"
                      />
                    </div>
                  </div>
                )}

                {/* ─── Step 4: Assets Included ──────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label>Assets & Tags</Label>
                      <p className="text-xs text-muted-foreground">Add keywords that describe what's included (domains, code repos, social accounts, etc.)</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add asset tag (e.g. 'Source code', 'Custom domain')"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && tagInput.trim()) {
                              e.preventDefault();
                              setTags([...tags, tagInput.trim()]);
                              setTagInput("");
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={() => { if (tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(""); } }}>
                          Add
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <Label>Cover Image</Label>
                      <FileDropzone
                        label="Upload Cover Image"
                        description="PNG, JPG up to 5MB — this is the main listing image"
                        value={coverImageUrl}
                        onChange={(url) => setCoverImageUrl(url ?? "")}
                        accept="image/*"
                      />
                    </div>
                  </div>
                )}

                {/* ─── Step 5: Pricing ──────────────────────────────────────── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="askingPrice">Asking Price (INR) <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">₹</span>
                          <Input id="askingPrice" type="number" placeholder="5000000" className="pl-7" {...form5.register("askingPrice")} />
                        </div>
                        {form5.formState.errors.askingPrice && <p className="text-xs text-destructive">{form5.formState.errors.askingPrice.message}</p>}
                        {form5.watch("askingPrice") > 0 && (
                          <p className="text-xs text-muted-foreground">{formatCurrency(form5.watch("askingPrice"))}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="pricingModel">Pricing Model</Label>
                        <select id="pricingModel" {...form5.register("pricingModel")} className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm">
                          <option value={PricingModel.CLASSIFIED}>Fixed Price (Classified)</option>
                          <option value={PricingModel.AUCTION}>Auction</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                      <div>
                        <p className="text-sm font-semibold">Require NDA to view financials</p>
                        <p className="text-xs text-muted-foreground">Buyers must sign an NDA before accessing private data</p>
                      </div>
                      <Switch checked={form5.watch("ndaRequired")} onCheckedChange={(v) => form5.setValue("ndaRequired", v)} />
                    </div>

                    {form5.watch("ndaRequired") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="ndaFee">NDA Unlock Fee (INR)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">₹</span>
                          <Input id="ndaFee" type="number" placeholder="0 for free" className="pl-7" {...form5.register("ndaFee")} />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Set to 0 for a free NDA. This fee acts as a buyer qualification filter.</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="reasonForSale">Reason for Selling <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="reasonForSale"
                        rows={4}
                        placeholder="Be transparent. Buyers appreciate honest reasons — e.g. pursuing other ventures, lifestyle change, lack of bandwidth to grow..."
                        {...form5.register("reasonForSale")}
                      />
                      {form5.formState.errors.reasonForSale && <p className="text-xs text-destructive">{form5.formState.errors.reasonForSale.message}</p>}
                    </div>
                  </div>
                )}

                {/* ─── Step 6: Documents ────────────────────────────────────── */}
                {step === 5 && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                      <p className="text-sm text-success font-medium mb-1">Almost done! Upload supporting documents.</p>
                      <p className="text-xs text-muted-foreground">Financial proofs and analytics screenshots significantly increase buyer trust and speed up deal closure.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "P&L Statement / Revenue Proof", description: "PDF or screenshots showing revenue" },
                        { label: "Traffic Analytics Export", description: "Google Analytics or similar" },
                        { label: "Ownership Proof", description: "Domain registrar, App Store receipts" },
                        { label: "Additional Supporting Docs", description: "Anything else buyers should see" },
                      ].map((doc) => (
                        <FileDropzone
                          key={doc.label}
                          label={doc.label}
                          description={doc.description}
                          value=""
                          onChange={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Footer Navigation */}
          <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/20">
            <Button variant="outline" onClick={handleBack} disabled={step === 0 || isSaving}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="flex items-center gap-3">
              {isSaving && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              )}
              <Button
                onClick={handleNext}
                disabled={isSaving || isSubmitting}
                className="fmi-gradient text-white min-w-32"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : step === STEPS.length - 1 ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Submit for Review</>
                ) : (
                  <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

