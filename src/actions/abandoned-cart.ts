"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import type { CartItem } from "@/types";

export async function trackAbandonedCart(email: string, items: CartItem[], userId?: string | null) {
  if (!email || !items.length) return { success: false };

  const supabase = createServiceClient();
  const normalized = email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from("abandoned_carts")
    .select("id")
    .eq("email", normalized)
    .is("recovered_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    email: normalized,
    user_id: userId ?? null,
    cart_items: items,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("abandoned_carts").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("abandoned_carts").insert(payload);
  }

  return { success: true };
}

export async function markAbandonedCartRecovered(email: string) {
  const supabase = createServiceClient();
  await supabase
    .from("abandoned_carts")
    .update({ recovered_at: new Date().toISOString() })
    .eq("email", email.trim().toLowerCase())
    .is("recovered_at", null);
}
