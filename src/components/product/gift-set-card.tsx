"use client";

import Image from "next/image";
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
  imageUrl?: string | null;
  variant?: "gift-set" | "sample-pack";
}

export function GiftSetCard({
  id,
  name,
  slug,
  description,
  price,
  imageUrl,
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
    <article className="overflow-hidden border border-[var(--border)] bg-white">
      {imageUrl && (
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface)]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="line-clamp-2 font-display text-xl sm:text-2xl">{name}</h2>
        <p className="mt-3 line-clamp-3 text-sm text-[var(--muted-foreground)]">{description}</p>
        <p className="mt-4 text-lg font-medium">{formatNaira(price)}</p>
        <Button className="mt-4 w-full sm:w-auto" onClick={handleAdd}>
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
