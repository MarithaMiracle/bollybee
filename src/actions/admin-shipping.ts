"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";

export async function createShippingRate(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const stateId = formData.get("stateId") as string;
  const lgaId = (formData.get("lgaId") as string) || null;
  const price = Number(formData.get("price"));

  if (!stateId) return { error: "State is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price" };

  const { error } = await supabase.from("shipping_rates").insert({
    state_id: stateId,
    lga_id: lgaId || null,
    price: Math.round(price),
    active: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A rate already exists for this state and LGA." };
    }
    return { error: "Failed to create shipping rate" };
  }

  revalidatePath("/admin/shipping");
  return { success: true };
}

export async function updateShippingRatePrice(id: string, price: number) {
  await requireAdmin();
  const supabase = createServiceClient();

  if (!Number.isFinite(price) || price < 0) {
    return { error: "Enter a valid price" };
  }

  const { error } = await supabase
    .from("shipping_rates")
    .update({ price: Math.round(price) })
    .eq("id", id);

  if (error) return { error: "Failed to update price" };

  revalidatePath("/admin/shipping");
  return { success: true };
}

export async function toggleShippingRate(id: string, active: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase.from("shipping_rates").update({ active }).eq("id", id);

  if (error) return { error: "Failed to update rate" };

  revalidatePath("/admin/shipping");
  return { success: true };
}

export async function deleteShippingRate(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase.from("shipping_rates").delete().eq("id", id);

  if (error) return { error: "Failed to delete rate" };

  revalidatePath("/admin/shipping");
  return { success: true };
}
