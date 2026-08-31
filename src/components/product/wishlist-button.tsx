"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/actions/wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialInWishlist?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className,
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.error) {
        if (result.requiresAuth) {
          toast.error("Sign in to save to your wishlist");
          router.push("/account/login");
          return;
        }
        toast.error(result.error);
        return;
      }
      setInWishlist(result.added ?? false);
      toast.success(result.added ? "Added to wishlist" : "Removed from wishlist");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "rounded-full border border-[var(--border)] bg-white/90 p-2 shadow-sm transition-colors hover:border-[var(--plum)]",
        inWishlist && "border-[var(--plum)] text-[var(--plum)]",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
    </button>
  );
}
