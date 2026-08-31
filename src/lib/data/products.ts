import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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

export async function searchProducts(q: string) {
  return getProducts({ search: q, limit: 24 });
}
