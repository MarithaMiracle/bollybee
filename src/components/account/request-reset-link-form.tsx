"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/actions/auth";

interface RequestResetLinkFormProps {
  className?: string;
}

export function RequestResetLinkForm({ className }: RequestResetLinkFormProps) {
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

  if (sent) {
    return (
      <div className={className}>
        <p className="text-sm text-[var(--muted-foreground)]">
          If an account exists for that email, a new reset link is on its way. Check your inbox and
          spam folder.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/account/login">Return to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input id="reset-email" name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" variant="accent" className="mt-4 w-full" disabled={loading}>
        {loading ? "Sending…" : "Send new reset link"}
      </Button>
    </form>
  );
}
