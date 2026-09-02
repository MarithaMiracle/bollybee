"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { productSchema, variationSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function createProduct(data: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const parsed = productSchema.safeParse({
    name: data.get("name"),
    slug: data.get("slug") || slugify(String(data.get("name"))),
    description: data.get("description") || undefined,
    shortDescription: data.get("shortDescription") || undefined,
    brand: data.get("brand") || "Bollybee",
    categoryId: data.get("categoryId") || null,
    fragranceFamily: data.get("fragranceFamily") || null,
    gender: data.get("gender") || "UNISEX",
    featured: data.get("featured") === "on",
    isBestseller: data.get("isBestseller") === "on",
    isNew: data.get("isNew") === "on",
    active: data.get("active") !== "off",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }

  const p = parsed.data;
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: p.name,
      slug: p.slug,
      description: p.description,
      short_description: p.shortDescription,
      brand: p.brand,
      category_id: p.categoryId || null,
      fragrance_family: p.fragranceFamily,
      gender: p.gender,
      featured: p.featured,
      is_bestseller: p.isBestseller,
      is_new: p.isNew,
      active: p.active,
    })
    .select("id")
    .single();

  if (error || !product) return { error: "Failed to create product" };

  revalidatePath("/admin/products");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, data: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const parsed = productSchema.safeParse({
    name: data.get("name"),
    slug: data.get("slug"),
    description: data.get("description") || undefined,
    shortDescription: data.get("shortDescription") || undefined,
    brand: data.get("brand") || "Bollybee",
    categoryId: data.get("categoryId") || null,
    fragranceFamily: data.get("fragranceFamily") || null,
    gender: data.get("gender") || "UNISEX",
    featured: data.get("featured") === "on",
    isBestseller: data.get("isBestseller") === "on",
    isNew: data.get("isNew") === "on",
    active: data.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data" };
  }

  const p = parsed.data;
  const { error } = await supabase
    .from("products")
    .update({
      name: p.name,
      slug: p.slug,
      description: p.description,
      short_description: p.shortDescription,
      brand: p.brand,
      category_id: p.categoryId || null,
      fragrance_family: p.fragranceFamily,
      gender: p.gender,
      featured: p.featured,
      is_bestseller: p.isBestseller,
      is_new: p.isNew,
      active: p.active,
    })
    .eq("id", id);

  if (error) return { error: "Failed to update product" };
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { success: true };
}

export async function addVariation(productId: string, data: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const parsed = variationSchema.safeParse({
    name: data.get("name"),
    volumeMl: Number(data.get("volumeMl")),
    price: Number(data.get("price")),
    compareAtPrice: data.get("compareAtPrice") ? Number(data.get("compareAtPrice")) : null,
    sku: data.get("sku"),
    stockQuantity: Number(data.get("stockQuantity")),
    active: true,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid variation" };
  }

  const v = parsed.data;
  const { error } = await supabase.from("product_variations").insert({
    product_id: productId,
    name: v.name,
    volume_ml: v.volumeMl,
    price: v.price,
    compare_at_price: v.compareAtPrice,
    sku: v.sku,
    stock_quantity: v.stockQuantity,
    active: v.active,
  });

  if (error) return { error: "Failed to add variation" };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function addScentNote(productId: string, noteType: string, name: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase.from("scent_notes").insert({
    product_id: productId,
    note_type: noteType,
    name,
    sort_order: 0,
  });

  if (error) return { error: "Failed to add scent note" };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function uploadProductImage(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const file = formData.get("file") as File | null;
  const variationId = formData.get("variationId") as string | null;

  if (!file || file.size === 0) return { error: "No file selected" };
  if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5MB" };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP allowed" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return { error: "Upload failed. Ensure the product-images bucket exists." };

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);

  const { error: dbError } = await supabase.from("product_images").insert({
    product_id: productId,
    variation_id: variationId || null,
    image_url: urlData.publicUrl,
    alt_text: formData.get("altText") as string || null,
    sort_order: Number(formData.get("sortOrder") || 0),
  });

  if (dbError) return { error: "Failed to save image record" };
  revalidatePath(`/admin/products/${productId}`);
  return { success: true, url: urlData.publicUrl };
}

export async function deleteProductImage(imageId: string, productId: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "Failed to delete product. It may be linked to existing orders." };
  revalidatePath("/admin/products");
  return { success: true };
}
