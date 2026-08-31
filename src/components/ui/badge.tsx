import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "new" | "bestseller" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
        variant === "default" && "bg-[var(--surface)] text-[var(--foreground)]",
        variant === "new" && "bg-[var(--blush)] text-[var(--plum)]",
        variant === "bestseller" && "bg-[var(--plum)] text-white",
        variant === "outline" && "border border-[var(--border)] text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}
