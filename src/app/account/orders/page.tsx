import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {total} order{total !== 1 ? "s" : ""}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
            redirect("/");
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Sign Out
          </Button>
        </form>
      </div>
      {!orders?.length ? (
        <p className="mt-8 text-[var(--muted-foreground)]">No orders yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
          {orders.map((o) => (
            <li key={o.order_number} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">{o.order_number}</p>
                <p className="text-xs text-[var(--muted)]">
                  {o.fulfillment_status.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                <p>{formatNaira(o.total)}</p>
                <Link
                  href={`/track-order?order=${o.order_number}`}
                  className="text-xs text-[var(--plum)] underline"
                >
                  Track
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
      <Link href="/shop" className="mt-8 inline-block text-sm text-[var(--plum)] underline">
        Continue shopping
      </Link>
    </div>
  );
}
