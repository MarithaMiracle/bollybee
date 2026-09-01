"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendTemplatedEmail, welcomeEmail, getResendTestInbox } from "@/lib/email";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: "Invalid email or password" };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: { full_name: formData.get("fullName") as string },
      emailRedirectTo: `${appUrl}/account/login`,
    },
  });

  if (error) {
    const msg = error.message ?? "Unable to create account";
    if (
      msg.toLowerCase().includes("rate limit") ||
      error.code === "over_email_send_rate_limit"
    ) {
      return {
        error:
          "Supabase auth email limit reached. Configure Resend SMTP or turn off Confirm email under Supabase → Authentication → Providers → Email.",
      };
    }
    if (
      msg.toLowerCase().includes("confirmation email") ||
      msg.toLowerCase().includes("error sending")
    ) {
      return {
        error:
          "Could not send confirmation email. Resend test mode only delivers auth mail to bollybeefraglab@gmail.com — sign up with that address, or disable Confirm email in Supabase while testing.",
      };
    }
    return { error: msg };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const firstName = fullName?.split(/\s+/)[0] || "there";
  const email = formData.get("email") as string;
  const emailSent = await sendTemplatedEmail(email, welcomeEmail(firstName));

  const testInbox = getResendTestInbox();

  revalidatePath("/", "layout");
  return { success: true, emailSent, testInbox };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
