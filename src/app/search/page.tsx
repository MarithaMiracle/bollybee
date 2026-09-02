import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/data/products";
import { SearchForm } from "@/components/shop/search-form";
import { BackLink } from "@/components/layout/back-link";
import { Pagination } from "@/components/ui/pagination";
import { buildPageHref, parsePage, SHOP_PAGE_SIZE } from "@/lib/pagination";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function SearchResults({ q, page }: { q?: string; page: number }) {
  if (!q) {
    return <p className="text-[var(--muted-foreground)]">Enter a search term to find fragrances.</p>;
  }
  const { products, total } = await searchProducts(q, page, SHOP_PAGE_SIZE);
  return (
    <>
      <p className="mb-6 text-sm text-[var(--muted)]">
        {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
      </p>
      {products.length === 0 ? (
        <p>No fragrances found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <Pagination
        page={page}
        total={total}
        limit={SHOP_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/search", p, { q })}
      />
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);

  return (
    <div className="flex flex-1 flex-col bg-[var(--satin-light)]">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-8 md:py-16">
        <BackLink href="/shop" label="Back to shop" className="mb-6" />
        <h1 className="font-display text-3xl sm:text-4xl">Search</h1>
        <Suspense fallback={null}>
          <SearchForm initialQuery={params.q} />
        </Suspense>
        <div className="mt-10">
          <SearchResults q={params.q} page={page} />
        </div>
      </div>
    </div>
  );
}

export const metadata = { title: "Search" };
