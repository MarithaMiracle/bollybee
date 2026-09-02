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

interface AdminNewsletterPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

export default async function AdminNewsletterPage({ searchParams }: AdminNewsletterPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();
  let query = supabase.from("newsletter_subscribers").select("*", { count: "exact" });

  if (params.q?.trim()) {
    const term = escapeIlike(params.q.trim());
    query = query.ilike("email", `%${term}%`);
  }
  if (params.status) query = query.eq("status", params.status);

  const { data: subs, count } = await query
    .order("subscribed_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Newsletter"
        description={`${total} subscriber${total !== 1 ? "s" : ""}`}
      />

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/newsletter"
            initialQuery={params.q}
            searchPlaceholder="Search email…"
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "SUBSCRIBED", label: "Subscribed" },
                  { value: "UNSUBSCRIBED", label: "Unsubscribed" },
                ],
              },
            ]}
          />
        }
      >
        {!subs?.length ? (
          <AdminEmpty
            message={
              params.q || params.status ? "No subscribers match your filters." : "No newsletter subscribers yet."
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {subs.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
              >
                <span className="font-medium">{s.email}</span>
                <AdminBadge label={s.status} />
              </li>
            ))}
          </ul>
        )}
      </AdminToolbarCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/newsletter", p, listParams)}
      />
    </div>
  );
}
