"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithCredentials, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = await signInWithCredentials(email, password);
    if (result.error) {
      setError(result.error.message ?? "Unable to sign in.");
      return;
    }
    router.push(searchParams.get("callbackUrl") || "/onboarding/role");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] dark:bg-brand/2" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-success/5 blur-[120px] dark:bg-success/2" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="flex size-9 items-center justify-center rounded-lg fmi-gradient text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              F
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              FMI
            </span>
          </Link>
        </div>

        <form onSubmit={onSubmit} className="w-full rounded-2xl border border-border bg-card/60 p-8 shadow-xl backdrop-blur-md space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
            <p className="text-xs text-muted-foreground">Access your verified FMI marketplace workspace.</p>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs font-semibold text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">Password</Label>
                <Link href="#" className="text-[11px] font-semibold text-brand hover:underline">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 shadow-xs" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            New to FMI?{" "}
            <Link className="font-semibold text-brand hover:underline" href="/auth/signup">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
