"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/actions/contact";
import { cn } from "@/lib/utils";

type ContactFormProps = {
  className?: string;
};

export function ContactForm({ className }: ContactFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await submitContact(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Message sent! We will respond shortly.");
      e.currentTarget.reset();
    }
  }

  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground)]";
  const fieldClass =
    "border-0 border-b-2 border-[var(--foreground)]/30 bg-transparent px-0 text-base text-[var(--foreground)] shadow-none placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--foreground)] focus-visible:ring-0";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-8", className)}>
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>
            Name
          </Label>
          <Input id="name" name="name" required placeholder="Your name" className={fieldClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone" className={labelClass}>
            Phone{" "}
            <span className="font-normal normal-case tracking-normal text-[var(--muted-foreground)]">
              (optional)
            </span>
          </Label>
          <Input id="phone" name="phone" type="tel" placeholder="Your number" className={fieldClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject" className={labelClass}>
            Subject
          </Label>
          <Input
            id="subject"
            name="subject"
            required
            placeholder="What is this about?"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className={labelClass}>
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us how we can help…"
          className={cn(fieldClass, "min-h-[150px] resize-y")}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 sm:w-auto sm:min-w-[180px]"
      >
        {loading ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
