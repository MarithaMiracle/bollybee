import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { adminListParams, escapeIlike } from "@/lib/admin/list-query";
import { Pagination } from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZE, buildPageHref, pageRange, parsePage } from "@/lib/pagination";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminEmpty } from "@/components/admin/admin-card";
import {
  AdminListToolbarSection,
  AdminToolbarCard,
} from "@/components/admin/admin-list-toolbar-section";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["status"] as const;

interface AdminProductsPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, [...FILTER_KEYS]);

  const supabase = createServiceClient();
  let query = supabase
    .from("products")
    .select("id, name, slug, active, featured, product_variations(price, stock_quantity)", {
      count: "exact",
    });

  if (params.q?.trim()) {
    const term = escapeIlike(params.q.trim());
    query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
  }
  if (params.status === "active") query = query.eq("active", true);
  if (params.status === "draft") query = query.eq("active", false);

  const { data: products, count } = await query
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

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/products"
            initialQuery={params.q}
            searchPlaceholder="Search product name or slug…"
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "active", label: "Active" },
                  { value: "draft", label: "Draft" },
                ],
              },
            ]}
          />
        }
      >
        <div className="max-md:overflow-visible overflow-x-auto">
          <table className="admin-table w-full min-w-[560px] text-sm">
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
                  <td data-label="Name" className="px-5 py-4 font-medium">{p.name}</td>
                  <td data-label="Status" className="px-5 py-4">
                    <AdminBadge label={p.active ? "Active" : "Draft"} variant={p.active ? "success" : "draft"} />
                  </td>
                  <td data-label="Variations" className="px-5 py-4 text-[var(--muted-foreground)]">
                    {(p.product_variations as unknown[])?.length ?? 0}
                  </td>
                  <td data-label="" className="px-5 py-4 text-right">
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
        {!products?.length && (
          <AdminEmpty
            message={
              params.q || params.status
                ? "No products match your filters."
                : "No products yet. Add your first fragrance."
            }
          />
        )}
      </AdminToolbarCard>

      <Pagination
        page={page}
        total={total}
        limit={ADMIN_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/admin/products", p, listParams)}
      />
    </div>
  );
}
