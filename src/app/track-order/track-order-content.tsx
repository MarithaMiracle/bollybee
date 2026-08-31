"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrder } from "@/actions/orders";
import { formatNaira, FULFILLMENT_STEPS } from "@/lib/utils";

export default function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrder>> | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = await trackOrder(orderNumber, email);
    setResult(data);
    setLoading(false);
  }

  const order = result?.order as {
    order_number: string;
    total: number;
    fulfillment_status: string;
    order_items?: { product_name: string; quantity: number; total: number }[];
  } | undefined;

  const currentStepIndex = order
    ? FULFILLMENT_STEPS.findIndex((s) => s.key === order.fulfillment_status)
    : -1;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-8">
      <h1 className="font-display text-3xl sm:text-4xl">Track Your Order</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Enter your order number and email to view status.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order number</Label>
          <Input id="orderNumber" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="BB-..." />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Searching…" : "Track Order"}
        </Button>
      </form>

      {result?.error && (
        <p className="mt-6 text-sm text-[var(--destructive)]">{result.error}</p>
      )}

      {order && (
        <div className="mt-10 border border-[var(--border)] bg-white p-6">
          <p className="font-medium">{order.order_number}</p>
          <p className="text-sm text-[var(--muted)]">{order.fulfillment_status.replace(/_/g, " ")}</p>
          <p className="mt-2 text-lg font-medium">{formatNaira(order.total)}</p>

          <ol className="mt-8 space-y-4">
            {FULFILLMENT_STEPS.map((step, i) => (
              <li key={step.key} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center text-[10px] ${i <= currentStepIndex ? "bg-[var(--plum)] text-white" : "border border-[var(--border)] text-[var(--muted)]"}`}>
                  {i + 1}
                </span>
                <span className={i <= currentStepIndex ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          <ul className="mt-6 border-t border-[var(--border)] pt-4 text-sm">
            {order.order_items?.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 py-1 text-sm">
                <span className="min-w-0 flex-1 truncate">{item.product_name} × {item.quantity}</span>
                <span className="shrink-0">{formatNaira(item.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
