import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total, payment_status")
    .not("user_id", "is", null);

  const statsByUser = new Map<
    string,
    { orderCount: number; totalSpent: number }
  >();

  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const current = statsByUser.get(order.user_id) ?? {
      orderCount: 0,
      totalSpent: 0,
    };
    current.orderCount += 1;
    if (order.payment_status === "SUCCESSFUL") {
      current.totalSpent += order.total;
    }
    statsByUser.set(order.user_id, current);
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers({
    perPage: 100,
  });

  const emailById = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email ?? "—"])
  );

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Registered accounts and order activity.
      </p>
      <div className="mt-8 overflow-x-auto border border-[var(--border)] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {(profiles ?? []).map((profile) => {
              const stats = statsByUser.get(profile.id) ?? {
                orderCount: 0,
                totalSpent: 0,
              };
              return (
                <tr key={profile.id}>
                  <td className="px-4 py-3 font-medium">
                    {profile.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {emailById.get(profile.id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">{profile.role}</td>
                  <td className="px-4 py-3">{stats.orderCount}</td>
                  <td className="px-4 py-3">
                    {formatNaira(stats.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {new Date(profile.created_at).toLocaleDateString("en-NG")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!profiles?.length && (
          <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            No customers yet. Accounts appear after registration.
          </p>
        )}
      </div>
    </div>
  );
}
