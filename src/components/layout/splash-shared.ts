export type BrandFill =
  | "background"
  | "surface"
  | "satin-light"
  | "plum"
  | "blush"
  | "black"
  | "white";

export type SplashVariant = "wave" | "arch";

export const brandFillMap: Record<BrandFill, string> = {
  background: "var(--background)",
  surface: "var(--surface)",
  "satin-light": "var(--satin-light)",
  plum: "var(--plum)",
  blush: "var(--blush)",
  black: "#1a1816",
  white: "#ffffff",
};

export const SPLASH_VIEWBOX = { w: 1440, h: 80 } as const;

/** Smooth boundary — endpoints dip so edges are not a flat horizontal seam */
export function splashCrestPath(variant: SplashVariant): string {
  if (variant === "arch") {
    return "M0,48 C240,44 380,26 720,44 S1080,58 1440,48";
  }
  return "M0,46 C180,42 300,32 480,42 S720,52 960,42 S1200,32 1440,46";
}

/** @deprecated */
export const ornateEdgePath = splashCrestPath;
