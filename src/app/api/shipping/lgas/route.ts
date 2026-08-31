import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const stateId = req.nextUrl.searchParams.get("state_id");
  if (!stateId) {
    return NextResponse.json({ error: "state_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("lgas")
    .select("id, name")
    .eq("state_id", stateId)
    .eq("active", true)
    .order("name");

  return NextResponse.json({ lgas: data ?? [] });
}
