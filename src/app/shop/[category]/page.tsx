import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { ShopSidebarFilters, ShopMobileFilters } from "@/components/shop/shop-filters";
import { Pagination } from "@/components/ui/pagination";
import { getProducts, getCategories } from "@/lib/data/products";
import { buildPageHref, parsePage, SHOP_PAGE_SIZE } from "@/lib/pagination";
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

  const page = parsePage(sp.page);
  const { products, total } = await getProducts({
    category: categorySlug,
    family: sp.family,
    sort: sp.sort,
    page,
    limit: SHOP_PAGE_SIZE,
  });
  const categories = await getCategories();

  const basePath = `/shop/${categorySlug}`;
  const filterParams = { family: sp.family, sort: sp.sort };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl">{category.name}</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{category.description}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {total} product{total !== 1 ? "s" : ""}
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <Suspense fallback={null}>
          <ShopSidebarFilters
            categories={categories}
            families={FRAGRANCE_FAMILIES}
            basePath={basePath}
            hideCategory
          />
        </Suspense>
        <div className="min-w-0">
          <Suspense fallback={null}>
            <div className="mb-6 lg:hidden">
              <ShopMobileFilters
                categories={categories}
                families={FRAGRANCE_FAMILIES}
                basePath={basePath}
                hideCategory
              />
            </div>
          </Suspense>
          {products.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] py-20 text-center">
              <p className="font-display text-xl text-[var(--muted)]">No fragrances found</p>
              <Link href={basePath} className="mt-4 inline-block text-sm text-[var(--plum)] underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            total={total}
            limit={SHOP_PAGE_SIZE}
            buildHref={(p) => buildPageHref(basePath, p, filterParams)}
          />
        </div>
      </div>
    </div>
  );
}
