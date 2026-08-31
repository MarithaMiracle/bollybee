import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function AdminPageHeader({ title, description, action, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-11 shrink-0 items-center justify-center bg-[var(--plum)] px-6 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
