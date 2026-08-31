import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Intrinsic size of public/brand/bollybee-mark.png */
const MARK_WIDTH = 449;
const MARK_HEIGHT = 541;

interface BrandLogoProps {
  className?: string;
  variant?: "full" | "mark";
}

export function BrandLogo({ className, variant = "full" }: BrandLogoProps) {
  const displayHeight = variant === "full" ? 56 : 44;
  const displayWidth = Math.round(displayHeight * (MARK_WIDTH / MARK_HEIGHT));

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center gap-2.5", className)}
      aria-label="Bollybee home"
    >
      <Image
        src="/brand/bollybee-mark.png"
        alt=""
        width={displayWidth}
        height={displayHeight}
        className="block shrink-0"
        unoptimized
        priority
      />
      {variant === "full" && (
        <span className="hidden font-display text-xl tracking-[0.04em] text-[var(--plum)] sm:inline md:text-2xl">
          Bollybee
        </span>
      )}
    </Link>
  );
}
