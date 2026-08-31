"use server";

import { getOrderByNumberAndEmail } from "@/lib/data/products";
import { trackOrderSchema } from "@/lib/validations";

export async function trackOrder(orderNumber: string, email: string) {
  const parsed = trackOrderSchema.safeParse({ orderNumber, email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const order = await getOrderByNumberAndEmail(
    parsed.data.orderNumber,
    parsed.data.email
  );

  if (!order) {
    return { error: "No order found with those details." };
  }

  return { order };
}
