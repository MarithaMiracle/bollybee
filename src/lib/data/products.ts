import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SHOP_PAGE_SIZE } from "@/lib/pagination";
import type { Product } from "@/types";

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  variations:product_variations(*),
  images:product_images(*),
  scent_notes(*)
`;

export async function getFeaturedProducts(limit = 4) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getBestsellers(limit = 4) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("is_bestseller", true)
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getNewArrivals(limit = 4) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getCategories() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");
  return data ?? [];
}

/** Active shop categories with a cover image taken from a product in that category. */
export async function getShopCategoriesWithProductImages(
  excludeSlugs: string[] = ["gift-sets", "sample-packs"]
): Promise<(Category & { image_alt?: string | null })[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  const shopCategories = ((categories ?? []) as Category[]).filter(
    (c) => !excludeSlugs.includes(c.slug)
  );
  if (!shopCategories.length) return [];

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, category_id, featured, is_bestseller, created_at, images:product_images(image_url, alt_text, sort_order)"
    )
    .eq("active", true)
    .in(
      "category_id",
      shopCategories.map((c) => c.id)
    );

  type ProductRow = {
    id: string;
    category_id: string;
    featured: boolean;
    is_bestseller: boolean;
    created_at: string;
    images: { image_url: string; alt_text: string | null; sort_order: number }[] | null;
  };

  const byCategory = new Map<string, ProductRow[]>();
  for (const product of (products ?? []) as ProductRow[]) {
    const list = byCategory.get(product.category_id) ?? [];
    list.push(product);
    byCategory.set(product.category_id, list);
  }

  return shopCategories.map((category) => {
    const candidates = (byCategory.get(category.id) ?? [])
      .map((product) => {
        const images = [...(product.images ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order || a.image_url.localeCompare(b.image_url)
        );
        return { product, cover: images[0] ?? null };
      })
      .filter((entry) => entry.cover);

    candidates.sort((a, b) => {
      if (a.product.featured !== b.product.featured) return a.product.featured ? -1 : 1;
      if (a.product.is_bestseller !== b.product.is_bestseller) {
        return a.product.is_bestseller ? -1 : 1;
      }
      return b.product.created_at.localeCompare(a.product.created_at);
    });

    const pick = candidates[0];
    return {
      ...category,
      image_url: pick?.cover?.image_url ?? null,
      image_alt: pick?.cover?.alt_text ?? category.name,
    };
  });
}

export async function getProducts(filters?: {
  category?: string;
  family?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  if (!isSupabaseConfigured()) return { products: [], total: 0 };
  const supabase = await createClient();
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("active", true);

  if (filters?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (filters?.family) {
    query = query.eq("fragrance_family", filters.family.toUpperCase());
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  switch (filters?.sort) {
    case "price-asc":
      query = query.order("name");
      break;
    case "price-desc":
      query = query.order("name", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  return { products: (data ?? []) as Product[], total: count ?? 0 };
}

export async function getProductBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return data as Product | null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .neq("id", product.id)
    .limit(limit);

  if (product.category_id) {
    query = query.eq("category_id", product.category_id);
  } else if (product.fragrance_family) {
    query = query.eq("fragrance_family", product.fragrance_family);
  }

  const { data } = await query;
  return (data ?? []) as Product[];
}

export async function getGiftSets() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("gift_sets")
    .select("*")
    .eq("active", true)
    .not("slug", "ilike", "%-discovery-pack")
    .order("name");
  return data ?? [];
}

export async function getSamplePacks() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("gift_sets")
    .select("*")
    .eq("active", true)
    .ilike("slug", "%-discovery-pack")
    .order("price");
  return data ?? [];
}

export async function getStates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("states")
    .select("*")
    .eq("active", true)
    .order("name");
  return data ?? [];
}

export async function getLgasByState(stateId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lgas")
    .select("*")
    .eq("state_id", stateId)
    .eq("active", true)
    .order("name");
  return data ?? [];
}

export async function getOrderByNumberAndEmail(orderNumber: string, email: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .ilike("email", email)
    .single();
  return data;
}

export async function searchProducts(q: string, page = 1, limit = SHOP_PAGE_SIZE) {
  return getProducts({ search: q, page, limit });
}
