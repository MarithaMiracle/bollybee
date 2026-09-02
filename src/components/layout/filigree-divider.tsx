import { cn } from "@/lib/utils";
import {
  FILIGREE_VIEWBOX,
  RIBBON_PATH,
  WAVE_EDGE_HEIGHT,
  WAVE_EDGE_OVERLAP,
  type FiligreeTone,
} from "@/components/layout/filigree-shared";

function strokeColor(tone: FiligreeTone): string {
  return tone === "dark" ? "var(--satin-light)" : "var(--plum)";
}

type FiligreeWaveProps = {
  tone?: FiligreeTone;
  className?: string;
};

/** In-section filigree — stroke only */
function FiligreeStroke({ tone = "light", className }: FiligreeWaveProps) {
  const { w, h } = FILIGREE_VIEWBOX;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("block w-full", className)}
      aria-hidden
    >
      <path
        d={RIBBON_PATH}
        fill="none"
        stroke={strokeColor(tone)}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type FiligreeRuleProps = {
  tone?: FiligreeTone;
  className?: string;
};

export function FiligreeRule({ tone = "light", className }: FiligreeRuleProps) {
  return (
    <FiligreeStroke tone={tone} className={cn("h-4 w-full md:h-5", className)} />
  );
}

/** Plum filigree on the seam between two homepage sections */
export function SectionDivider({ tone = "light", className }: FiligreeRuleProps) {
  return (
    <FiligreeRule
      tone={tone}
      className={cn("relative z-10 -mt-2 -mb-2 md:-mt-2.5 md:-mb-2.5", className)}
    />
  );
}

type WaveEdgeProps = {
  fill: string;
  tone?: FiligreeTone;
  flip?: boolean;
  className?: string;
};

/**
 * One SVG = fill + filigree on the same wave.
 * Overlaps the adjacent block so the rectangular edge underneath is hidden.
 */
function WaveEdge({ fill, tone = "light", flip = false, className }: WaveEdgeProps) {
  const { w, h } = FILIGREE_VIEWBOX;
  const region = `${RIBBON_PATH} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMin slice"
      className={cn(
        "relative z-10 block w-full",
        WAVE_EDGE_HEIGHT,
        WAVE_EDGE_OVERLAP,
        flip && "origin-bottom scale-y-[-1]",
        className
      )}
      aria-hidden
    >
      <path d={region} fill={fill} />
      <path
        d={RIBBON_PATH}
        fill="none"
        stroke={strokeColor(tone)}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Navbar — same edge as footer, flipped so cream sits above the wave */
export function SwirlDivider({ className }: { className?: string }) {
  return (
    <WaveEdge
      fill="var(--background)"
      flip
      tone="light"
      className={className}
    />
  );
}

/** Footer — surface fill below wave, overlaps page content bottom */
export function FooterEdge({ className }: { className?: string }) {
  return (
    <WaveEdge
      fill="var(--surface)"
      tone="light"
      className={className}
    />
  );
}
