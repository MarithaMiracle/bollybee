import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}

export function AdminStatCard({ label, value, icon: Icon, className }: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          {label}
        </p>
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-[var(--plum)]/70" strokeWidth={1.5} />
        )}
      </div>
      <p className="mt-3 font-display text-2xl text-[var(--foreground)] md:text-3xl">{value}</p>
    </div>
  );
}
