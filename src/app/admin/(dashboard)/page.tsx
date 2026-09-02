import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { Banknote, Package, ShoppingCart, Clock, AlertTriangle } from "lucide-react";
import { relationName } from "@/lib/supabase/relation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const [
    { count: orderCount },
    { count: productCount },
    { data: orders },
    { data: payments },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, total, payment_status, fulfillment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("payments").select("status, amount"),
    supabase
      .from("product_variations")
      .select("name, stock_quantity, products(name)")
      .lte("stock_quantity", 5)
      .eq("active", true)
      .order("stock_quantity", { ascending: true })
      .limit(10),
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

      {(lowStock?.length ?? 0) > 0 && (
        <div>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl text-[var(--foreground)]">Low stock</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-wider text-[var(--plum)] hover:underline">
              Manage inventory
            </Link>
          </div>
          <AdminCard>
            <ul className="divide-y divide-[var(--border)]">
              {lowStock!.map((v, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span className="break-words">
                      {relationName(v.products)} ({v.name})
                    </span>
                  </div>
                  <span className="shrink-0 font-medium text-red-700">{v.stock_quantity} left</span>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      )}

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
        <Button asChild variant="accent">
          <Link href="/admin/products/new">Add product</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/orders">Manage orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/contacts">Contact messages</Link>
        </Button>
      </div>
    </div>
  );
}
