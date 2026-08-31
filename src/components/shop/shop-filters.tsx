"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fragranceFamilyLabel } from "@/lib/utils";
import type { Category } from "@/types";

interface ShopFiltersProps {
  categories: Category[];
  families: readonly string[];
}

export function ShopFilters({ categories, families }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentFamily = searchParams.get("family");
  const currentSort = searchParams.get("sort") || "newest";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  const shopCategories = categories.filter(
    (c) => !["gift-sets", "sample-packs"].includes(c.slug)
  );

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Category</h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => updateParam("category", null)}
              className={`text-sm ${!currentCategory ? "text-[var(--plum)] font-medium" : "text-[var(--muted-foreground)]"}`}
            >
              All
            </button>
          </li>
          {shopCategories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => updateParam("category", cat.slug)}
                className={`text-sm ${currentCategory === cat.slug ? "text-[var(--plum)] font-medium" : "text-[var(--muted-foreground)]"}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Family</h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => updateParam("family", null)}
              className={`text-sm ${!currentFamily ? "text-[var(--plum)] font-medium" : "text-[var(--muted-foreground)]"}`}
            >
              All
            </button>
          </li>
          {families.map((f) => (
            <li key={f}>
              <button
                type="button"
                onClick={() => updateParam("family", f.toLowerCase())}
                className={`text-sm ${currentFamily === f.toLowerCase() ? "text-[var(--plum)] font-medium" : "text-[var(--muted-foreground)]"}`}
              >
                {fragranceFamilyLabel(f)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="sort" className="mb-3 block text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
          Sort
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Name A–Z</option>
          <option value="price-desc">Name Z–A</option>
        </select>
      </div>
    </aside>
  );
}
