import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);

  const supabase = createServiceClient();
  const { data: products, count } = await supabase
    .from("products")
    .select("id, name, slug, active, featured, product_variations(price, stock_quantity)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Products"
        description={`${total} fragrance${total !== 1 ? "s" : ""} in catalogue`}
        action={{ label: "Add product", href: "/admin/products/new" }}
      />

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Variations</th>
                <th className="px-5 py-3.5 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {(products ?? []).map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-[var(--surface)]/50">
                  <td className="px-5 py-4 font-medium">{p.name}</td>
                  <td className="px-5 py-4">
                    <AdminBadge label={p.active ? "Active" : "Draft"} variant={p.active ? "success" : "draft"} />
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)]">
                    {(p.product_variations as unknown[])?.length ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[var(--plum)] underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!products?.length && <AdminEmpty message="No products yet. Add your first fragrance." />}
      </AdminCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/products", p)}
      />
    </div>
  );
}
