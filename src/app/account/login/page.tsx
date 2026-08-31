"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/actions/auth";

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
        } else {
          toast.success("Account created! Check your email if confirmation is required.");
          router.push("/account/orders");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl text-center">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={6} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        {mode === "login" ? (
          <span>
            No account?{" "}
            <button type="button" className="text-[var(--plum)] underline" onClick={() => setMode("register")}>
              Register
            </button>
          </span>
        ) : (
          <span>
            Have an account?{" "}
            <button type="button" className="text-[var(--plum)] underline" onClick={() => setMode("login")}>
              Sign In
            </button>
          </span>
        )}
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-xs text-[var(--muted)]">Continue as guest</Link>
      </p>
    </div>
  );
}
