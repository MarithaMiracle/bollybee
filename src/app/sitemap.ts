import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("active", true);

    const productRoutes = (products ?? []).map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
