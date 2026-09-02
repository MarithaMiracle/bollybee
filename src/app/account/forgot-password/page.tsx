"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/actions/auth";
import { BackLink } from "@/components/layout/back-link";

const SATIN_BG = "/brand/admin-login-satin-bg.png";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result.testInbox) {
        setSent(true);
        toast.success(`Reset link sent to ${result.testInbox} (Resend test mode).`);
      } else {
        setSent(true);
        toast.success("Reset link sent — check your email.");
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
            <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">Forgot password</h1>
            <p className="mt-2 font-display text-lg italic text-[var(--plum)]">
              We&apos;ll email you a reset link
            </p>
          </div>

          {sent ? (
            <div className="mt-8 space-y-4 text-center text-sm text-[var(--muted-foreground)]">
              <p>
                If an account exists for that email, a password reset link is on its way.
                Check your inbox and spam folder.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/account/login">Return to sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
        </article>
      </div>
    </div>
  );
}
