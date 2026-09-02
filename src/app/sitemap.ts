import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const staticRoutes = [
    "", "/shop", "/about", "/faq", "/contact", "/privacy", "/terms", "/gift-sets", "/sample-packs", "/track-order",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  if (!isSupabaseConfigured()) return staticRoutes;

  try {
    const supabase = createServiceClient();
    const [{ data: products }, { data: categoriesRaw }] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("active", true),
      supabase.from("categories").select("slug, updated_at").eq("active", true),
    ]);

    const categories = (categoriesRaw ?? []).filter(
      (c) => !["gift-sets", "sample-packs"].includes(c.slug)
    );

    const productRoutes = (products ?? []).map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const categoryRoutes = (categories ?? []).map((c) => ({
      url: `${base}/shop/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
