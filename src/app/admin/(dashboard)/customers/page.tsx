import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";

export const dynamic = "force-dynamic";

interface AdminCustomersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

  const supabase = createServiceClient();

  const { data: profiles, count } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total, payment_status")
    .not("user_id", "is", null);

  const statsByUser = new Map<string, { orderCount: number; totalSpent: number }>();

  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const current = statsByUser.get(order.user_id) ?? { orderCount: 0, totalSpent: 0 };
    current.orderCount += 1;
    if (order.payment_status === "SUCCESSFUL") {
      current.totalSpent += order.total;
    }
    statsByUser.set(order.user_id, current);
  }

  const emailById = new Map<string, string>();
  await Promise.all(
    (profiles ?? []).map(async (profile) => {
      const { data } = await supabase.auth.admin.getUserById(profile.id);
      emailById.set(profile.id, data.user?.email ?? "—");
    })
  );

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Customers"
        description={`${total} registered account${total !== 1 ? "s" : ""}`}
      />

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Orders</th>
                <th className="px-5 py-3.5 font-medium">Spent</th>
                <th className="px-5 py-3.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(profiles ?? []).map((profile) => {
                const stats = statsByUser.get(profile.id) ?? { orderCount: 0, totalSpent: 0 };
                return (
                  <tr key={profile.id} className="transition-colors hover:bg-[var(--surface)]/50">
                    <td className="px-5 py-4 font-medium">{profile.full_name ?? "—"}</td>
                    <td className="px-5 py-4 text-[var(--muted-foreground)]">
                      {emailById.get(profile.id) ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <AdminBadge
                        label={profile.role}
                        variant={profile.role === "ADMIN" ? "neutral" : "draft"}
                      />
                    </td>
                    <td className="px-5 py-4">{stats.orderCount}</td>
                    <td className="px-5 py-4 font-medium">{formatNaira(stats.totalSpent)}</td>
                    <td className="px-5 py-4 text-[var(--muted-foreground)]">
                      {new Date(profile.created_at).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!profiles?.length && (
          <AdminEmpty message="No customers yet. Accounts appear after registration." />
        )}
      </AdminCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/customers", p)}
      />
    </div>
  );
}
