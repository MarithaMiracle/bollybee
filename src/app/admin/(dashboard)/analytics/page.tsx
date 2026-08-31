import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const [{ data: orders }, { data: products }] = await Promise.all([
    supabase.from("orders").select("total, payment_status, created_at").eq("payment_status", "SUCCESSFUL"),
    supabase.from("products").select("name, is_bestseller").eq("is_bestseller", true).limit(5),
  ]);

  const revenue = orders?.reduce((s, o) => s + o.total, 0) ?? 0;
  const orderCount = orders?.length ?? 0;
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  return (
    <div>
      <h1 className="font-display text-3xl">Analytics</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--border)] bg-white p-6">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Revenue</p>
          <p className="mt-2 text-2xl">{formatNaira(revenue)}</p>
        </div>
        <div className="border border-[var(--border)] bg-white p-6">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Successful Orders</p>
          <p className="mt-2 text-2xl">{orderCount}</p>
        </div>
        <div className="border border-[var(--border)] bg-white p-6">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Avg Order Value</p>
          <p className="mt-2 text-2xl">{formatNaira(aov)}</p>
        </div>
      </div>
      <h2 className="mt-10 font-display text-xl">Best Sellers</h2>
      <ul className="mt-4 space-y-2">
        {(products ?? []).map((p) => (
          <li key={p.name} className="text-sm">{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
