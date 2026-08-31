"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart/cart-provider";
import { initializeCheckout, getCheckoutDefaults } from "@/actions/checkout";
import { validatePromoCode } from "@/actions/promo";
import { trackAbandonedCart } from "@/actions/abandoned-cart";
import { formatNaira } from "@/lib/utils";

interface StateOption {
  id: string;
  name: string;
}

interface LgaOption {
  id: string;
  name: string;
}

const EMPTY_FORM = {
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
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [states, setStates] = useState<StateOption[]>([]);
  const [lgas, setLgas] = useState<LgaOption[]>([]);
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  useEffect(() => {
    getCheckoutDefaults().then((defaults) => {
      if (!defaults) return;
      setForm((prev) => ({
        ...prev,
        ...defaults,
        customerNotes: "",
      }));
      setPrefilled(true);
      setIsLoggedIn(true);
    });
  }, []);

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

  const trackCart = useCallback(() => {
    if (!form.email || !items.length) return;
    trackAbandonedCart(form.email, items);
  }, [form.email, items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p>Your cart is empty.</p>
        <Button className="mt-4" onClick={() => router.push("/shop")}>Shop Now</Button>
      </div>
    );
  }

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    const result = await validatePromoCode(promoCode, subtotal);
    setPromoLoading(false);
    if (result.error) {
      toast.error(result.error);
      setPromoDiscount(0);
      setPromoLabel(null);
    } else if (result.result) {
      setPromoDiscount(result.result.discount);
      setPromoLabel(result.result.description ?? result.result.code);
      toast.success("Promo code applied");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const checkoutData = {
      ...form,
      promoCode: promoDiscount > 0 ? promoCode : "",
      saveAddress: saveAddress ? "true" : "false",
    };
    const result = await initializeCheckout(items, checkoutData);
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

  const total = Math.max(0, subtotal + (shippingFee ?? 0) - promoDiscount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
        {prefilled && (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Welcome back — we&apos;ve filled in your details from your saved address or last order.
          </p>
        )}
      </div>
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
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={trackCart}
                />
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
              {isLoggedIn && (
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="saveAddress">Save this address to my profile</Label>
                </div>
              )}
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
              <li key={i.variationId} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{i.productName} × {i.quantity}</span>
                <span className="shrink-0">{formatNaira((i.price ?? 0) * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={promoLoading}>
              Apply
            </Button>
          </div>
          {promoLabel && promoDiscount > 0 && (
            <p className="mt-2 text-xs text-green-700">{promoLabel} applied</p>
          )}

          <dl className="mt-6 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shippingFee !== null ? formatNaira(shippingFee) : "—"}</dd>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd>−{formatNaira(promoDiscount)}</dd>
              </div>
            )}
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
