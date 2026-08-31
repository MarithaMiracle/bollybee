import { createServiceClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("states")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return Response.json({ states: data ?? [] });
}
