"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024;

function validateImageFile(file: File | null) {
  if (!file || file.size === 0) return { error: "No file selected" } as const;
  if (file.size > MAX_BYTES) return { error: "File must be under 5MB" } as const;
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return { error: "Only JPEG, PNG, and WebP allowed" } as const;
  }
  return { file } as const;
}

function fileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}

function revalidateLanding() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");
}

export async function updateHeroImage(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const validated = validateImageFile(formData.get("file") as File | null);
  if ("error" in validated) return { error: validated.error };

  const { file } = validated;
  const altText = String(formData.get("altText") ?? "").trim() || "Bollybee fragrance bottle on blush silk";
  const ext = fileExtension(file);
  const path = `site/hero-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: "Upload failed. Ensure the product-images bucket exists." };
  }

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);

  const { error: dbError } = await supabase.from("site_content").upsert({
    key: "hero",
    image_url: urlData.publicUrl,
    alt_text: altText,
    updated_at: new Date().toISOString(),
  });

  if (dbError) return { error: "Failed to save hero image" };
  revalidateLanding();
  return { success: true, url: urlData.publicUrl };
}

export async function updateHeroAltText(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const altText = String(formData.get("altText") ?? "").trim() || null;

  const { data: existing } = await supabase
    .from("site_content")
    .select("image_url")
    .eq("key", "hero")
    .maybeSingle();

  if (!existing?.image_url) {
    return { error: "Upload a hero image first" };
  }

  const { error } = await supabase
    .from("site_content")
    .update({ alt_text: altText, updated_at: new Date().toISOString() })
    .eq("key", "hero");

  if (error) return { error: "Failed to update alt text" };
  revalidateLanding();
  return { success: true };
}

export async function uploadCategoryImage(categoryId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const validated = validateImageFile(formData.get("file") as File | null);
  if ("error" in validated) return { error: validated.error };

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found" };

  const { file } = validated;
  const ext = fileExtension(file);
  const path = `categories/${categoryId}/cover-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: "Upload failed. Ensure the product-images bucket exists." };
  }

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);

  const { error: dbError } = await supabase
    .from("categories")
    .update({ image_url: urlData.publicUrl })
    .eq("id", categoryId);

  if (dbError) return { error: "Failed to save category image" };

  revalidateLanding();
  revalidatePath(`/shop/${category.slug}`);
  return { success: true, url: urlData.publicUrl };
}

export async function clearCategoryImage(categoryId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found" };

  const { error } = await supabase
    .from("categories")
    .update({ image_url: null })
    .eq("id", categoryId);

  if (error) return { error: "Failed to clear category image" };

  revalidateLanding();
  revalidatePath(`/shop/${category.slug}`);
  return { success: true };
}
