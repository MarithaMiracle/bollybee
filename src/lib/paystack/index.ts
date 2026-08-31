import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export function generatePaymentReference(): string {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
  return `BOLLYBEE-${id}`;
}

export interface PaystackInitParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(
  params: PaystackInitParams
): Promise<PaystackInitResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack secret key not configured");

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: "NGN",
      metadata: params.metadata,
    }),
  });

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || "Failed to initialize Paystack transaction");
  }

  return json.data;
}

export interface PaystackVerifyResponse {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string;
  id: number;
  metadata: Record<string, unknown>;
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse | null> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack secret key not configured");

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );

  const json = await res.json();
  if (!json.status) return null;
  return json.data;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  // Paystack signs webhooks with your secret key (sk_test_ / sk_live_), not a separate secret.
  // PAYSTACK_WEBHOOK_SECRET is optional — falls back to PAYSTACK_SECRET_KEY.
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}
