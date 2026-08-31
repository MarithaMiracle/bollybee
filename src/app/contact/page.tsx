"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/actions/contact";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Message sent! We will respond shortly.");
      e.currentTarget.reset();
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-4xl">Contact Us</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        We&apos;d love to hear from you. Reach out and we&apos;ll respond as soon as possible.
      </p>
      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" required />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" required rows={5} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send Message"}
        </Button>
      </form>
      <p className="mt-8 text-sm text-[var(--muted)]">hello@bollybee.com</p>
    </div>
  );
}
