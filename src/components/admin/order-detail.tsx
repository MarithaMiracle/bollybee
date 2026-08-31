"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updateOrderFulfillment } from "@/actions/admin-orders";
import { formatNaira, FULFILLMENT_STEPS } from "@/lib/utils";
import type { FulfillmentStatus } from "@/types";

interface OrderDetailProps {
  order: {
    id: string;
    order_number: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    total: number;
    subtotal: number;
    shipping_fee: number;
    payment_status: string;
    fulfillment_status: FulfillmentStatus;
    shipping_state: string;
    shipping_lga: string;
    shipping_city: string;
    shipping_address: string;
    admin_notes: string | null;
    order_items: {
      product_name: string;
      variation_name: string;
      quantity: number;
      unit_price: number;
      total: number;
    }[];
    payments?: { reference: string; status: string; amount: number }[];
  };
}

export function OrderDetailClient({ order }: OrderDetailProps) {
  const [status, setStatus] = useState(order.fulfillment_status);
  const [notes, setNotes] = useState(order.admin_notes ?? "");
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const result = await updateOrderFulfillment(order.id, status, notes);
    setLoading(false);
    result.error ? toast.error(result.error) : toast.success("Order updated");
  }

  const stepIndex = FULFILLMENT_STEPS.findIndex((s) => s.key === order.fulfillment_status);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">{order.order_number}</h1>
          <p className="text-sm text-[var(--muted)]">{order.email} · {order.phone}</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-[var(--plum)] underline">← Back</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border bg-white p-6">
          <h2 className="font-display text-lg">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{formatNaira(order.shipping_fee)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatNaira(order.total)}</dd></div>
            <div className="flex justify-between"><dt>Payment</dt><dd>{order.payment_status}</dd></div>
          </dl>
          {order.payments?.[0] && (
            <p className="mt-4 text-xs text-[var(--muted)]">Ref: {order.payments[0].reference}</p>
          )}
        </div>

        <div className="border bg-white p-6">
          <h2 className="font-display text-lg">Shipping</h2>
          <p className="mt-2 text-sm">{order.first_name} {order.last_name}</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {order.shipping_address}, {order.shipping_city}<br />
            {order.shipping_lga}, {order.shipping_state}
          </p>
        </div>
      </div>

      <div className="border bg-white p-6">
        <h2 className="font-display text-lg">Items</h2>
        <ul className="mt-4 divide-y text-sm">
          {order.order_items.map((item, i) => (
            <li key={i} className="flex justify-between py-2">
              <span>{item.product_name} ({item.variation_name}) × {item.quantity}</span>
              <span>{formatNaira(item.total)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border bg-white p-6">
        <h2 className="font-display text-lg">Update Fulfillment</h2>
        <div className="mt-4 space-y-4 max-w-md">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FulfillmentStatus)}
            className="w-full border px-3 py-2 text-sm"
          >
            {FULFILLMENT_STEPS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
            <option value="CANCELLED">Cancelled</option>
          </select>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes"
            rows={3}
            className="w-full border p-3 text-sm"
          />
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Saving…" : "Update Order"}
          </Button>
        </div>
        <ol className="mt-6 flex flex-wrap gap-2">
          {FULFILLMENT_STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider ${i <= stepIndex ? "bg-[var(--plum)] text-white" : "border text-[var(--muted)]"}`}
            >
              {s.label}
            </span>
          ))}
        </ol>
      </div>
    </div>
  );
}
