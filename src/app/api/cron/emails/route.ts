import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { abandonedCartEmail, lowStockAlertEmail, sendTemplatedEmail } from "@/lib/email";
import { relationName } from "@/lib/supabase/relation";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: carts } = await supabase
    .from("abandoned_carts")
    .select("id, email, cart_items, user_id")
    .is("reminder_sent_at", null)
    .is("recovered_at", null)
    .lt("updated_at", oneHourAgo)
    .limit(10);

  let sent = 0;
  for (const cart of carts ?? []) {
    const items = cart.cart_items as unknown[];
    if (!items?.length) continue;

    const firstName = cart.email.split("@")[0];
    const ok = await sendTemplatedEmail(
      cart.email,
      abandonedCartEmail(firstName, items.length)
    );

    if (ok) {
      await supabase
        .from("abandoned_carts")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", cart.id);
      sent++;
      // Avoid Resend burst rate limits on free tier
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Low stock alert (once per cron run, max 10 items)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const { data: lowStock } = await supabase
      .from("product_variations")
      .select("name, stock_quantity, products(name)")
      .lte("stock_quantity", 5)
      .eq("active", true)
      .order("stock_quantity", { ascending: true })
      .limit(10);

    if (lowStock?.length) {
      await sendTemplatedEmail(
        adminEmail,
        lowStockAlertEmail(
          lowStock.map((v) => ({
            productName: relationName(v.products),
            variationName: v.name,
            stock: v.stock_quantity,
          }))
        )
      );
    }
  }

  return NextResponse.json({ abandonedCartEmailsSent: sent });
}
