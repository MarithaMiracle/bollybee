"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { newsletterSchema } from "@/lib/validations";
import { newsletterWelcomeEmail, sendTemplatedEmail } from "@/lib/email";

export async function subscribeNewsletter(email: string) {
  const parsed = newsletterSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email: parsed.data.email, status: "SUBSCRIBED", subscribed_at: new Date().toISOString() },
    { onConflict: "email" }
  );

  if (error) {
    if (error.code === "23505") return { error: "You are already subscribed" };
    return { error: "Unable to subscribe. Please try again." };
  }

  await sendTemplatedEmail(parsed.data.email, newsletterWelcomeEmail());

  return { success: true };
}
