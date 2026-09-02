"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { BackLink } from "@/components/layout/back-link";

const SATIN_BG = "/brand/admin-login-satin-bg.png";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setLoading(false);

    if (error) {
      toast.error("Invalid credentials");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={SATIN_BG}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-[var(--background)]/35" aria-hidden />
      </div>

      <div className="w-full max-w-md">
        <BackLink href="/" label="Back to storefront" className="mb-6" />
        <article className="brand-panel-xl border-[var(--border)]/80 bg-[var(--background)]/94 p-8 shadow-sm backdrop-blur-md md:p-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/brand/bollybee-mark.png"
              alt=""
              width={48}
              height={58}
              unoptimized
            />
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.35em] text-[var(--foreground)]">
              Admin portal
            </p>
            <h1 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">
              Sign in
            </h1>
            <p className="mt-2 font-display text-lg italic text-[var(--plum)]">
              Bollybee administration
            </p>
          </div>

          {searchParams.get("error") === "unauthorized" && (
            <p className="mt-6 rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-center text-sm text-red-800">
              Unauthorized — this account does not have admin access.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            Authorized personnel only
          </p>
        </article>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
