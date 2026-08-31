import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/account/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("order_number, total, payment_status, fulfillment_status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">My Orders</h1>
        <form action={async () => {
          "use server";
          await signOut();
          redirect("/");
        }}>
          <Button type="submit" variant="outline" size="sm">Sign Out</Button>
        </form>
      </div>
      {!orders?.length ? (
        <p className="mt-8 text-[var(--muted-foreground)]">No orders yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--border)] border border-[var(--border)] bg-white">
          {orders.map((o) => (
            <li key={o.order_number} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs text-[var(--muted)]">{o.fulfillment_status.replace(/_/g, " ")}</p>
              </div>
              <div className="text-right">
                <p>{formatNaira(o.total)}</p>
                <Link href={`/track-order?order=${o.order_number}`} className="text-xs text-[var(--plum)] underline">
                  Track
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/shop" className="mt-8 inline-block text-sm text-[var(--plum)] underline">
        Continue shopping
      </Link>
    </div>
  );
}
