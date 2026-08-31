import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductPlaceholderProps {
  name: string;
  volumeMl?: number;
  className?: string;
}

export function ProductPlaceholder({ name, volumeMl, className }: ProductPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden bg-[var(--surface)]",
        className
      )}
      aria-label={`${name} — image coming soon`}
    >
      <div className="absolute inset-0 opacity-[0.06]">
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
          <path
            d="M100 20 C120 40 140 60 130 90 C120 120 80 120 70 90 C60 60 80 40 100 20 Z"
            fill="currentColor"
            className="text-[var(--plum)]"
          />
        </svg>
      </div>
      <span className="font-display text-6xl font-light text-[var(--mauve)]/30">B</span>
      <Package className="mt-4 h-5 w-5 text-[var(--muted)]" strokeWidth={1} />
      <p className="mt-3 px-4 text-center font-display text-sm tracking-wide text-[var(--muted-foreground)]">
        {name}
      </p>
      {volumeMl && (
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          {volumeMl}ml
        </p>
      )}
    </div>
  );
}
