"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyAndFulfillOrder } from "@/actions/checkout";
import { orderStatusEmail, sendTemplatedEmail } from "@/lib/email";
import type { FulfillmentStatus } from "@/types";

const EMAIL_STATUSES: FulfillmentStatus[] = [
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export async function updateOrderFulfillment(
  orderId: string,
  status: FulfillmentStatus,
  adminNotes?: string
) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: before } = await supabase
    .from("orders")
    .select("fulfillment_status, order_number, first_name, email")
    .eq("id", orderId)
    .single();

  const update: Record<string, unknown> = {
    fulfillment_status: status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes !== undefined) update.admin_notes = adminNotes;

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) return { error: "Failed to update order" };

  if (
    before &&
    before.fulfillment_status !== status &&
    EMAIL_STATUSES.includes(status)
  ) {
    await sendTemplatedEmail(
      before.email,
      orderStatusEmail({
        orderNumber: before.order_number,
        firstName: before.first_name,
        email: before.email,
        fulfillmentStatus: status,
      })
    );
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function reverifyOrderPayment(orderId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("reference")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment?.reference) return { error: "No payment reference found for this order" };

  const result = await verifyAndFulfillOrder(payment.reference);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  return result;
}

export async function updateContactStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("contact_submissions").update({ status }).eq("id", id);
  revalidatePath("/admin/contacts");
  return { success: true };
}
