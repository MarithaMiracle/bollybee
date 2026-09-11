"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const slug = slugify(slugInput || name);

  if (!name) return { error: "Category name is required" };
  if (!slug) return { error: "Enter a valid name or slug" };

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description,
    active: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this slug already exists." };
    }
    return { error: "Failed to create category" };
  }

  revalidateCategoryPaths(slug);
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";
  const slug = slugify(slugInput || name);

  if (!name) return { error: "Category name is required" };
  if (!slug) return { error: "Enter a valid slug" };

  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("categories")
    .update({ name, slug, description, active })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this slug already exists." };
    }
    return { error: "Failed to update category" };
  }

  revalidateCategoryPaths(slug);
  if (existing?.slug && existing.slug !== slug) {
    revalidatePath(`/shop/${existing.slug}`);
  }
  return { success: true };
}

export async function toggleCategory(id: string, active: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("categories")
    .update({ active })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { error: "Failed to update category" };
  revalidateCategoryPaths(data?.slug);
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return { error: "Failed to delete category. Products may still be using it." };
  }

  revalidateCategoryPaths(existing?.slug);
  return { success: true };
}
