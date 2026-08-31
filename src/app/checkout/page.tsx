"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart/cart-provider";
import { initializeCheckout } from "@/actions/checkout";
import { formatNaira } from "@/lib/utils";

interface StateOption {
  id: string;
  name: string;
}

interface LgaOption {
  id: string;
  name: string;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<StateOption[]>([]);
  const [lgas, setLgas] = useState<LgaOption[]>([]);
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    shippingState: "",
    shippingLga: "",
    shippingCity: "",
    shippingAddress: "",
    shippingLandmark: "",
    shippingPostalCode: "",
    customerNotes: "",
  });

  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  useEffect(() => {
    fetch("/api/shipping/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.shippingState) return;
    const state = states.find((s) => s.name === form.shippingState);
    if (!state) return;
    fetch(`/api/shipping/lgas?state_id=${state.id}`)
      .then((r) => r.json())
      .then((d) => setLgas(d.lgas ?? []))
      .catch(() => {});
  }, [form.shippingState, states]);

  useEffect(() => {
    if (form.shippingState && form.shippingLga) {
      fetch(
        `/api/shipping/rate?state=${encodeURIComponent(form.shippingState)}&lga=${encodeURIComponent(form.shippingLga)}`
      )
        .then((r) => r.json())
        .then((d) => setShippingFee(d.price ?? null))
        .catch(() => setShippingFee(null));
    }
  }, [form.shippingState, form.shippingLga]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p>Your cart is empty.</p>
        <Button className="mt-4" onClick={() => router.push("/shop")}>Shop Now</Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await initializeCheckout(items, form);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.authorizationUrl) {
      clearCart();
      window.location.href = result.authorizationUrl;
    }
  }

  const total = subtotal + (shippingFee ?? 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="mb-10 font-display text-4xl">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 font-display text-xl">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl">Shipping</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  required
                  value={form.shippingState}
                  onChange={(e) => setForm({ ...form, shippingState: e.target.value, shippingLga: "" })}
                  className="flex h-11 w-full border border-[var(--border)] bg-white px-4 text-sm"
                >
                  <option value="">Select state</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="lga">LGA</Label>
                <select
                  id="lga"
                  required
                  value={form.shippingLga}
                  onChange={(e) => setForm({ ...form, shippingLga: e.target.value })}
                  className="flex h-11 w-full border border-[var(--border)] bg-white px-4 text-sm"
                  disabled={!form.shippingState}
                >
                  <option value="">Select LGA</option>
                  {lgas.map((l) => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="postal">Postal code (optional)</Label>
                <Input id="postal" value={form.shippingPostalCode} onChange={(e) => setForm({ ...form, shippingPostalCode: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="landmark">Landmark (optional)</Label>
                <Input id="landmark" value={form.shippingLandmark} onChange={(e) => setForm({ ...form, shippingLandmark: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Order notes (optional)</Label>
                <Textarea id="notes" value={form.customerNotes} onChange={(e) => setForm({ ...form, customerNotes: e.target.value })} />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit border border-[var(--border)] bg-white p-6">
          <h2 className="font-display text-xl">Order Review</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.variationId} className="flex justify-between">
                <span>{i.productName} × {i.quantity}</span>
                <span>{formatNaira((i.price ?? 0) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shippingFee !== null ? formatNaira(shippingFee) : "—"}</dd>
            </div>
            <div className="flex justify-between text-base font-medium">
              <dt>Total</dt>
              <dd>{formatNaira(total)}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading || shippingFee === null}>
            {loading ? "Processing…" : "Pay with Paystack"}
          </Button>
          <p className="mt-3 text-center text-[10px] text-[var(--muted)]">Secured by Paystack</p>
        </aside>
      </form>
    </div>
  );
}
