import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "full" | "mark";
}

export function BrandLogo({ className, variant = "full" }: BrandLogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="Bollybee home">
      <Image
        src="/brand/bollybee-logo.jpeg"
        alt="Bollybee Fragrance Lab"
        width={variant === "full" ? 160 : 48}
        height={variant === "full" ? 48 : 48}
        className={cn(
          "h-auto w-auto object-contain",
          variant === "full" ? "max-h-12 md:max-h-14" : "max-h-10"
        )}
        priority
      />
    </Link>
  );
}
