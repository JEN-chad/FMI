import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { KycWizard } from "@/components/kyc/kyc-wizard";
import { Shield } from "lucide-react";
import Link from "next/link";

export default async function OnboardingKycPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // If role is not selected yet, redirect them to role selection page
  if (!session.user.role) {
    redirect("/onboarding/role");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] size-[80%] rounded-full bg-brand/5 blur-[120px] dark:bg-brand/2" />
        <div className="absolute top-[30%] -right-[30%] size-[80%] rounded-full bg-success/5 blur-[120px] dark:bg-success/2" />
      </div>

      {/* Onboarding Header */}
      <header className="border-b border-border bg-card/65 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg fmi-gradient text-white font-bold text-base shadow-sm">
              F
            </div>
            <span className="text-base font-extrabold tracking-tight text-foreground">
              FMI Onboarding
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Secure Account: <span className="font-semibold text-foreground">{session.user.email}</span>
            </span>
            <Link
              href="/auth/login"
              className="py-1.5 px-3 bg-secondary border border-border hover:bg-secondary/80 rounded-lg text-xs font-semibold text-foreground transition-all"
            >
              Log Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 z-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Complete your profile</h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Please complete these compliance steps to unlock listing creation or financial access on the FMI Digital business marketplace.
          </p>
        </div>

        <KycWizard />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 bg-card/25">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-medium">
          <span>&copy; {new Date().getFullYear()} FMI Marketplace. Fintech-grade compliance security.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Help & Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
