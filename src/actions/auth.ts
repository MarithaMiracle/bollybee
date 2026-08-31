"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendTemplatedEmail, welcomeEmail } from "@/lib/email";

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
    },
  });

  if (error) return { error: error.message };

  const fullName = (formData.get("fullName") as string)?.trim();
  const firstName = fullName?.split(/\s+/)[0] || "there";
  const email = formData.get("email") as string;
  await sendTemplatedEmail(email, welcomeEmail(firstName));

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
