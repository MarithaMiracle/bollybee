import { cn } from "@/lib/utils";

const VARIANTS = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  neutral: "bg-[var(--surface)] text-[var(--muted-foreground)] ring-[var(--border)]",
  draft: "bg-[var(--surface)] text-[var(--muted)] ring-[var(--border)]",
  error: "bg-red-50 text-red-800 ring-red-200",
} as const;

type BadgeVariant = keyof typeof VARIANTS;

function statusVariant(status: string): BadgeVariant {
  const s = status.toUpperCase();
  if (["SUCCESSFUL", "ACTIVE", "RESOLVED", "SUBSCRIBED", "DELIVERED", "SHIPPED"].some((x) => s.includes(x))) {
    return "success";
  }
  if (["PENDING", "NEW", "IN_PROGRESS", "PROCESSING"].some((x) => s.includes(x))) {
    return "pending";
  }
  if (["FAILED", "CANCELLED", "UNSUBSCRIBED"].some((x) => s.includes(x))) {
    return "error";
  }
  if (["DRAFT", "INACTIVE"].some((x) => s.includes(x)) || s === "FALSE") {
    return "draft";
  }
  return "neutral";
}

export function AdminBadge({
  label,
  variant,
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const v = variant ?? statusVariant(label);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
        VARIANTS[v]
      )}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}
