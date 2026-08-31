import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, active, featured, product_variations(price, stock_quantity)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Link href="/admin/products/new" className="bg-[var(--foreground)] px-4 py-2 text-sm text-white">
          Add Product
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto border border-[var(--border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="p-4">Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Variations</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)]">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{p.active ? "Active" : "Draft"}</td>
                <td className="p-4">{(p.product_variations as unknown[])?.length ?? 0}</td>
                <td className="p-4">
                  <Link href={`/admin/products/${p.id}`} className="text-[var(--plum)] underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
