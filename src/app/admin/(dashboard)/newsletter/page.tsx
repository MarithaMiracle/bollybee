import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";

export const dynamic = "force-dynamic";

interface AdminNewsletterPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminNewsletterPage({ searchParams }: AdminNewsletterPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

  const supabase = createServiceClient();
  const { data: subs, count } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Newsletter"
        description={`${total} subscriber${total !== 1 ? "s" : ""}`}
      />

      <AdminCard>
        {!subs?.length ? (
          <AdminEmpty message="No newsletter subscribers yet." />
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
      </AdminCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/newsletter", p)}
      />
    </div>
  );
}
