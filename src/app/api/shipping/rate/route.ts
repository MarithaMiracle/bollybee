import { NextRequest, NextResponse } from "next/server";
import { getShippingFee } from "@/lib/commerce/cart";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state");
  const lga = req.nextUrl.searchParams.get("lga");

  if (!state || !lga) {
    return NextResponse.json({ error: "state and lga required" }, { status: 400 });
  }

  const price = await getShippingFee(state, lga);
  return NextResponse.json({ price });
}
