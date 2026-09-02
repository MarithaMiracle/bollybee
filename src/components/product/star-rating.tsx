import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

const sizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
} as const;

/** Read-only star row — empty stars use fill-none so they don't look fully rated. */
export function StarRating({ rating, max = 5, size = "sm", className }: StarRatingProps) {
  const value = Math.max(0, Math.min(max, Math.round(rating)));

  return (
    <div className={cn("flex", className)} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <Star
            key={n}
            className={cn(
              sizeClass[size],
              filled
                ? "fill-[var(--plum)] text-[var(--plum)]"
                : "fill-none text-[var(--border)]"
            )}
          />
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Interactive star picker — starts empty until the user selects a rating. */
export function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = "md",
  className,
}: StarRatingInputProps) {
  return (
    <div className={cn("flex gap-1", className)} role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = value >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            aria-pressed={filled}
            className="cursor-pointer rounded-[var(--radius-sm)] transition-opacity hover:opacity-80"
          >
            <Star
              className={cn(
                sizeClass[size],
                filled
                  ? "fill-[var(--plum)] text-[var(--plum)]"
                  : "fill-none text-[var(--border)]"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
