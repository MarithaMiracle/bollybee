import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackLink({ href, label = "Back", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-0.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--plum)]",
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}
