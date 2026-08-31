/** Monetary amounts stored as NGN integers (naira, not kobo) in the database. */

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function formatMoney(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export function calculateLineTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function calculateOrderTotal(
  subtotal: number,
  shippingFee: number,
  discount = 0
): number {
  return Math.max(0, subtotal + shippingFee - discount);
}
