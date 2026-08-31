import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/data/products";
import { SearchForm } from "@/components/shop/search-form";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ q }: { q?: string }) {
  if (!q) {
    return <p className="text-[var(--muted-foreground)]">Enter a search term to find fragrances.</p>;
  }
  const { products, total } = await searchProducts(q);
  return (
    <>
      <p className="mb-6 text-sm text-[var(--muted)]">{total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;</p>
      {products.length === 0 ? (
        <p>No fragrances found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="font-display text-4xl">Search</h1>
      <Suspense fallback={null}>
        <SearchForm initialQuery={q} />
      </Suspense>
      <div className="mt-10">
        <SearchResults q={q} />
      </div>
    </div>
  );
}

export const metadata = { title: "Search" };
