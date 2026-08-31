import { createServiceClient } from "@/lib/supabase/admin";

export interface PromoResult {
  code: string;
  discount: number;
  description: string | null;
}

export async function calculatePromoDiscount(
  code: string,
  subtotal: number
): Promise<{ error?: string; result?: PromoResult }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { error: "Enter a promo code" };

  const supabase = createServiceClient();
  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", normalized)
    .eq("active", true)
    .maybeSingle();

  if (!promo) return { error: "Invalid promo code" };

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { error: "This promo code has expired" };
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return { error: "This promo code has reached its usage limit" };
  }

  if (subtotal < promo.min_order_amount) {
    return {
      error: `Minimum order of ₦${promo.min_order_amount.toLocaleString()} required`,
    };
  }

  let discount = 0;
  if (promo.discount_type === "PERCENT") {
    discount = Math.floor((subtotal * promo.discount_value) / 100);
  } else {
    discount = promo.discount_value;
  }

  discount = Math.min(discount, subtotal);

  return {
    result: {
      code: promo.code,
      discount,
      description: promo.description,
    },
  };
}

export async function incrementPromoUsage(code: string) {
  const supabase = createServiceClient();
  const { data: promo } = await supabase
    .from("promo_codes")
    .select("used_count")
    .eq("code", code)
    .single();

  if (!promo) return;

  await supabase
    .from("promo_codes")
    .update({ used_count: promo.used_count + 1 })
    .eq("code", code);
}
