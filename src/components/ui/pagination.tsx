import Link from "next/link";
import { cn } from "@/lib/utils";
import { totalPages } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function Pagination({ page, total, limit, buildHref, className }: PaginationProps) {
  const pages = totalPages(total, limit);
  if (total <= limit) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < pages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-10 flex flex-wrap items-center justify-center gap-4 text-sm", className)}
    >
      {prevPage ? (
        <Link
          href={buildHref(prevPage)}
          className="uppercase tracking-wider text-[var(--plum)] transition-opacity hover:opacity-70"
        >
          Previous
        </Link>
      ) : (
        <span className="uppercase tracking-wider text-[var(--muted)]/40">Previous</span>
      )}

      <span className="text-[var(--muted-foreground)]">
        Page {page} of {pages}
      </span>

      {nextPage ? (
        <Link
          href={buildHref(nextPage)}
          className="uppercase tracking-wider text-[var(--plum)] transition-opacity hover:opacity-70"
        >
          Next
        </Link>
      ) : (
        <span className="uppercase tracking-wider text-[var(--muted)]/40">Next</span>
      )}
    </nav>
  );
}
