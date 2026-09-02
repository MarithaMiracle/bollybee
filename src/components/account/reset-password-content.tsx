"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { RequestResetLinkForm } from "@/components/account/request-reset-link-form";
import { BackLink } from "@/components/layout/back-link";
import { updatePassword } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

const SATIN_BG = "/brand/admin-login-satin-bg.png";

export function ResetPasswordContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function establishRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const token_hash = params.get("token_hash");
      const type = params.get("type");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else if (token_hash && type) {
        await supabase.auth.verifyOtp({
          token_hash,
          type: type as EmailOtpType,
        });
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        window.history.replaceState({}, "", "/account/reset-password");
      }

      setHasSession(!!session);
      setChecking(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        setHasSession(!!session);
        setChecking(false);
      }
    });

    establishRecoverySession();

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await updatePassword(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Password updated. You're signed in.");
        router.push("/account/orders");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 md:min-h-[calc(100vh-5rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
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
        <BackLink href="/account/login" label="Back to sign in" className="mb-6 text-white/90 hover:text-white" />
        <article className="brand-panel-xl border-[var(--border)]/80 bg-[var(--background)]/94 p-6 shadow-sm backdrop-blur-md sm:p-8 md:p-10">
          <div className="text-center">
            <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">Set new password</h1>
            <p className="mt-2 font-display text-lg italic text-[var(--plum)]">
              {checking
                ? "Verifying your reset link…"
                : hasSession
                  ? "Choose a strong password for your account"
                  : "This reset link has expired"}
            </p>
          </div>

          {checking ? (
            <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">One moment…</p>
          ) : hasSession ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Request a new link below and we&apos;ll send a fresh email from Bollybee.
              </p>
              <RequestResetLinkForm />
            </div>
          )}

          {!checking && hasSession && (
            <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
              Link expired?{" "}
              <Link
                href="/account/forgot-password"
                className="text-[var(--plum)] underline-offset-4 hover:underline"
              >
                Request a new one
              </Link>
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
