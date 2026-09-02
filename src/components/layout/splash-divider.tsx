import { cn } from "@/lib/utils";
import { WaterSplashIcon } from "@/components/layout/water-splash-icon";
import {
  SPLASH_VIEWBOX,
  splashCrestPath,
  type SplashVariant,
} from "@/components/layout/splash-shared";

export type { BrandFill } from "@/components/layout/splash-shared";
export { brandFillMap, splashCrestPath, ornateEdgePath } from "@/components/layout/splash-shared";

type SectionSplashProps = {
  aboveFill: string;
  belowFill: string;
  variant?: SplashVariant;
  className?: string;
};

const SPLASH_LAYOUT: Record<
  SplashVariant,
  { rise: { left: string }; drip: { left: string } }
> = {
  wave: {
    rise: { left: "28%" },
    drip: { left: "68%" },
  },
  arch: {
    rise: { left: "32%" },
    drip: { left: "64%" },
  },
};

/** Main section boundary — wave + two realistic splash icons */
export function SectionSplash({
  aboveFill,
  belowFill,
  variant = "wave",
  className,
}: SectionSplashProps) {
  const { w, h } = SPLASH_VIEWBOX;
  const crest = splashCrestPath(variant);
  const aboveRegion = `${crest} L${w},0 L0,0 Z`;
  const belowRegion = `${crest} L${w},${h} L0,${h} Z`;
  const layout = SPLASH_LAYOUT[variant];

  return (
    <div className={cn("relative block w-full leading-none", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="block h-12 w-full md:h-16"
        aria-hidden
      >
        <path d={belowRegion} fill={belowFill} />
        <path d={aboveRegion} fill={aboveFill} />
      </svg>

      <WaterSplashIcon
        variant="rise"
        fill={belowFill}
        className="absolute bottom-0 h-[72%] w-[min(22vw,9rem)] -translate-x-1/2 translate-y-[18%] md:h-[88%] md:w-[min(18vw,11rem)]"
        style={{ left: layout.rise.left }}
      />
      <WaterSplashIcon
        variant="drip"
        fill={aboveFill}
        className="absolute bottom-0 h-[72%] w-[min(22vw,9rem)] -translate-x-1/2 translate-y-[22%] md:h-[88%] md:w-[min(18vw,11rem)]"
        style={{ left: layout.drip.left }}
      />
    </div>
  );
}

/** Navbar / footer edge — wave cut only, no stroke */
export function EdgeWave({ fill, className }: { fill: string; className?: string }) {
  const { w, h } = SPLASH_VIEWBOX;
  const crest = splashCrestPath("wave");
  const region = `${crest} L${w},0 L0,0 Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("block w-full leading-none", className)}
      aria-hidden
    >
      <path d={region} fill={fill} />
    </svg>
  );
}
