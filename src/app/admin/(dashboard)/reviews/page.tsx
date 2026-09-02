import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { adminListParams, escapeIlike } from "@/lib/admin/list-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmpty } from "@/components/admin/admin-card";
import { AdminReviewItem } from "@/components/admin/admin-review-item";
import {
  AdminListToolbarSection,
  AdminToolbarCard,
} from "@/components/admin/admin-list-toolbar-section";
import { Pagination } from "@/components/ui/pagination";
import { relationName } from "@/lib/supabase/relation";
import {
  ADMIN_PAGE_SIZE,
  buildPageHref,
  pageRange,
  parsePage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

interface AdminReviewsPageProps {
  searchParams: Promise<{ pendingPage?: string; approvedPage?: string; q?: string }>;
}

function applyReviewSearch<T extends { or: (filters: string) => T }>(
  query: T,
  q?: string
): T {
  if (!q?.trim()) return query;
  const term = escapeIlike(q.trim());
  return query.or(
    `author_name.ilike.%${term}%,title.ilike.%${term}%,body.ilike.%${term}%`
  );
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const pendingPage = parsePage(params.pendingPage);
  const approvedPage = parsePage(params.approvedPage);
  const pendingRange = pageRange(pendingPage, ADMIN_PAGE_SIZE);
  const approvedRange = pageRange(approvedPage, ADMIN_PAGE_SIZE);
  const listParams = adminListParams(params, []);

  const supabase = createServiceClient();

  const [
    { data: pending, count: pendingTotal },
    { data: approved, count: approvedTotal },
  ] = await Promise.all([
    applyReviewSearch(
      supabase
        .from("product_reviews")
        .select("*, products(name, slug)", { count: "exact" })
        .eq("approved", false),
      params.q
    )
      .order("created_at", { ascending: false })
      .range(pendingRange.from, pendingRange.to),
    applyReviewSearch(
      supabase
        .from("product_reviews")
        .select("*, products(name, slug)", { count: "exact" })
        .eq("approved", true),
      params.q
    )
      .order("created_at", { ascending: false })
      .range(approvedRange.from, approvedRange.to),
  ]);

  const pendingCount = pendingTotal ?? 0;
  const approvedCount = approvedTotal ?? 0;

  function pendingHref(p: number) {
    const extra: Record<string, string | undefined> = { ...listParams };
    if (approvedPage > 1) extra.approvedPage = String(approvedPage);
    return buildPageHref("/admin/reviews", p, extra, "pendingPage");
  }

  function approvedHref(p: number) {
    const extra: Record<string, string | undefined> = { ...listParams };
    if (pendingPage > 1) extra.pendingPage = String(pendingPage);
    return buildPageHref("/admin/reviews", p, extra, "approvedPage");
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Product reviews"
        description={`${pendingCount} pending · ${approvedCount} approved`}
      />

      <AdminToolbarCard
        toolbar={
          <AdminListToolbarSection
            basePath="/admin/reviews"
            initialQuery={params.q}
            searchPlaceholder="Search author, title, or review…"
            preserveKeys={["pendingPage", "approvedPage"]}
            resetPageKeys={["pendingPage", "approvedPage"]}
          />
        }
      >
        <h2 className="border-b border-[var(--border)] px-5 py-4 font-display text-lg">
          Pending approval
        </h2>
        {!pending?.length ? (
          <AdminEmpty
            message={
              params.q?.trim()
                ? "No pending reviews match your search."
                : "No reviews awaiting approval."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-[var(--border)]">
              {pending.map((r) => (
                <AdminReviewItem
                  key={r.id}
                  id={r.id}
                  productName={relationName(r.products)}
                  authorName={r.author_name}
                  createdAt={new Date(r.created_at).toLocaleDateString("en-NG")}
                  rating={r.rating}
                  title={r.title}
                  body={r.body}
                  approved={false}
                />
              ))}
            </ul>
            <div className="px-5 pb-5">
              <Pagination
                page={pendingPage}
                total={pendingCount}
                limit={ADMIN_PAGE_SIZE}
                className="mt-6"
                buildHref={pendingHref}
              />
            </div>
          </>
        )}
      </AdminToolbarCard>

      <AdminToolbarCard>
        <h2 className="border-b border-[var(--border)] px-5 py-4 font-display text-lg">
          Approved
        </h2>
        {!approved?.length ? (
          <AdminEmpty
            message={
              params.q?.trim() ? "No approved reviews match your search." : "No approved reviews yet."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-[var(--border)]">
              {approved.map((r) => (
                <AdminReviewItem
                  key={r.id}
                  id={r.id}
                  productName={relationName(r.products)}
                  authorName={r.author_name}
                  createdAt={new Date(r.created_at).toLocaleDateString("en-NG")}
                  rating={r.rating}
                  title={r.title}
                  body={r.body}
                  approved
                />
              ))}
            </ul>
            <div className="px-5 pb-5">
              <Pagination
                page={approvedPage}
                total={approvedCount}
                limit={ADMIN_PAGE_SIZE}
                className="mt-6"
                buildHref={approvedHref}
              />
            </div>
          </>
        )}
      </AdminToolbarCard>
    </div>
  );
}
