"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { validateCart, getShippingFee } from "@/lib/commerce/cart";
import { checkoutSchema, cartSchema } from "@/lib/validations";
import { calculateOrderTotal, nairaToKobo } from "@/lib/money";
import { generatePaymentReference, initializeTransaction } from "@/lib/paystack";
import type { CartItem, ValidatedCartItem } from "@/types";

export async function initializeCheckout(
  cartItems: CartItem[],
  checkoutData: Record<string, string>
) {
  const parsedCheckout = checkoutSchema.safeParse({
    firstName: checkoutData.firstName,
    lastName: checkoutData.lastName,
    email: checkoutData.email,
    phone: checkoutData.phone,
    shippingState: checkoutData.shippingState,
    shippingLga: checkoutData.shippingLga,
    shippingCity: checkoutData.shippingCity,
    shippingAddress: checkoutData.shippingAddress,
    shippingLandmark: checkoutData.shippingLandmark || undefined,
    shippingPostalCode: checkoutData.shippingPostalCode || undefined,
    customerNotes: checkoutData.customerNotes || undefined,
  });

  if (!parsedCheckout.success) {
    return { error: parsedCheckout.error.issues[0]?.message ?? "Invalid checkout data" };
  }

  const parsedCart = cartSchema.safeParse(cartItems);
  if (!parsedCart.success) {
    return { error: "Your cart is empty" };
  }

  const { items, subtotal, errors } = await validateCart(parsedCart.data);
  if (errors.length) return { error: errors.join(". ") };
  if (!items.length) return { error: "Unable to validate cart" };

  const shippingFee = await getShippingFee(
    parsedCheckout.data.shippingState,
    parsedCheckout.data.shippingLga
  );
  const total = calculateOrderTotal(subtotal, shippingFee, 0);

  const supabase = createServiceClient();

  const { createClient } = await import("@/lib/supabase/server");
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const orderNum = `BB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNum,
      user_id: user?.id ?? null,
      email: parsedCheckout.data.email,
      phone: parsedCheckout.data.phone,
      first_name: parsedCheckout.data.firstName,
      last_name: parsedCheckout.data.lastName,
      subtotal,
      shipping_fee: shippingFee,
      discount: 0,
      total,
      currency: "NGN",
      payment_status: "PENDING",
      fulfillment_status: "PENDING",
      shipping_state: parsedCheckout.data.shippingState,
      shipping_lga: parsedCheckout.data.shippingLga,
      shipping_city: parsedCheckout.data.shippingCity,
      shipping_address: parsedCheckout.data.shippingAddress,
      shipping_landmark: parsedCheckout.data.shippingLandmark ?? null,
      shipping_postal_code: parsedCheckout.data.shippingPostalCode ?? null,
      customer_notes: parsedCheckout.data.customerNotes ?? null,
    })
    .select("id, order_number, total")
    .single();

  if (orderError || !order) {
    return { error: "Unable to create order. Please try again." };
  }

  const orderItems = items.map((item: ValidatedCartItem) => ({
    order_id: order.id,
    product_id: item.isGiftSet ? null : item.productId,
    variation_id: item.isGiftSet ? null : item.variationId,
    product_name: item.productName,
    variation_name: item.variationName,
    sku: item.sku,
    unit_price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
  }));

  await supabase.from("order_items").insert(orderItems);

  const reference = generatePaymentReference();

  const { error: paymentError } = await supabase.from("payments").insert({
    order_id: order.id,
    provider: "PAYSTACK",
    reference,
    amount: total,
    currency: "NGN",
    status: "PENDING",
  });

  if (paymentError) {
    return { error: "Unable to initialize payment" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const paystack = await initializeTransaction({
      email: parsedCheckout.data.email,
      amountKobo: nairaToKobo(total),
      reference,
      callbackUrl: `${appUrl}/order/success?reference=${reference}`,
      metadata: { order_id: order.id, order_number: order.order_number },
    });

    return {
      success: true,
      authorizationUrl: paystack.authorization_url,
      reference,
      orderId: order.id,
      orderNumber: order.order_number,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Payment initialization failed",
    };
  }
}

export async function verifyAndFulfillOrder(reference: string) {
  const supabase = createServiceClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("*, orders(*)")
    .eq("reference", reference)
    .single();

  if (!payment) return { error: "Payment not found" };

  if (payment.status === "SUCCESSFUL") {
    return { success: true, order: payment.orders, alreadyProcessed: true };
  }

  const { verifyTransaction } = await import("@/lib/paystack");
  const verified = await verifyTransaction(reference);

  if (!verified || verified.status !== "success") {
    await supabase
      .from("payments")
      .update({ status: "FAILED", updated_at: new Date().toISOString() })
      .eq("reference", reference);
    return { error: "Payment verification failed" };
  }

  const order = payment.orders as { id: string; total: number; payment_status: string };
  const verifiedAmountNaira = verified.amount / 100;

  if (verifiedAmountNaira !== order.total || verified.currency !== "NGN") {
    return { error: "Payment amount mismatch" };
  }

  await supabase
    .from("payments")
    .update({
      status: "SUCCESSFUL",
      provider_transaction_id: String(verified.id),
      paid_at: verified.paid_at,
      metadata: verified.metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference)
    .eq("status", "PENDING");

  await supabase
    .from("orders")
    .update({
      payment_status: "SUCCESSFUL",
      fulfillment_status: "PAYMENT_CONFIRMED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("payment_status", "PENDING");

  try {
    await supabase.rpc("deduct_inventory_for_order", { p_order_id: order.id });
  } catch {
    // Stock may have changed — log in production
  }

  const { data: updatedOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", order.id)
    .single();

  return { success: true, order: updatedOrder };
}
