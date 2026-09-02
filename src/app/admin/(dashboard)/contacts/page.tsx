import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { adminListParams, escapeIlike } from "@/lib/admin/list-query";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminEmpty } from "@/components/admin/admin-card";
import {
  AdminListToolbarSection,
  AdminToolbarCard,
} from "@/components/admin/admin-list-toolbar-section";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["status"] as const;

interface AdminContactsPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

export default async function AdminContactsPage({ searchParams }: AdminContactsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();
  let query = supabase.from("contact_submissions").select("*", { count: "exact" });

  if (params.q?.trim()) {
    const term = escapeIlike(params.q.trim());
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%,message.ilike.%${term}%`
    );
  }
  if (params.status) query = query.eq("status", params.status);

  const { data: contacts, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Contact messages"
        description={`${total} message${total !== 1 ? "s" : ""} from the contact form`}
      />

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/contacts"
            initialQuery={params.q}
            searchPlaceholder="Search name, email, subject…"
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "NEW", label: "New" },
                  { value: "IN_PROGRESS", label: "In progress" },
                  { value: "RESOLVED", label: "Resolved" },
                ],
              },
            ]}
          />
        }
      >
        {!contacts?.length ? (
          <AdminEmpty
            message={
              params.q || params.status ? "No messages match your filters." : "No contact messages yet."
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {contacts.map((c) => (
              <li key={c.id} className="px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {c.email} · {c.subject}
                    </p>
                  </div>
                  <AdminBadge label={c.status} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{c.message}</p>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {new Date(c.created_at).toLocaleString("en-NG")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AdminToolbarCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/contacts", p, listParams)}
      />
    </div>
  );
}
