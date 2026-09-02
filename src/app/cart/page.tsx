"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/layout/back-link";
import { useConfirm } from "@/components/ui/confirm-provider";
import { useCart } from "@/components/cart/cart-provider";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const confirm = useConfirm();
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const subtotal = items.reduce(
    (sum, i) => sum + (i.price ?? 0) * i.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-[var(--satin-light)]">
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-20 text-center md:px-8">
          <BackLink href="/shop" label="Back to shop" className="mb-8" />
          <h1 className="font-display text-3xl sm:text-4xl">Your Cart</h1>
          <p className="mt-4 text-[var(--muted-foreground)]">Your cart is empty.</p>
          <Button asChild className="mt-8">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[var(--satin-light)]">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-8 md:py-16">
      <BackLink href="/shop" label="Back to shop" className="mb-6" />
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl sm:text-4xl">Your Cart</h1>
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({
              title: "Clear your cart?",
              description: "All items will be removed from your cart.",
              confirmLabel: "Clear cart",
              variant: "destructive",
            });
            if (ok) clearCart();
          }}
          className="cursor-pointer text-xs uppercase tracking-wider text-[var(--muted)] transition-colors hover:text-[var(--destructive)]"
        >
          Clear cart
        </button>
      </div>

      <div className="grid min-w-0 gap-10 lg:grid-cols-[1fr_min(100%,360px)]">
        <ul className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <li key={item.variationId} className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-4">
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface)]">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName || ""} fill className="object-cover" />
                  ) : (
                    <ProductPlaceholder name={item.productName || "Product"} className="aspect-auto h-full" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="min-w-0">
                    <Link href={`/product/${item.slug}`} className="font-display text-lg hover:text-[var(--plum)] line-clamp-2">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-[var(--muted)]">{item.variationName}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:mt-0">
                    <div className="flex items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
                      <button type="button" className="cursor-pointer px-2 py-1 transition-colors hover:bg-[var(--surface)]" onClick={() => updateQuantity(item.variationId, item.quantity - 1)} aria-label="Decrease">−</button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button type="button" className="cursor-pointer px-2 py-1 transition-colors hover:bg-[var(--surface)]" onClick={() => updateQuantity(item.variationId, item.quantity + 1)} aria-label="Increase">+</button>
                    </div>
                    <p className="font-medium">{formatNaira((item.price ?? 0) * item.quantity)}</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Remove this item?",
                    description: `${item.productName} will be removed from your cart.`,
                    confirmLabel: "Remove",
                    variant: "destructive",
                  });
                  if (ok) removeItem(item.variationId);
                }}
                className="cursor-pointer self-start text-xs text-[var(--muted)] transition-colors hover:text-[var(--destructive)] sm:self-center"
                aria-label="Remove item"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <aside className="brand-panel h-fit bg-white p-6">
          <h2 className="font-display text-xl">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Shipping</dt>
              <dd className="text-[var(--muted)]">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-medium">
              <dt>Estimated Total</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
          </dl>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </aside>
      </div>
      </div>
    </div>
  );
}
