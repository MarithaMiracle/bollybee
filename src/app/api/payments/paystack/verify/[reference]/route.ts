import { NextRequest, NextResponse } from "next/server";
import { verifyAndFulfillOrder } from "@/actions/checkout";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  if (!reference) {
    return NextResponse.json({ error: "Reference required" }, { status: 400 });
  }

  const result = await verifyAndFulfillOrder(reference);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, order: result.order });
}
