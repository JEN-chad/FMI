"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { selectUserRoleAction } from "@/actions/auth.actions";
import { useAuth } from "@/hooks/use-auth";
import { SelectRoleSchema } from "@/lib/dto/auth.dto";
import { Shield, TrendingUp, Briefcase, Layers, ArrowRight, Loader2, LogOut, Check } from "lucide-react";
import { z } from "zod";

type RoleSelectionInput = z.infer<typeof SelectRoleSchema>;

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user, signOut, refetchSession } = useAuth();

  const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<RoleSelectionInput>({
    resolver: zodResolver(SelectRoleSchema),
    defaultValues: { role: undefined },
  });

  const selectedRole = watch("role");

  const rolesList = [
    {
      id: "BUYER" as const,
      title: "Digital Acquirer / Buyer",
      description: "I want to acquire digital assets, websites, SaaS platforms, or e-commerce stores in India. Gated behind KYC and NDAs.",
      icon: TrendingUp,
      color: "from-brand/10 to-info/10 border-brand/35 text-brand hover:border-brand/60",
      accent: "text-brand bg-brand/10",
    },
    {
      id: "SELLER" as const,
      title: "Business Founder / Seller",
      description: "I want to list and exit my Indian digital business, domain portfolio, blog, or mobile app. Direct access to verified buyers.",
      icon: Briefcase,
      color: "from-success/10 to-brand/5 border-success/35 text-success hover:border-success/60",
      accent: "text-success bg-success/10",
    },
    {
      id: "BOTH" as const,
      title: "Marketplace Dual Member",
      description: "I want the full capability to both buy assets and sell digital businesses. Full role flexibility across dashboards.",
      icon: Layers,
      color: "from-brand/10 to-success/10 border-brand/30 text-brand hover:border-brand/50",
      accent: "text-brand bg-brand/10",
    },
  ];

  const onSubmit = async (values: RoleSelectionInput) => {
    try {
      const res = await selectUserRoleAction({ role: values.role });
      if (res.success) {
        await refetchSession();
        toast.success(`Role set to ${values.role}! Initializing your secure KYC vault.`);
        
        // Redirect to KYC wizard onboarding page
        router.push("/onboarding/kyc");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update workspace role");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong saving role configuration.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[150px] dark:bg-brand/2" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-success/5 blur-[150px] dark:bg-success/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl z-10">
        <div className="flex justify-between items-center bg-card/60 border border-border px-6 py-3.5 rounded-2xl mb-8 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg fmi-gradient text-white font-bold text-base shadow-sm">
              F
            </div>
            <span className="text-base font-extrabold tracking-tight text-foreground">
              FMI Workspace
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Logged in: <span className="font-semibold text-foreground">{user.email}</span>
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Choose your marketplace workspace
          </h2>
          <p className="mt-2.5 text-sm text-muted-foreground max-w-md mx-auto">
            FMI provides customized role-based interfaces for buyers and sellers. Select your primary workspace role.
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl z-10 px-4 sm:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Roles List */}
          <div className="space-y-4">
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <>
                  {rolesList.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = field.value === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setValue("role", item.id, { shouldValidate: true })}
                        className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? `${item.color} border-brand bg-card/85 ring-2 ring-brand/10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] scale-[1.01]`
                            : "bg-card/45 border-border text-muted-foreground hover:bg-card/75 hover:border-border/85"
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${item.accent} shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-foreground tracking-tight">{item.title}</h3>
                            {isSelected && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-brand-foreground shadow-xs">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!selectedRole || isSubmitting}
              className={`w-full h-11 flex justify-center items-center gap-2 rounded-xl shadow-xs text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRole
                  ? "bg-brand hover:opacity-90 cursor-pointer active:scale-[0.99]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Confirm Workspace Selection <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
