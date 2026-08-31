"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { formatNaira, fragranceFamilyLabel } from "@/lib/utils";
import type { Product, ProductVariation } from "@/types";

interface ProductCardProps {
  product: Product & {
    variations?: ProductVariation[];
    images?: { image_url: string; alt_text: string | null }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const variations = product.variations ?? [];
  const minPrice = variations.length
    ? Math.min(...variations.map((v) => v.price))
    : 0;
  const maxCompare = variations
    .map((v) => v.compare_at_price)
    .filter(Boolean) as number[];
  const compareAt = maxCompare.length ? Math.max(...maxCompare) : null;
  const image = product.images?.[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
    >
      <article className="overflow-hidden border border-[var(--border)] bg-white transition-shadow hover:shadow-md">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
          {image ? (
            <Image
              src={image.image_url}
              alt={image.alt_text || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          ) : (
            <ProductPlaceholder name={product.name} />
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {product.is_new && <Badge variant="new">New</Badge>}
            {product.is_bestseller && <Badge variant="bestseller">Bestseller</Badge>}
          </div>
        </div>
        <div className="space-y-1 p-4">
          {product.fragrance_family && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {fragranceFamilyLabel(product.fragrance_family)}
            </p>
          )}
          <h3 className="font-display text-lg tracking-wide">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{formatNaira(minPrice)}</span>
            {compareAt && compareAt > minPrice && (
              <span className="text-xs text-[var(--muted)] line-through">
                {formatNaira(compareAt)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
