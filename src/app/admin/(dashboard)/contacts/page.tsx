import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";

export const dynamic = "force-dynamic";

interface AdminContactsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminContactsPage({ searchParams }: AdminContactsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

  const supabase = createServiceClient();
  const { data: contacts, count } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Contact messages"
        description={`${total} message${total !== 1 ? "s" : ""} from the contact form`}
      />

      <AdminCard>
        {!contacts?.length ? (
          <AdminEmpty message="No contact messages yet." />
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
      </AdminCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/contacts", p)}
      />
    </div>
  );
}
