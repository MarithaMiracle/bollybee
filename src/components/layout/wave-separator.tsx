import { cn } from "@/lib/utils";
import {
  brandFillMap,
  type BrandFill,
  type SplashVariant,
} from "@/components/layout/splash-shared";
import { FiligreeRule } from "@/components/layout/filigree-divider";
import { SectionSplash } from "@/components/layout/splash-divider";

export type { BrandFill };

type SectionEdgeProps = {
  above: BrandFill;
  below: BrandFill;
  variant?: SplashVariant;
  /** @deprecated */
  filigree?: boolean;
  className?: string;
};

/** Main section transition — water splash between colours */
export function SectionEdge({
  above,
  below,
  variant = "wave",
  className,
}: SectionEdgeProps) {
  return (
    <div
      className={cn(
        "relative z-[2] -mt-1 block w-full overflow-hidden leading-none",
        className
      )}
      aria-hidden
    >
      <SectionSplash
        aboveFill={brandFillMap[above]}
        belowFill={brandFillMap[below]}
        variant={variant}
      />
    </div>
  );
}

/** @deprecated Use SectionEdge with above/below */
export function WaveSeparator({
  fill,
  variant = "wave",
  accent: _accent,
  flip = false,
  className,
}: {
  fill: BrandFill;
  variant?: SplashVariant;
  accent?: "blush" | "plum" | "none";
  flip?: boolean;
  className?: string;
}) {
  return (
    <SectionEdge
      above="background"
      below={fill}
      variant={variant}
      className={cn(flip && "scale-y-[-1]", className)}
    />
  );
}

type SoftDividerProps = {
  tone?: "blush" | "plum" | "border";
  className?: string;
};

/** In-section filigree — cards, footer, contact */
export function SoftDivider({ tone: _tone = "border", className }: SoftDividerProps) {
  return <FiligreeRule tone="light" className={className} />;
}
