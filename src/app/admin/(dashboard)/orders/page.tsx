import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira, FULFILLMENT_STEPS } from "@/lib/utils";
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

const FILTER_KEYS = ["payment", "fulfillment"] as const;

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    payment?: string;
    fulfillment?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select("id, order_number, email, total, payment_status, fulfillment_status, created_at", {
      count: "exact",
    });

  if (params.q?.trim()) {
    const term = escapeIlike(params.q.trim());
    query = query.or(`order_number.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (params.payment) query = query.eq("payment_status", params.payment);
  if (params.fulfillment) query = query.eq("fulfillment_status", params.fulfillment);

  const { data: orders, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Orders" description={`${total} order${total !== 1 ? "s" : ""} total`} />

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/orders"
            initialQuery={params.q}
            searchPlaceholder="Search order # or email…"
            filters={[
              {
                key: "payment",
                label: "Payment",
                options: [
                  { value: "PENDING", label: "Pending" },
                  { value: "SUCCESSFUL", label: "Successful" },
                  { value: "FAILED", label: "Failed" },
                  { value: "REFUNDED", label: "Refunded" },
                ],
              },
              {
                key: "fulfillment",
                label: "Fulfillment",
                options: [
                  ...FULFILLMENT_STEPS.map((s) => ({ value: s.key, label: s.label })),
                  { value: "CANCELLED", label: "Cancelled" },
                ],
              },
            ]}
          />
        }
      >
        <div className="max-md:overflow-visible overflow-x-auto">
          <table className="admin-table w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-5 py-3.5 font-medium">Order</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Payment</th>
                <th className="px-5 py-3.5 font-medium">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-[var(--surface)]/50">
                  <td data-label="Order" className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-[var(--plum)] underline-offset-4 hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td data-label="Customer" className="break-all px-5 py-4 text-[var(--muted-foreground)]">{o.email}</td>
                  <td data-label="Total" className="px-5 py-4 font-medium">{formatNaira(o.total)}</td>
                  <td data-label="Payment" className="px-5 py-4">
                    <AdminBadge label={o.payment_status} />
                  </td>
                  <td data-label="Fulfillment" className="px-5 py-4">
                    <AdminBadge label={o.fulfillment_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders?.length && (
          <AdminEmpty message={params.q || params.payment || params.fulfillment ? "No orders match your filters." : "No orders yet."} />
        )}
      </AdminToolbarCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/orders", p, listParams)}
      />
    </div>
  );
}
