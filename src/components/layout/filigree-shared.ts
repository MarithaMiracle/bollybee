export type FiligreeTone = "light" | "dark";

export const FILIGREE_VIEWBOX = { w: 1440, h: 56 } as const;

/** Strong wave — endpoints at different heights, deep troughs */
export const RIBBON_PATH =
  "M0,38 C180,38 280,12 480,34 S720,50 960,34 S1200,12 1440,36";

/** Tailwind classes shared by navbar/footer wave overlap */
export const WAVE_EDGE_HEIGHT = "h-14 md:h-16";
export const WAVE_EDGE_OVERLAP = "-mt-14 md:-mt-16";
