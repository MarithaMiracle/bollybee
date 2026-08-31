import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, email, total, payment_status, fulfillment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-8 overflow-x-auto border border-[var(--border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-[var(--border)]">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="text-[var(--plum)] underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="p-4">{o.email}</td>
                <td className="p-4">{formatNaira(o.total)}</td>
                <td className="p-4">{o.payment_status}</td>
                <td className="p-4">{o.fulfillment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
