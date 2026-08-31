import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";

export const dynamic = "force-dynamic";

interface AdminShippingPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminShippingPage({ searchParams }: AdminShippingPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

  const supabase = createServiceClient();
  const { data: rates, count } = await supabase
    .from("shipping_rates")
    .select("price, active, states(name), lgas(name)", { count: "exact" })
    .eq("active", true)
    .order("price", { ascending: true })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Shipping rates"
        description={`${total} active rate${total !== 1 ? "s" : ""} across Nigeria`}
      />

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-5 py-3.5 font-medium">State</th>
                <th className="px-5 py-3.5 font-medium">LGA</th>
                <th className="px-5 py-3.5 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(rates ?? []).map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-[var(--surface)]/50">
                  <td className="px-5 py-4 font-medium">
                    {(r.states as unknown as { name: string })?.name}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)]">
                    {(r.lgas as unknown as { name: string } | null)?.name ?? "State-wide"}
                  </td>
                  <td className="px-5 py-4 font-medium">{formatNaira(r.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rates?.length && <AdminEmpty message="No shipping rates configured." />}
      </AdminCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/shipping", p)}
      />
    </div>
  );
}
