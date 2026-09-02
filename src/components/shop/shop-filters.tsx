"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn, fragranceFamilyLabel } from "@/lib/utils";
import { Select } from "@/components/ui/select";
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

function useShopParamUpdater(basePath: string, onNavigate?: () => void) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
    onNavigate?.();
  }

  return { searchParams, updateParam };
}

export function ShopSortSelect({
  basePath = "/shop",
  className,
  id = "sort",
  onNavigate,
}: {
  basePath?: string;
  className?: string;
  id?: string;
  onNavigate?: () => void;
}) {
  const { searchParams, updateParam } = useShopParamUpdater(basePath, onNavigate);
  const currentSort = searchParams.get("sort") || "newest";

  return (
    <div className={cn("flex flex-col gap-2 sm:min-w-[11rem]", className)}>
      <label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]"
      >
        Sort
      </label>
      <Select
        id={id}
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Name A–Z</option>
        <option value="price-desc">Name Z–A</option>
      </Select>
    </div>
  );
}

export function ShopFiltersPanel({
  categories,
  families,
  basePath = "/shop",
  hideCategory = false,
  hideSort = false,
  layout = "stack",
  onNavigate,
}: ShopFiltersProps & {
  hideSort?: boolean;
  layout?: "stack" | "bar";
  onNavigate?: () => void;
}) {
  const { searchParams, updateParam } = useShopParamUpdater(basePath, onNavigate);
  const currentCategory = searchParams.get("category");
  const currentFamily = searchParams.get("family");

  const shopCategories = categories.filter(
    (c) => !["gift-sets", "sample-packs"].includes(c.slug)
  );

  const categoryBlock = !hideCategory ? (
    <div>
      <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
        Category
      </h3>
      <ul className="list-none space-y-2 p-0">
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
  ) : null;

  const familyBlock = (
    <div>
      <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Family</h3>
      <ul className="list-none space-y-2 p-0">
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
  );

  if (layout === "bar") {
    return (
      <div className="grid gap-8 border-b border-[var(--border)] pb-8 sm:grid-cols-2 sm:gap-12">
        {categoryBlock}
        {familyBlock}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categoryBlock}
      {familyBlock}
      {!hideSort && (
        <ShopSortSelect basePath={basePath} id="sort-mobile" onNavigate={onNavigate} />
      )}
    </div>
  );
}

export function ShopSidebarFilters(props: ShopFiltersProps) {
  return (
    <aside className="hidden lg:block">
      <ShopFiltersPanel {...props} hideSort />
    </aside>
  );
}

export function ShopMobileFilters(props: ShopFiltersProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeCount = [
    searchParams.get("category"),
    searchParams.get("family"),
    searchParams.get("q"),
  ].filter(Boolean).length;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors hover:border-[var(--plum)] hover:text-[var(--plum)]"
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
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/50"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 z-10 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl sm:max-w-sm sm:rounded-l-[var(--radius-lg)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="font-display text-lg sm:text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--plum)] transition-colors hover:bg-[var(--surface)]"
                aria-label="Close filters"
              >
                <span className="sm:hidden">Close</span>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <ShopFiltersPanel {...props} onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-[var(--border)] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[var(--radius)] bg-[var(--plum)] px-4 text-xs font-medium uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
              >
                Show results
              </button>
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
