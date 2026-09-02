"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureCustomerProfile, formatFeatureError } from "@/lib/auth/ensure-profile";

export async function toggleWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sign in to save to your wishlist", requiresAuth: true };

  const profile = await ensureCustomerProfile(supabase, user);
  if (!profile.ok) {
    return { error: formatFeatureError({ message: profile.error }, "wishlist") };
  }

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id);
    if (error) return { error: formatFeatureError(error, "wishlist") };
    revalidatePath("/account/wishlist");
    revalidatePath("/product");
    return { success: true, added: false };
  }

  const { error } = await supabase.from("wishlist_items").insert({
    user_id: user.id,
    product_id: productId,
  });

  if (error) return { error: formatFeatureError(error, "wishlist") };
  revalidatePath("/account/wishlist");
  revalidatePath("/product");
  return { success: true, added: true };
}

export async function removeWishlistItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sign in to manage your wishlist" };

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { error: formatFeatureError(error, "wishlist") };
  revalidatePath("/account/wishlist");
  revalidatePath("/product");
  return { success: true };
}

export async function isInWishlist(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  return Boolean(data);
}
