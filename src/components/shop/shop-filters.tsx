"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn, fragranceFamilyLabel } from "@/lib/utils";
import type { Category } from "@/types";

interface ShopFiltersProps {
  categories: Category[];
  families: readonly string[];
  basePath?: string;
  hideCategory?: boolean;
}

function filterButtonClass(active: boolean) {
  return cn(
    "cursor-pointer text-left text-sm transition-colors",
    active
      ? "font-medium text-[var(--plum)] hover:opacity-80"
      : "text-[var(--muted-foreground)] hover:text-[var(--plum)]"
  );
}

export function ShopFiltersPanel({
  categories,
  families,
  basePath = "/shop",
  hideCategory = false,
  onNavigate,
}: ShopFiltersProps & { onNavigate?: () => void }) {
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
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
    onNavigate?.();
  }

  const shopCategories = categories.filter(
    (c) => !["gift-sets", "sample-packs"].includes(c.slug)
  );

  return (
    <div className="space-y-8">
      {!hideCategory && (
        <div>
          <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
            Category
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => updateParam("category", null)}
                className={filterButtonClass(!currentCategory)}
              >
                All
              </button>
            </li>
            {shopCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => updateParam("category", cat.slug)}
                  className={filterButtonClass(currentCategory === cat.slug)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Family</h3>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => updateParam("family", null)}
              className={filterButtonClass(!currentFamily)}
            >
              All
            </button>
          </li>
          {families.map((f) => (
            <li key={f}>
              <button
                type="button"
                onClick={() => updateParam("family", f.toLowerCase())}
                className={filterButtonClass(currentFamily === f.toLowerCase())}
              >
                {fragranceFamilyLabel(f)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label
          htmlFor="sort"
          className="mb-3 block text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]"
        >
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
    </div>
  );
}

export function ShopSidebarFilters(props: ShopFiltersProps) {
  return (
    <aside className="hidden lg:block">
      <ShopFiltersPanel {...props} />
    </aside>
  );
}

export function ShopMobileFilters(props: ShopFiltersProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeCount = [searchParams.get("category"), searchParams.get("family")].filter(Boolean)
    .length;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 border border-[var(--border)] bg-white px-4 py-3 text-xs font-medium uppercase tracking-wider"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-[var(--plum)] px-2 py-0.5 text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h2 className="font-display text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-[var(--muted-foreground)]"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ShopFiltersPanel {...props} onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/** @deprecated Use ShopSidebarFilters + ShopMobileFilters */
export function ShopFilters(props: ShopFiltersProps) {
  return (
    <>
      <ShopSidebarFilters {...props} />
      <ShopMobileFilters {...props} />
    </>
  );
}
