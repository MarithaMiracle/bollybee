import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { Banknote, ShoppingCart, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const [{ data: orders }, { data: products }] = await Promise.all([
    supabase
      .from("orders")
      .select("total, payment_status, created_at")
      .eq("payment_status", "SUCCESSFUL"),
    supabase.from("products").select("name, is_bestseller").eq("is_bestseller", true).limit(5),
  ]);

  const revenue = orders?.reduce((s, o) => s + o.total, 0) ?? 0;
  const orderCount = orders?.length ?? 0;
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  return (
    <div className="space-y-10">
      <AdminPageHeader title="Analytics" description="Store performance at a glance" />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Revenue" value={formatNaira(revenue)} icon={Banknote} />
        <AdminStatCard label="Successful orders" value={String(orderCount)} icon={ShoppingCart} />
        <AdminStatCard label="Avg order value" value={formatNaira(aov)} icon={TrendingUp} />
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl">Best sellers</h2>
        <AdminCard>
          {!products?.length ? (
            <AdminEmpty message="No best sellers flagged yet." />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {products.map((p) => (
                <li key={p.name} className="px-5 py-4 text-sm font-medium">
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
