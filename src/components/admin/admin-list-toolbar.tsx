"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type AdminFilterConfig = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

interface AdminListToolbarProps {
  basePath: string;
  initialQuery?: string;
  searchPlaceholder?: string;
  /** When false, only filter dropdowns are shown (default true) */
  showSearch?: boolean;
  filters?: AdminFilterConfig[];
  /** Extra query keys to preserve (e.g. pendingPage on reviews) */
  preserveKeys?: string[];
  /** Page param keys cleared when search/filters change (e.g. pendingPage) */
  resetPageKeys?: string[];
  className?: string;
}

export function AdminListToolbar({
  basePath,
  initialQuery,
  searchPlaceholder = "Search…",
  showSearch = true,
  filters = [],
  preserveKeys = [],
  resetPageKeys = [],
  className,
}: AdminListToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery || "");

  useEffect(() => {
    setQ(initialQuery || "");
  }, [initialQuery]);

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.delete("page");
    for (const key of resetPageKeys) params.delete(key);
    for (const key of preserveKeys) {
      if (key.endsWith("Page") && updates[key] === null) {
        params.delete(key);
      }
    }

    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ q: q.trim() || null }));
  }

  function handleFilterChange(key: string, value: string) {
    router.push(buildUrl({ [key]: value || null }));
  }

  function handleClear() {
    setQ("");
    const clears: Record<string, string | null> = { q: null };
    for (const filter of filters) clears[filter.key] = null;
    router.push(buildUrl(clears));
  }

  const hasActiveFilters =
    (showSearch && Boolean(searchParams.get("q"))) ||
    filters.some((f) => Boolean(searchParams.get(f.key)));

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-3",
        className
      )}
    >
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:min-w-[240px]"
        >
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={searchPlaceholder}
            className="w-full sm:max-w-md lg:max-w-none lg:flex-1"
          />
          <Button type="submit" size="sm" className="w-full sm:w-auto">
            Search
          </Button>
        </form>
      )}

      {filters.map((filter) => {
        const selectId = `admin-filter-${filter.key}`;
        return (
          <div key={filter.key} className="flex w-full min-w-0 flex-col gap-2 sm:min-w-[11rem] sm:w-auto lg:min-w-[11rem]">
            <label
              htmlFor={selectId}
              className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]"
            >
              {filter.label}
            </label>
            <Select
              id={selectId}
              value={searchParams.get(filter.key) || ""}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        );
      })}

      {hasActiveFilters && (
        <Button type="button" variant="outline" size="sm" onClick={handleClear} className="lg:mb-0.5">
          Clear
        </Button>
      )}
    </div>
  );
}
