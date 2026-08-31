"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import type { FulfillmentStatus } from "@/types";

export async function updateOrderFulfillment(
  orderId: string,
  status: FulfillmentStatus,
  adminNotes?: string
) {
  await requireAdmin();
  const supabase = createServiceClient();

  const update: Record<string, unknown> = {
    fulfillment_status: status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes !== undefined) update.admin_notes = adminNotes;

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) return { error: "Failed to update order" };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateContactStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("contact_submissions").update({ status }).eq("id", id);
  revalidatePath("/admin/contacts");
  return { success: true };
}
