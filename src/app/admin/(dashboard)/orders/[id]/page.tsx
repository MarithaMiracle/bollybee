import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { OrderDetailClient } from "@/components/admin/order-detail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), payments(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
