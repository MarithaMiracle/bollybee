import { describe, it, expect } from "vitest";
import {
  nairaToKobo,
  koboToNaira,
  calculateLineTotal,
  calculateOrderTotal,
} from "@/lib/money";

describe("money utilities", () => {
  it("converts naira to kobo", () => {
    expect(nairaToKobo(100)).toBe(10000);
    expect(nairaToKobo(28500)).toBe(2850000);
  });

  it("converts kobo to naira", () => {
    expect(koboToNaira(10000)).toBe(100);
  });

  it("calculates line total", () => {
    expect(calculateLineTotal(18500, 2)).toBe(37000);
  });

  it("calculates order total with shipping and discount", () => {
    expect(calculateOrderTotal(37000, 2500, 0)).toBe(39500);
    expect(calculateOrderTotal(37000, 2500, 1000)).toBe(38500);
  });
});

describe("payment reference format", () => {
  it("generates BOLLYBEE prefix references", async () => {
    const { generatePaymentReference } = await import("@/lib/paystack");
    const ref = generatePaymentReference();
    expect(ref.startsWith("BOLLYBEE-")).toBe(true);
  });
});

describe("checkout validation schema", () => {
  it("rejects empty cart", async () => {
    const { cartSchema } = await import("@/lib/validations");
    const result = cartSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  it("accepts valid cart items", async () => {
    const { cartSchema } = await import("@/lib/validations");
    const result = cartSchema.safeParse([
      {
        productId: "550e8400-e29b-41d4-a716-446655440000",
        variationId: "550e8400-e29b-41d4-a716-446655440001",
        quantity: 1,
      },
    ]);
    expect(result.success).toBe(true);
  });
});

describe("webhook idempotency logic", () => {
  it("verifyWebhookSignature rejects missing signature when secret is set", async () => {
    const prev = process.env.PAYSTACK_WEBHOOK_SECRET;
    process.env.PAYSTACK_WEBHOOK_SECRET = "test-secret";
    const { verifyWebhookSignature } = await import("@/lib/paystack");
    expect(verifyWebhookSignature("{}", null)).toBe(false);
    process.env.PAYSTACK_WEBHOOK_SECRET = prev;
  });
});
