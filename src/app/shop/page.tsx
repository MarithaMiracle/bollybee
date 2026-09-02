import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ShopSidebarFilters, ShopMobileFilters } from "@/components/shop/shop-filters";
import { ShopSearchToolbar } from "@/components/shop/shop-search-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { getProducts, getCategories } from "@/lib/data/products";
import { buildPageHref, parsePage, SHOP_PAGE_SIZE } from "@/lib/pagination";
import { FRAGRANCE_FAMILIES } from "@/lib/utils";

export const revalidate = 60;

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
    <>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">Shop Fragrances</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {total} fragrance{total !== 1 ? "s" : ""}
        {params.q ? (
          <>
            {" "}
            matching &ldquo;{params.q}&rdquo;
            {" · "}
            <Link
              href={buildPageHref("/shop", 1, {
                category: params.category,
                family: params.family,
                sort: params.sort,
              })}
              className="text-[var(--plum)] underline-offset-4 hover:underline"
            >
              Clear search
            </Link>
          </>
        ) : null}
      </p>
      <Suspense fallback={null}>
        <ShopSearchToolbar initialQuery={params.q} className="mt-6" />
      </Suspense>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
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
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] py-20 text-center">
              <p className="font-display text-xl text-[var(--muted)]">No fragrances found</p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-sm text-[var(--plum)] underline-offset-4 hover:underline"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
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
    </>
  );
}

export async function generateMetadata() {
  return { title: "Shop Fragrances" };
}
