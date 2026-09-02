import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import {
  ACCOUNT_ORDERS_PAGE_SIZE,
  buildPageHref,
  pageRange,
  parsePage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

interface AccountOrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountOrdersPage({ searchParams }: AccountOrdersPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page, ACCOUNT_ORDERS_PAGE_SIZE);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login");

  const { data: orders, count } = await supabase
    .from("orders")
    .select("order_number, total, payment_status, fulfillment_status, created_at", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return (
    <>
      <p className="text-sm text-[var(--muted-foreground)]">
        {total} order{total !== 1 ? "s" : ""}
      </p>

      {!orders?.length ? (
        <div className="mt-8 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-6 py-12 text-center">
          <p className="text-[var(--muted-foreground)]">No orders yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm text-[var(--plum)] underline-offset-4 hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--border)]">
          {orders.map((o) => (
            <li
              key={o.order_number}
              className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{o.order_number}</p>
                <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                  {o.fulfillment_status.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {new Date(o.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                <p className="font-medium">{formatNaira(o.total)}</p>
                <Link
                  href={`/track-order?order=${o.order_number}`}
                  className="text-xs text-[var(--plum)] underline-offset-4 hover:underline"
                >
                  Track order
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        total={total}
        limit={ACCOUNT_ORDERS_PAGE_SIZE}
        buildHref={(p) => buildPageHref("/account/orders", p)}
      />
    </>
  );
}
