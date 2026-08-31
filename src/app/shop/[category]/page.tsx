import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/components/shop/shop-filters";
import { getProducts, getCategories } from "@/lib/data/products";
import { FRAGRANCE_FAMILIES } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ family?: string; sort?: string; page?: string }>;
}

export default async function CategoryShopPage({ params, searchParams }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .eq("active", true)
    .single();

  if (!category) notFound();

  const page = parseInt(sp.page || "1", 10);
  const { products, total } = await getProducts({
    category: categorySlug,
    family: sp.family,
    sort: sp.sort,
    page,
    limit: 12,
  });
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-display text-4xl">{category.name}</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{category.description}</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={null}>
          <ShopFilters categories={categories} families={FRAGRANCE_FAMILIES} />
        </Suspense>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
      <p className="mt-6 text-sm text-[var(--muted)]">{total} products</p>
    </div>
  );
}
