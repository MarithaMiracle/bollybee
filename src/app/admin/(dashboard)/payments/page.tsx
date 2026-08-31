import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("reference, amount, status, provider_transaction_id, created_at, orders(order_number)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-3xl">Payments</h1>
      <div className="mt-8 overflow-x-auto border border-[var(--border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="p-4">Reference</th>
              <th className="p-4">Order</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => (
              <tr key={p.reference} className="border-b border-[var(--border)]">
                <td className="p-4 font-mono text-xs">{p.reference}</td>
                <td className="p-4">{(p.orders as unknown as { order_number: string } | null)?.order_number}</td>
                <td className="p-4">{formatNaira(p.amount)}</td>
                <td className="p-4">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
