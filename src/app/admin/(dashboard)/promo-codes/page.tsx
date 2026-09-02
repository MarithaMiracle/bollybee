import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { adminListParams, escapeIlike } from "@/lib/admin/list-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { PromoCodeRow } from "@/components/admin/promo-code-row";
import {
  AdminListToolbarSection,
  AdminToolbarCard,
} from "@/components/admin/admin-list-toolbar-section";
import { Pagination } from "@/components/ui/pagination";
import { createPromoCode } from "@/actions/promo";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["active"] as const;

interface AdminPromoCodesPageProps {
  searchParams: Promise<{ page?: string; q?: string; active?: string }>;
}

export default async function AdminPromoCodesPage({ searchParams }: AdminPromoCodesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();
  let query = supabase.from("promo_codes").select("*", { count: "exact" });

  if (params.q?.trim()) {
    const term = escapeIlike(params.q.trim());
    query = query.or(`code.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (params.active === "true") query = query.eq("active", true);
  if (params.active === "false") query = query.eq("active", false);

  const { data: codes, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Promo codes"
        description={`${total} code${total !== 1 ? "s" : ""} total`}
      />

      <AdminCard>
        <form
          action={async (formData) => {
            "use server";
            await createPromoCode(formData);
          }}
          className="space-y-4 p-5"
        >
          <h2 className="font-display text-lg">Create promo code</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" placeholder="WELCOME10" required />
            </div>
            <div>
              <Label htmlFor="discountType">Type</Label>
              <Select id="discountType" name="discountType" required>
                <option value="PERCENT">Percent off</option>
                <option value="FIXED">Fixed amount (₦)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="discountValue">Value</Label>
              <Input id="discountValue" name="discountValue" type="number" min={1} required />
            </div>
            <div>
              <Label htmlFor="minOrderAmount">Min order (₦)</Label>
              <Input id="minOrderAmount" name="minOrderAmount" type="number" min={0} defaultValue={0} />
            </div>
            <div>
              <Label htmlFor="maxUses">Max uses (optional)</Label>
              <Input id="maxUses" name="maxUses" type="number" min={1} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="10% off first order" />
            </div>
          </div>
          <Button type="submit">Create code</Button>
        </form>
      </AdminCard>

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/promo-codes"
            initialQuery={params.q}
            searchPlaceholder="Search code or description…"
            filters={[
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
        {!codes?.length ? (
          <AdminEmpty
            message={
              params.q || params.active
                ? "No promo codes match your filters."
                : "No promo codes yet."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-[var(--border)]">
              {codes.map((c) => (
                <PromoCodeRow
                  key={c.id}
                  id={c.id}
                  code={c.code}
                  discountLabel={
                    c.discount_type === "PERCENT"
                      ? `${c.discount_value}% off${c.min_order_amount > 0 ? ` · min ₦${c.min_order_amount.toLocaleString()}` : ""}`
                      : `₦${c.discount_value.toLocaleString()} off${c.min_order_amount > 0 ? ` · min ₦${c.min_order_amount.toLocaleString()}` : ""}`
                  }
                  usageLabel={`used ${c.used_count}${c.max_uses !== null ? ` / ${c.max_uses}` : ""}`}
                  description={c.description}
                  active={c.active}
                />
              ))}
            </ul>
            <div className="px-5 pb-5">
              <Pagination
                page={page}
                total={total}
                limit={ADMIN_PAGE_SIZE}
                className="mt-2"
                buildHref={(p) => buildPageHref("/admin/promo-codes", p, listParams)}
              />
            </div>
          </>
        )}
      </AdminToolbarCard>
    </div>
  );
}
