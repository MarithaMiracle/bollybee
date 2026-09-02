"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { ScentNotesDisplay } from "@/components/product/scent-notes";
import { ProductCard } from "@/components/product/product-card";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ProductReviews, type ProductReview } from "@/components/product/product-reviews";
import { BackLink } from "@/components/layout/back-link";
import { useCart } from "@/components/cart/cart-provider";
import { formatNaira, fragranceFamilyLabel } from "@/lib/utils";
import type { Product, ProductVariation } from "@/types";

interface ProductDetailProps {
  product: Product;
  related: Product[];
  reviews: ProductReview[];
  totalReviews: number;
  reviewPage: number;
  reviewAverage: number | null;
  isLoggedIn: boolean;
  inWishlist: boolean;
}

export function ProductDetail({
  product,
  related,
  reviews,
  totalReviews,
  reviewPage,
  reviewAverage,
  isLoggedIn,
  inWishlist,
}: ProductDetailProps) {
  const variations = (product.variations ?? []).filter((v) => v.active);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(
    variations[0]
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const images = (product.images ?? []).filter(
    (img) => !img.variation_id || img.variation_id === selectedVariation?.id
  );
  const displayImage = images[0];

  function handleAddToCart() {
    if (!selectedVariation || selectedVariation.stock_quantity < 1) {
      toast.error("This variation is out of stock");
      return;
    }
    addItem({
      productId: product.id,
      variationId: selectedVariation.id,
      quantity,
      productName: product.name,
      variationName: selectedVariation.name,
      price: selectedVariation.price,
      slug: product.slug,
      imageUrl: displayImage?.image_url,
    });
    toast.success("Added to cart");
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  if (!selectedVariation) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p>This product has no available variations.</p>
        <Button asChild className="mt-4"><Link href="/shop">Back to shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 md:px-8 md:py-16">
      <BackLink
        href={product.category?.slug ? `/shop/${product.category.slug}` : "/shop"}
        label={product.category?.name ? `Back to ${product.category.name}` : "Back to shop"}
        className="mb-6"
      />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface)]">
          {displayImage ? (
            <Image
              src={displayImage.image_url}
              alt={displayImage.alt_text || product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              quality={90}
            />
          ) : (
            <ProductPlaceholder name={product.name} volumeMl={selectedVariation.volume_ml} />
          )}
          <div className="absolute right-3 top-3">
            <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            {product.is_new && <Badge variant="new">New</Badge>}
            {product.is_bestseller && <Badge variant="bestseller">Bestseller</Badge>}
          </div>

          {product.fragrance_family && (
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
              {fragranceFamilyLabel(product.fragrance_family)}
            </p>
          )}

          <h1 className="break-words font-display text-3xl tracking-wide sm:text-4xl md:text-5xl">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-xl font-medium">{formatNaira(selectedVariation.price)}</span>
            {selectedVariation.compare_at_price &&
              selectedVariation.compare_at_price > selectedVariation.price && (
                <span className="text-sm text-[var(--muted)] line-through">
                  {formatNaira(selectedVariation.compare_at_price)}
                </span>
              )}
          </div>

          <p className="text-sm text-[var(--muted-foreground)]">
            {selectedVariation.stock_quantity > 0
              ? `${selectedVariation.stock_quantity} in stock`
              : "Out of stock"}
          </p>

          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Volume</p>
            <div className="flex flex-wrap gap-2">
              {variations.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={v.stock_quantity < 1}
                  onClick={() => setSelectedVariation(v)}
                  className={`cursor-pointer rounded-[var(--radius-sm)] border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    selectedVariation.id === v.id
                      ? "border-[var(--plum)] bg-[var(--plum)] text-white"
                      : "border-[var(--border)] hover:border-[var(--mauve)]"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label htmlFor="qty" className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Qty
            </label>
            <div className="flex items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
              <button
                type="button"
                className="cursor-pointer px-3 py-2 transition-colors hover:bg-[var(--surface)]"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span id="qty" className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                className="cursor-pointer px-3 py-2 transition-colors hover:bg-[var(--surface)]"
                onClick={() => setQuantity(Math.min(selectedVariation.stock_quantity, quantity + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={selectedVariation.stock_quantity < 1}
            >
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={selectedVariation.stock_quantity < 1}
            >
              Buy Now
            </Button>
          </div>

          {product.description && (
            <div className="border-t border-[var(--border)] pt-6">
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                {product.description}
              </p>
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">
            Nationwide delivery · Secure Paystack payment
          </p>
        </div>
      </div>

      {product.scent_notes && product.scent_notes.length > 0 && (
        <section className="mt-12 md:mt-20">
          <h2 className="mb-6 font-display text-2xl md:mb-8 md:text-3xl">Scent Profile</h2>
          <ScentNotesDisplay notes={product.scent_notes} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12 md:mt-20">
          <h2 className="mb-6 font-display text-2xl md:mb-8 md:text-3xl">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        reviews={reviews}
        totalReviews={totalReviews}
        reviewPage={reviewPage}
        reviewAverage={reviewAverage}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
