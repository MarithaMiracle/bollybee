"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureCustomerProfile, formatFeatureError } from "@/lib/auth/ensure-profile";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  shippingState: z.string().min(1),
  shippingLga: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingAddress: z.string().min(5),
  shippingLandmark: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function saveAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required" };

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    shippingState: formData.get("shippingState"),
    shippingLga: formData.get("shippingLga"),
    shippingCity: formData.get("shippingCity"),
    shippingAddress: formData.get("shippingAddress"),
    shippingLandmark: formData.get("shippingLandmark") || undefined,
    shippingPostalCode: formData.get("shippingPostalCode") || undefined,
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const profile = await ensureCustomerProfile(supabase, user);
  if (!profile.ok) {
    return { error: formatFeatureError({ message: profile.error }, "addresses") };
  }

  if (parsed.data.isDefault) {
    await supabase
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase.from("saved_addresses").insert({
    user_id: user.id,
    label: parsed.data.label,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    shipping_state: parsed.data.shippingState,
    shipping_lga: parsed.data.shippingLga,
    shipping_city: parsed.data.shippingCity,
    shipping_address: parsed.data.shippingAddress,
    shipping_landmark: parsed.data.shippingLandmark ?? null,
    shipping_postal_code: parsed.data.shippingPostalCode ?? null,
    is_default: parsed.data.isDefault ?? false,
  });

  if (error) return { error: formatFeatureError(error, "addresses") };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required" };

  await supabase.from("saved_addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function getSavedAddresses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("saved_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function setDefaultAddress(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required" };

  await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("saved_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/account/addresses");
  return { success: true };
}
