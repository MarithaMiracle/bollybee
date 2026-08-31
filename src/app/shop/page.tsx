import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ShopSidebarFilters, ShopMobileFilters } from "@/components/shop/shop-filters";
import { Pagination } from "@/components/ui/pagination";
import { getProducts, getCategories } from "@/lib/data/products";
import { buildPageHref, parsePage, SHOP_PAGE_SIZE } from "@/lib/pagination";
import { FRAGRANCE_FAMILIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    family?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const { products, total } = await getProducts({
    category: params.category,
    family: params.family,
    search: params.q,
    sort: params.sort,
    page,
    limit: SHOP_PAGE_SIZE,
  });
  const categories = await getCategories();

  const filterParams = {
    category: params.category,
    family: params.family,
    sort: params.sort,
    q: params.q,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl">Shop Fragrances</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {total} fragrance{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <Suspense fallback={<div className="hidden h-40 animate-pulse bg-[var(--surface)] lg:block" />}>
          <ShopSidebarFilters categories={categories} families={FRAGRANCE_FAMILIES} />
        </Suspense>
        <div className="min-w-0">
          <Suspense fallback={null}>
            <div className="mb-6 lg:hidden">
              <ShopMobileFilters categories={categories} families={FRAGRANCE_FAMILIES} />
            </div>
          </Suspense>
          {products.length === 0 ? (
            <div className="border border-dashed border-[var(--border)] py-20 text-center">
              <p className="font-display text-xl text-[var(--muted)]">No fragrances found</p>
              <Link href="/shop" className="mt-4 inline-block text-sm text-[var(--plum)] underline">
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
            buildHref={(p) => buildPageHref("/shop", p, filterParams)}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Shop Fragrances" };
}
