import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
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

interface AdminPaymentsPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();
  let query = supabase
    .from("payments")
    .select("reference, amount, status, provider_transaction_id, created_at, orders(order_number)", {
      count: "exact",
    });

  if (params.q?.trim()) {
    const term = escapeIlike(params.q.trim());
    query = query.ilike("reference", `%${term}%`);
  }
  if (params.status) query = query.eq("status", params.status);

  const { data: payments, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Payments" description={`${total} payment record${total !== 1 ? "s" : ""}`} />

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/payments"
            initialQuery={params.q}
            searchPlaceholder="Search payment reference…"
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "PENDING", label: "Pending" },
                  { value: "SUCCESSFUL", label: "Successful" },
                  { value: "FAILED", label: "Failed" },
                  { value: "CANCELLED", label: "Cancelled" },
                  { value: "REFUNDED", label: "Refunded" },
                ],
              },
            ]}
          />
        }
      >
        <div className="max-md:overflow-visible overflow-x-auto">
          <table className="admin-table w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-5 py-3.5 font-medium">Reference</th>
                <th className="px-5 py-3.5 font-medium">Order</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(payments ?? []).map((p) => (
                <tr key={p.reference} className="transition-colors hover:bg-[var(--surface)]/50">
                  <td data-label="Reference" className="break-all px-5 py-4 font-mono text-xs">{p.reference}</td>
                  <td data-label="Order" className="px-5 py-4">
                    {(p.orders as unknown as { order_number: string } | null)?.order_number ?? "—"}
                  </td>
                  <td data-label="Amount" className="px-5 py-4 font-medium">{formatNaira(p.amount)}</td>
                  <td data-label="Status" className="px-5 py-4">
                    <AdminBadge label={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!payments?.length && (
          <AdminEmpty message={params.q || params.status ? "No payments match your filters." : "No payments yet."} />
        )}
      </AdminToolbarCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/payments", p, listParams)}
      />
    </div>
  );
}
