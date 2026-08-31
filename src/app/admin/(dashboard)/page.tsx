import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { Banknote, Package, ShoppingCart, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const [
    { count: orderCount },
    { count: productCount },
    { data: orders },
    { data: payments },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, total, payment_status, fulfillment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("payments").select("status, amount"),
  ]);

  const revenue =
    payments?.filter((p) => p.status === "SUCCESSFUL").reduce((s, p) => s + p.amount, 0) ?? 0;

  const pendingOrders = orders?.filter((o) => o.payment_status === "PENDING").length ?? 0;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your store performance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total revenue" value={formatNaira(revenue)} icon={Banknote} />
        <AdminStatCard label="Orders" value={String(orderCount ?? 0)} icon={ShoppingCart} />
        <AdminStatCard label="Products" value={String(productCount ?? 0)} icon={Package} />
        <AdminStatCard label="Pending payments" value={String(pendingOrders)} icon={Clock} />
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl text-[var(--foreground)]">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-wider text-[var(--plum)] hover:underline">
            View all
          </Link>
        </div>
        <AdminCard>
          {!orders?.length ? (
            <AdminEmpty message="No orders yet." />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm transition-colors hover:bg-[var(--surface)]"
                  >
                    <div>
                      <p className="font-medium">{o.order_number}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(o.created_at).toLocaleDateString("en-NG")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <AdminBadge label={o.payment_status} />
                      <span className="font-medium">{formatNaira(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center bg-[var(--plum)] px-5 text-sm text-[var(--background)] hover:opacity-90"
        >
          Add product
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex h-10 items-center border border-[var(--border)] bg-white px-5 text-sm hover:bg-[var(--surface)]"
        >
          Manage orders
        </Link>
        <Link
          href="/admin/contacts"
          className="inline-flex h-10 items-center border border-[var(--border)] bg-white px-5 text-sm hover:bg-[var(--surface)]"
        >
          Contact messages
        </Link>
      </div>
    </div>
  );
}
