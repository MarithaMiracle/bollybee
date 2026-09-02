import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { adminListParams } from "@/lib/admin/list-query";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import {
  AdminListToolbarSection,
  AdminToolbarCard,
} from "@/components/admin/admin-list-toolbar-section";
import { ShippingRateRow } from "@/components/admin/shipping-rate-row";
import { ShippingCreateForm } from "@/components/admin/shipping-create-form";
import { createShippingRate } from "@/actions/admin-shipping";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["state", "active"] as const;

interface AdminShippingPageProps {
  searchParams: Promise<{ page?: string; state?: string; active?: string }>;
}

export default async function AdminShippingPage({ searchParams }: AdminShippingPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();

  const [{ data: states }, { data: lgas }] = await Promise.all([
    supabase.from("states").select("id, name").eq("active", true).order("name"),
    supabase.from("lgas").select("id, name, state_id").eq("active", true).order("name"),
  ]);

  let query = supabase
    .from("shipping_rates")
    .select("id, price, active, state_id, states(name), lgas(name)", { count: "exact" });

  if (params.state) query = query.eq("state_id", params.state);
  if (params.active === "true") query = query.eq("active", true);
  if (params.active === "false") query = query.eq("active", false);

  const { data: rates, count } = await query.order("price", { ascending: true }).range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Shipping rates"
        description={`${total} rate${total !== 1 ? "s" : ""} across Nigeria`}
      />

      <AdminCard>
        <form
          action={async (formData) => {
            "use server";
            await createShippingRate(formData);
          }}
          className="space-y-4 p-5"
        >
          <h2 className="font-display text-lg">Add shipping rate</h2>
          <ShippingCreateForm states={states ?? []} lgas={lgas ?? []} />
        </form>
      </AdminCard>

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/shipping"
            showSearch={false}
            filters={[
              {
                key: "state",
                label: "State",
                options: (states ?? []).map((s) => ({ value: s.id, label: s.name })),
              },
              {
                key: "active",
                label: "Status",
                options: [
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ],
              },
            ]}
          />
        }
      >
        <div className="max-md:overflow-visible overflow-x-auto">
          <table className="admin-table w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-5 py-3.5 font-medium">State</th>
                <th className="px-5 py-3.5 font-medium">LGA</th>
                <th className="px-5 py-3.5 font-medium">Price</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(rates ?? []).map((r) => (
                <ShippingRateRow
                  key={r.id}
                  id={r.id}
                  stateName={(r.states as unknown as { name: string })?.name}
                  lgaName={(r.lgas as unknown as { name: string } | null)?.name ?? null}
                  price={r.price}
                  active={r.active}
                />
              ))}
            </tbody>
          </table>
        </div>
        {!rates?.length && (
          <AdminEmpty message={params.state ? "No rates for this filter." : "No shipping rates configured."} />
        )}
      </AdminToolbarCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/shipping", p, listParams)}
      />
    </div>
  );
}
