import Link from "next/link";
import { verifyAndFulfillOrder } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/layout/back-link";
import { formatNaira } from "@/lib/utils";
import { resolvePaystackReference } from "@/lib/paystack/reference";
import type { PaystackRedirectParams } from "@/lib/paystack/reference";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<PaystackRedirectParams>;
}

type ConfirmedOrder = {
  order_number: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  promo_code: string | null;
  email: string;
  first_name: string;
  shipping_state: string;
  shipping_lga: string;
  shipping_city: string;
  shipping_address: string;
  order_items: { product_name: string; quantity: number; total: number }[];
};

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const reference = resolvePaystackReference(params);

  if (!reference) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <BackLink href="/shop" label="Back to shop" className="mb-8" />
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
        <BackLink href="/shop" label="Back to shop" className="mb-8" />
        <h1 className="font-display text-3xl">Payment Pending</h1>
        <p className="mt-4 text-[var(--muted-foreground)]">
          {result.error || "We are confirming your payment. Please check back shortly."}
        </p>
        <Button asChild className="mt-8"><Link href="/track-order">Track Order</Link></Button>
      </div>
    );
  }

  const order = result.order as ConfirmedOrder;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16 md:px-8 md:py-24">
      <BackLink href="/shop" label="Back to shop" className="mb-6 sm:mb-8" />
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Thank you</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl">Order Confirmed</h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)] sm:mt-4 sm:text-base">
          Hi {order.first_name}, your payment was successful.
        </p>
      </div>

      <div className="brand-panel mt-8 space-y-5 bg-white p-5 sm:mt-10 sm:space-y-6 sm:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Order number</p>
          <p className="mt-1.5 break-all font-medium">{order.order_number}</p>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:mb-3">Items</p>
          <ul className="divide-y divide-[var(--border)]">
            {order.order_items?.map((item, i) => (
              <li key={i} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <span className="min-w-0 leading-relaxed">
                  {item.product_name}
                  <span className="text-[var(--muted-foreground)]"> × {item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums sm:text-right">
                  {formatNaira(item.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="space-y-3 border-t border-[var(--border)] pt-4 text-sm sm:space-y-2.5 sm:pt-5">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--muted-foreground)]">Subtotal</dt>
            <dd className="shrink-0 tabular-nums">{formatNaira(order.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--muted-foreground)]">Shipping</dt>
            <dd className="shrink-0 tabular-nums">{formatNaira(order.shipping_fee)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex items-start justify-between gap-4 text-green-700">
              <dt className="min-w-0 pr-2">
                Discount
                {order.promo_code ? (
                  <span className="mt-0.5 block text-xs sm:mt-0 sm:inline sm:text-sm">
                    ({order.promo_code})
                  </span>
                ) : null}
              </dt>
              <dd className="shrink-0 tabular-nums">−{formatNaira(order.discount)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-3 font-medium">
            <dt>Total paid</dt>
            <dd className="shrink-0 tabular-nums">{formatNaira(order.total)}</dd>
          </div>
        </dl>

        <div className="border-t border-[var(--border)] pt-4 sm:pt-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Shipping to</p>
          <address className="mt-2 not-italic text-sm leading-relaxed text-[var(--muted-foreground)]">
            {order.first_name}
            <br />
            {order.shipping_address}
            <br />
            {order.shipping_lga}, {order.shipping_city}, {order.shipping_state}
          </address>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3">
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/track-order?order=${order.order_number}&email=${encodeURIComponent(order.email)}`}>
            Track Order
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
