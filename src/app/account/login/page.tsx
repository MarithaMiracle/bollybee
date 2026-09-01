"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/actions/auth";
import { cn } from "@/lib/utils";

const SATIN_BG = "/brand/admin-login-satin-bg.png";

export default function AccountLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "login") {
        const result = await signIn(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          router.push("/account/orders");
          router.refresh();
        }
      } else {
        const result = await signUp(formData);
        if (result?.error) {
          toast.error(result.error);
        } else if (result.emailSent && result.testInbox) {
          toast.success(
            `Account created! Welcome email sent to ${result.testInbox} (Resend test mode — not your signup address).`
          );
          router.push("/account/orders");
          router.refresh();
        } else if (result.emailSent) {
          toast.success("Account created! Check your email for a welcome message.");
          router.push("/account/orders");
          router.refresh();
        } else {
          toast.success("Account created!");
          toast.warning(
            "Welcome email could not be sent. Restart the dev server if you just added Resend keys, or check Vercel env vars."
          );
          router.push("/account/orders");
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 md:min-h-[calc(100vh-5rem)]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src={SATIN_BG}
          alt=""
          fill
          className="object-cover object-center grayscale"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden />
      </div>

      <div className="w-full max-w-md">
        <article className="border border-[var(--border)]/80 bg-[var(--background)]/94 p-6 shadow-sm backdrop-blur-md sm:p-8 md:p-10">
          <div className="text-center">
            <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">
              {mode === "login" ? "Welcome back" : "Join Bollybee"}
            </h1>
            <p className="mt-2 font-display text-lg italic text-[var(--plum)]">
              {mode === "login"
                ? "Sign in to track orders & more"
                : "Create an account to get started"}
            </p>
          </div>

          <div className="mt-8 flex border border-[var(--border)] bg-[var(--surface)] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
                mode === "login"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={cn(
                "flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
                mode === "register"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" required autoComplete="name" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                minLength={6}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--plum)] hover:underline"
            >
              Continue as guest
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}
