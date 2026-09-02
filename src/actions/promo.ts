"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { calculatePromoDiscount } from "@/lib/commerce/promo";

export async function validatePromoCode(code: string, subtotal: number) {
  return calculatePromoDiscount(code, subtotal);
}

export async function createPromoCode(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const code = (formData.get("code") as string).trim().toUpperCase();
  const discountType = formData.get("discountType") as "PERCENT" | "FIXED";
  const discountValue = Number(formData.get("discountValue"));
  const minOrder = Number(formData.get("minOrderAmount") || 0);
  const maxUses = formData.get("maxUses") ? Number(formData.get("maxUses")) : null;
  const description = (formData.get("description") as string) || null;

  const { error } = await supabase.from("promo_codes").insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrder,
    max_uses: maxUses,
    description,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function togglePromoCode(id: string, active: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("promo_codes").update({ active }).eq("id", id);
  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function deletePromoCode(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/promo-codes");
  return { success: true };
}
