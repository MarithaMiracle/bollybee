"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10),
});

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to leave a review" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const authorName =
    profile?.full_name?.trim() ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Customer";

  const { error } = await supabase.from("product_reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    author_name: authorName,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    body: parsed.data.body,
    approved: false,
  });

  if (error) return { error: "Unable to submit review" };
  revalidatePath(`/product/${formData.get("productSlug")}`);
  return { success: true, message: "Review submitted for approval" };
}

export async function approveReview(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("product_reviews").update({ approved: true }).eq("id", id);
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("product_reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
  return { success: true };
}
