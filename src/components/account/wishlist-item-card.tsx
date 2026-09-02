"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";
import { removeWishlistItem } from "@/actions/wishlist";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { useConfirm } from "@/components/ui/confirm-provider";
import { formatNaira } from "@/lib/utils";

interface WishlistItemCardProps {
  itemId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  imageAlt?: string | null;
  minPrice: number;
}

export function WishlistItemCard({
  itemId,
  name,
  slug,
  imageUrl,
  imageAlt,
  minPrice,
}: WishlistItemCardProps) {
  const confirm = useConfirm();
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removed) return null;

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const ok = await confirm({
      title: "Remove from wishlist?",
      description: `${name} will be removed from your saved items.`,
      confirmLabel: "Remove",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await removeWishlistItem(itemId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Removed from wishlist");
      setRemoved(true);
    });
  }

  return (
    <Link
      href={`/product/${slug}`}
      className="brand-panel group relative overflow-hidden bg-white transition-shadow hover:shadow-md"
    >
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        aria-label={`Remove ${name} from wishlist`}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-white/95 text-[var(--muted-foreground)] shadow-sm transition-colors hover:border-[var(--plum)] hover:text-[var(--plum)] disabled:opacity-50"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <div className="relative aspect-[3/4] bg-[var(--surface)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 33vw"
          />
        ) : (
          <ProductPlaceholder name={name} />
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h2 className="line-clamp-2 font-display text-base transition-colors group-hover:text-[var(--plum)] sm:text-lg">
          {name}
        </h2>
        <p className="mt-1 text-sm font-medium">{formatNaira(minPrice)}</p>
      </div>
    </Link>
  );
}
