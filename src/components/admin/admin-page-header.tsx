import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <h1 className="font-display text-2xl text-[var(--foreground)] sm:text-3xl md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      {action && (
        <Button asChild variant="accent" className="shrink-0">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
