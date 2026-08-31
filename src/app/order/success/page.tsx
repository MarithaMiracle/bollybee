import Link from "next/link";
import { verifyAndFulfillOrder } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ reference?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Order Confirmation</h1>
        <p className="mt-4 text-[var(--muted-foreground)]">No order reference provided.</p>
        <Button asChild className="mt-8"><Link href="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  const result = await verifyAndFulfillOrder(reference);

  if (result.error || !result.order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Payment Pending</h1>
        <p className="mt-4 text-[var(--muted-foreground)]">
          {result.error || "We are confirming your payment. Please check back shortly."}
        </p>
        <Button asChild className="mt-8"><Link href="/track-order">Track Order</Link></Button>
      </div>
    );
  }

  const order = result.order as {
    order_number: string;
    total: number;
    email: string;
    first_name: string;
    shipping_state: string;
    shipping_lga: string;
    shipping_address: string;
    order_items: { product_name: string; quantity: number; total: number }[];
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Thank you</p>
        <h1 className="mt-2 font-display text-4xl">Order Confirmed</h1>
        <p className="mt-4 text-[var(--muted-foreground)]">
          Hi {order.first_name}, your payment was successful.
        </p>
      </div>

      <div className="mt-10 border border-[var(--border)] bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Order number</dt>
            <dd className="font-medium">{order.order_number}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Total paid</dt>
            <dd className="font-medium">{formatNaira(order.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Shipping to</dt>
            <dd className="text-right">{order.shipping_address}, {order.shipping_lga}, {order.shipping_state}</dd>
          </div>
        </dl>

        <ul className="mt-6 divide-y divide-[var(--border)] border-t border-[var(--border)] pt-4">
          {order.order_items?.map((item, i) => (
            <li key={i} className="flex justify-between py-2 text-sm">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatNaira(item.total)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild><Link href={`/track-order?order=${order.order_number}&email=${encodeURIComponent(order.email)}`}>Track Order</Link></Button>
        <Button asChild variant="outline"><Link href="/shop">Continue Shopping</Link></Button>
      </div>
    </div>
  );
}
