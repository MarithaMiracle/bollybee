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
      className={cn("inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80", className)}
      aria-label="Bollybee Fragrance Lab home"
    >
      <Image
        src="/brand/bollybee-mark.png"
        alt=""
        width={displayWidth}
        height={displayHeight}
        className="block shrink-0"
        priority
      />
      {variant === "full" && (
        <span className="hidden flex-col leading-none sm:flex">
          <span className="font-brand text-[1.35rem] font-normal tracking-[0.04em] text-[var(--plum)] md:text-[1.65rem]">
            Bollybee
          </span>
          <span className="mt-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.32em] text-[var(--plum)]/75 md:text-[10px]">
            Fragrance Lab
          </span>
        </span>
      )}
    </Link>
  );
}
