import { Suspense, type ReactNode } from "react";
import {
  AdminListToolbar,
  type AdminFilterConfig,
} from "@/components/admin/admin-list-toolbar";

interface AdminListToolbarSectionProps {
  basePath: string;
  initialQuery?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: AdminFilterConfig[];
  preserveKeys?: string[];
  resetPageKeys?: string[];
}

export function AdminListToolbarSection(props: AdminListToolbarSectionProps) {
  return (
    <Suspense
      fallback={
        <div className="h-11 animate-pulse rounded-[var(--radius)] bg-[var(--surface)]" />
      }
    >
      <AdminListToolbar {...props} />
    </Suspense>
  );
}

export function AdminToolbarCard({
  toolbar,
  children,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm">
      {toolbar ? (
        <div className="border-b border-[var(--border)] bg-[var(--surface)]/40 px-5 py-4">
          {toolbar}
        </div>
      ) : null}
      {children}
    </div>
  );
}
