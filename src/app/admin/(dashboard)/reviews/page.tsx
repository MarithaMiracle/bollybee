import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminEmpty } from "@/components/admin/admin-card";
import { AdminBadge } from "@/components/admin/admin-badge";
import { approveReview, deleteReview } from "@/actions/reviews";
import { relationName } from "@/lib/supabase/relation";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("*, products(name, slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  const pending = reviews?.filter((r) => !r.approved) ?? [];
  const approved = reviews?.filter((r) => r.approved) ?? [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Product reviews"
        description={`${pending.length} pending · ${approved.length} approved`}
      />

      <AdminCard>
        <h2 className="border-b border-[var(--border)] px-5 py-4 font-display text-lg">
          Pending approval
        </h2>
        {!pending.length ? (
          <AdminEmpty message="No reviews awaiting approval." />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {pending.map((r) => (
              <li key={r.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {relationName(r.products)}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {r.author_name} · {new Date(r.created_at).toLocaleDateString("en-NG")}
                    </p>
                    <div className="mt-1 flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-[var(--plum)] text-[var(--plum)]" : "text-[var(--border)]"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <AdminBadge label="PENDING" />
                </div>
                {r.title && <p className="font-display text-base">{r.title}</p>}
                <p className="text-sm text-[var(--muted-foreground)]">{r.body}</p>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await approveReview(r.id);
                    }}
                  >
                    <Button type="submit" size="sm">Approve</Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteReview(r.id);
                    }}
                  >
                    <Button type="submit" variant="outline" size="sm">Reject</Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {approved.length > 0 && (
        <AdminCard>
          <h2 className="border-b border-[var(--border)] px-5 py-4 font-display text-lg">
            Approved
          </h2>
          <ul className="divide-y divide-[var(--border)]">
            {approved.slice(0, 20).map((r) => (
              <li key={r.id} className="px-5 py-4 text-sm">
                <p className="font-medium">{relationName(r.products)}</p>
                <p className="text-xs text-[var(--muted)]">{r.author_name} · {r.rating}/5</p>
                <p className="mt-1 text-[var(--muted-foreground)] line-clamp-2">{r.body}</p>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}
