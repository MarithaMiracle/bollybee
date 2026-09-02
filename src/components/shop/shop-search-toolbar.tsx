"use client";

import { SearchForm } from "@/components/shop/search-form";
import { ShopSortSelect } from "@/components/shop/shop-filters";
import { cn } from "@/lib/utils";

interface ShopSearchToolbarProps {
  initialQuery?: string;
  actionPath?: string;
  className?: string;
}

export function ShopSearchToolbar({
  initialQuery,
  actionPath = "/shop",
  className,
}: ShopSearchToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4",
        className
      )}
    >
      <SearchForm
        initialQuery={initialQuery}
        actionPath={actionPath}
        preserveParams
        className="flex-1 lg:flex-row"
      />
      <ShopSortSelect
        basePath={actionPath}
        id="sort-shop"
        className="hidden lg:flex lg:shrink-0"
      />
    </div>
  );
}
