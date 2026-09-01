import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Wishlist/addresses FK profiles(id) — ensure row exists for signed-in users. */
export async function ensureCustomerProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return { ok: true };

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? "",
    role: "CUSTOMER",
  });

  if (error && error.code !== "23505") {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export function formatFeatureError(error: { message?: string; code?: string }, feature: string) {
  const msg = error.message ?? "";
  if (
    msg.includes("Could not find the table") ||
    msg.includes("does not exist") ||
    error.code === "42P01"
  ) {
    return `The ${feature} feature is not set up yet. Run migration 006 in the Supabase SQL Editor.`;
  }
  if (error.code === "23503") {
    return "Your account profile is missing. Sign out and sign in again, then retry.";
  }
  return `Unable to update ${feature}. Please try again.`;
}
