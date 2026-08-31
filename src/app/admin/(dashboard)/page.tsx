import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";

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
    supabase.from("orders").select("total, payment_status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("status, amount"),
  ]);

  const revenue = payments
    ?.filter((p) => p.status === "SUCCESSFUL")
    .reduce((s, p) => s + p.amount, 0) ?? 0;

  const pendingOrders = orders?.filter((o) => o.payment_status === "PENDING").length ?? 0;

  const stats = [
    { label: "Total Revenue", value: formatNaira(revenue) },
    { label: "Orders", value: String(orderCount ?? 0) },
    { label: "Products", value: String(productCount ?? 0) },
    { label: "Pending Payments", value: String(pendingOrders) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-[var(--border)] bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">{s.label}</p>
            <p className="mt-2 text-2xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <h2 className="font-display text-xl">Recent Orders</h2>
        <ul className="mt-4 divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
          {(orders ?? []).map((o, i) => (
            <li key={i} className="flex justify-between px-4 py-3 text-sm">
              <span>{o.payment_status}</span>
              <span>{formatNaira(o.total)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/admin/products" className="text-sm text-[var(--plum)] underline">Manage Products</Link>
        <Link href="/admin/orders" className="text-sm text-[var(--plum)] underline">View Orders</Link>
        <Link href="/admin/shipping" className="text-sm text-[var(--plum)] underline">Shipping</Link>
      </div>
    </div>
  );
}
