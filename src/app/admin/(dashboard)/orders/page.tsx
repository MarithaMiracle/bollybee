import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

  const supabase = createServiceClient();
  const { data: orders, count } = await supabase
    .from("orders")
    .select("id, order_number, email, total, payment_status, fulfillment_status, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Orders" description={`${total} order${total !== 1 ? "s" : ""} total`} />

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-[var(--plum)] underline-offset-4 hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)]">{o.email}</td>
                  <td className="px-5 py-4 font-medium">{formatNaira(o.total)}</td>
                  <td className="px-5 py-4">
                    <AdminBadge label={o.payment_status} />
                  </td>
                  <td className="px-5 py-4">
                    <AdminBadge label={o.fulfillment_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders?.length && <AdminEmpty message="No orders yet." />}
      </AdminCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/orders", p)}
      />
    </div>
  );
}
