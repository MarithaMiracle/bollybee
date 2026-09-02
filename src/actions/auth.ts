"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  sendTemplatedEmail,
  welcomeEmail,
  passwordResetEmail,
  getResendTestInbox,
} from "@/lib/email";
import { authCallbackUrl, SITE_URL } from "@/lib/site";

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

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: { full_name: formData.get("fullName") as string },
      emailRedirectTo: authCallbackUrl("/account/orders"),
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

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) return { error: "Email is required" };

  const redirectTo = `${SITE_URL}/auth/recovery`;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    const hashedToken = data?.properties?.hashed_token;
    // Direct link avoids Supabase PKCE redirect issues with admin.generateLink
    const resetLink = hashedToken
      ? `${SITE_URL}/auth/recovery?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
      : data?.properties?.action_link;

    if (!error && resetLink) {
      const sent = await sendTemplatedEmail(email, passwordResetEmail(resetLink));
      const testInbox = getResendTestInbox();

      if (!sent && !testInbox) {
        return { error: "Unable to send reset email. Please try again later." };
      }

      return { success: true, testInbox };
    }
  } catch (e) {
    console.error("[auth] password reset failed:", e);
    return { error: "Unable to send reset email. Please try again later." };
  }

  // Don't reveal whether the email exists
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message ?? "Unable to update password" };

  revalidatePath("/", "layout");
  return { success: true };
}
