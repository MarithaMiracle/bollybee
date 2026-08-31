import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: rates } = await supabase
    .from("shipping_rates")
    .select("price, active, states(name), lgas(name)")
    .eq("active", true)
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-3xl">Shipping Rates</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Manage states, LGAs, and rates via Supabase or extend this admin UI.
      </p>
      <div className="mt-8 overflow-x-auto border border-[var(--border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="p-4">State</th>
              <th className="p-4">LGA</th>
              <th className="p-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {(rates ?? []).map((r, i) => (
              <tr key={i} className="border-b">
                <td className="p-4">{(r.states as unknown as { name: string })?.name}</td>
                <td className="p-4">{(r.lgas as unknown as { name: string } | null)?.name ?? "State-wide"}</td>
                <td className="p-4">{formatNaira(r.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
