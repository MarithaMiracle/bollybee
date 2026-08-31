"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { formatNaira } from "@/lib/utils";

interface GiftSetCardProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  variant?: "gift-set" | "sample-pack";
}

export function GiftSetCard({
  id,
  name,
  slug,
  description,
  price,
  variant = "gift-set",
}: GiftSetCardProps) {
  const { addItem } = useCart();
  const isSamplePack = variant === "sample-pack";
  const label = isSamplePack ? "Sample Pack" : "Gift Set";

  function handleAdd() {
    addItem({
      productId: id,
      variationId: `gift-set-${id}`,
      quantity: 1,
      productName: name,
      variationName: label,
      price,
      slug: isSamplePack ? `sample-packs#${slug}` : `gift-sets#${slug}`,
      isGiftSet: true,
    });
    toast.success(`${label} added to cart`);
  }

  return (
    <article className="border border-[var(--border)] bg-white p-6">
      <h2 className="font-display text-2xl">{name}</h2>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">{description}</p>
      <p className="mt-4 text-lg font-medium">{formatNaira(price)}</p>
      <Button className="mt-4" onClick={handleAdd}>Add to Cart</Button>
    </article>
  );
}
