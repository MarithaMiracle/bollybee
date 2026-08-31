import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/components/shop/shop-filters";
import { getProducts, getCategories } from "@/lib/data/products";
import { FRAGRANCE_FAMILIES, fragranceFamilyLabel } from "@/lib/utils";

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
  const page = parseInt(params.page || "1", 10);
  const { products, total } = await getProducts({
    category: params.category,
    family: params.family,
    search: params.q,
    sort: params.sort,
    page,
    limit: 12,
  });
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl">Shop Fragrances</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {total} fragrance{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 animate-pulse bg-[var(--surface)]" />}>
          <ShopFilters categories={categories} families={FRAGRANCE_FAMILIES} />
        </Suspense>
        <div>
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
          {total > 12 && (
            <div className="mt-10 flex justify-center gap-4">
              {page > 1 && (
                <Link
                  href={`/shop?page=${page - 1}${params.category ? `&category=${params.category}` : ""}`}
                  className="text-sm uppercase tracking-wider text-[var(--plum)]"
                >
                  Previous
                </Link>
              )}
              {page * 12 < total && (
                <Link
                  href={`/shop?page=${page + 1}${params.category ? `&category=${params.category}` : ""}`}
                  className="text-sm uppercase tracking-wider text-[var(--plum)]"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Shop Fragrances" };
}
