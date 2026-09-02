import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type WaterSplashIconProps = {
  variant: "rise" | "drip";
  fill: string;
  className?: string;
  style?: CSSProperties;
};

/** Detailed water splash silhouette — rise = from below, drip = from above */
export function WaterSplashIcon({ variant, fill, className, style }: WaterSplashIconProps) {
  const src =
    variant === "rise"
      ? "/graphics/water-splash-rise.svg"
      : "/graphics/water-splash-drip.svg";

  return (
    <span
      role="presentation"
      className={cn("pointer-events-none block bg-current", className)}
      style={{
        color: fill,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...style,
      }}
    />
  );
}
