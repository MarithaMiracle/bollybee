import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { verifyAndFulfillOrder } from "@/actions/checkout";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    event: string;
    data: { reference: string; status: string };
  };

  if (event.event === "charge.success" && event.data.reference) {
    await verifyAndFulfillOrder(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
