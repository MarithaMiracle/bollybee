"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await subscribeNewsletter(email);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      if (result.emailSent && result.testInbox) {
        toast.success(`Welcome to the Bollybee Circle! Email sent to ${result.testInbox} (test mode).`);
      } else if (result.emailSent) {
        toast.success("Welcome to the Bollybee Circle! Check your inbox.");
      } else {
        toast.success("Subscribed!");
        toast.warning("Welcome email could not be sent — check Resend env vars.");
      }
      setEmail("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
        aria-label="Email for newsletter"
      />
      <Button type="submit" variant="outline" disabled={loading} className="border-white text-white hover:bg-white hover:text-[var(--plum)]">
        {loading ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
