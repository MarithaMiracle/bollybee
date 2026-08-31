"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validations";

export async function submitContact(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("contact_submissions").insert(parsed.data);

  if (error) return { error: "Unable to send message. Please try again." };
  return { success: true };
}
