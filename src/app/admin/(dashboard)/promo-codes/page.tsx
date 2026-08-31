import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { AdminBadge } from "@/components/admin/admin-badge";
import { createPromoCode, togglePromoCode } from "@/actions/promo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminPromoCodesPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: codes } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Promo codes"
        description="Create and manage discount codes"
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
              <select
                id="discountType"
                name="discountType"
                className="flex h-11 w-full border border-[var(--border)] bg-white px-4 text-sm"
                required
              >
                <option value="PERCENT">Percent off</option>
                <option value="FIXED">Fixed amount (₦)</option>
              </select>
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

      <AdminCard>
        {!codes?.length ? (
          <AdminEmpty message="No promo codes yet." />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {codes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                <div>
                  <p className="font-mono font-medium">{c.code}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {c.discount_type === "PERCENT"
                      ? `${c.discount_value}% off`
                      : `₦${c.discount_value.toLocaleString()} off`}
                    {c.min_order_amount > 0 && ` · min ₦${c.min_order_amount.toLocaleString()}`}
                    {" · "}
                    used {c.used_count}
                    {c.max_uses !== null ? ` / ${c.max_uses}` : ""}
                  </p>
                  {c.description && (
                    <p className="text-xs text-[var(--muted-foreground)]">{c.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <AdminBadge label={c.active ? "ACTIVE" : "INACTIVE"} />
                  <form
                    action={async () => {
                      "use server";
                      await togglePromoCode(c.id, !c.active);
                    }}
                  >
                    <Button type="submit" variant="outline" size="sm">
                      {c.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
