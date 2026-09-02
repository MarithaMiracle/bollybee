"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { validateCart, getShippingFee } from "@/lib/commerce/cart";
import { calculatePromoDiscount, incrementPromoUsage } from "@/lib/commerce/promo";
import { checkoutSchema, cartSchema } from "@/lib/validations";
import { calculateOrderTotal, nairaToKobo } from "@/lib/money";
import { generatePaymentReference, initializeTransaction } from "@/lib/paystack";
import {
  adminNewOrderEmail,
  orderConfirmationEmail,
  sendTemplatedEmail,
} from "@/lib/email";
import { markAbandonedCartRecovered } from "@/actions/abandoned-cart";
import type { CartItem, ValidatedCartItem } from "@/types";

export type CheckoutFormDefaults = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingState: string;
  shippingLga: string;
  shippingCity: string;
  shippingAddress: string;
  shippingLandmark: string;
  shippingPostalCode: string;
};

function splitFullName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

/** Prefill checkout from the signed-in user's profile and most recent order. */
export async function getCheckoutDefaults(): Promise<CheckoutFormDefaults | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: defaultAddress }, { data: lastOrder }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("saved_addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase
      .from("orders")
      .select(
        "first_name, last_name, email, phone, shipping_state, shipping_lga, shipping_city, shipping_address, shipping_landmark, shipping_postal_code"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profileName = splitFullName(profile?.full_name);
  const shipping = defaultAddress ?? lastOrder;

  return {
    firstName: defaultAddress?.first_name || lastOrder?.first_name || profileName.firstName,
    lastName: defaultAddress?.last_name || lastOrder?.last_name || profileName.lastName,
    email: lastOrder?.email || user.email || "",
    phone: defaultAddress?.phone || lastOrder?.phone || profile?.phone || "",
    shippingState: shipping?.shipping_state ?? "",
    shippingLga: shipping?.shipping_lga ?? "",
    shippingCity: shipping?.shipping_city ?? "",
    shippingAddress: shipping?.shipping_address ?? "",
    shippingLandmark: shipping?.shipping_landmark ?? "",
    shippingPostalCode: shipping?.shipping_postal_code ?? "",
  };
}

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

  const promoInput = checkoutData.promoCode?.trim();
  let discount = 0;
  let appliedPromo: string | null = null;
  if (promoInput) {
    const promo = await calculatePromoDiscount(promoInput, subtotal);
    if (promo.error) return { error: promo.error };
    discount = promo.result!.discount;
    appliedPromo = promo.result!.code;
  }

  const total = calculateOrderTotal(subtotal, shippingFee, discount);

  const supabase = createServiceClient();

  const { createClient } = await import("@/lib/supabase/server");
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (checkoutData.saveAddress === "true" && user) {
    await supabase.from("saved_addresses").insert({
      user_id: user.id,
      label: "Checkout",
      first_name: parsedCheckout.data.firstName,
      last_name: parsedCheckout.data.lastName,
      phone: parsedCheckout.data.phone,
      shipping_state: parsedCheckout.data.shippingState,
      shipping_lga: parsedCheckout.data.shippingLga,
      shipping_city: parsedCheckout.data.shippingCity,
      shipping_address: parsedCheckout.data.shippingAddress,
      shipping_landmark: parsedCheckout.data.shippingLandmark ?? null,
      shipping_postal_code: parsedCheckout.data.shippingPostalCode ?? null,
      is_default: false,
    });
  }

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
      discount,
      promo_code: appliedPromo,
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
      callbackUrl: `${appUrl}/order/success`,
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

export async function verifyAndFulfillOrder(rawReference: string) {
  const reference = rawReference.trim();
  if (!reference) return { error: "Payment reference is required" };

  const supabase = createServiceClient();

  async function findPayment(ref: string) {
    const { data } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("reference", ref)
      .maybeSingle();
    return data;
  }

  let payment = await findPayment(reference);

  // Paystack may normalize reference casing on redirect
  if (!payment) {
    payment = await findPayment(reference.toUpperCase());
  }
  if (!payment) {
    payment = await findPayment(reference.toLowerCase());
  }

  // Payment succeeded on Paystack but DB row missing — recover via Paystack metadata
  if (!payment) {
    const { verifyTransaction } = await import("@/lib/paystack");
    const verified = await verifyTransaction(reference);
    const orderId = verified?.metadata?.order_id;

    if (typeof orderId === "string") {
      const { data } = await supabase
        .from("payments")
        .select("*, orders(*)")
        .eq("order_id", orderId)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      payment = data;
    }
  }

  if (!payment) return { error: "Payment not found" };

  if (payment.status === "SUCCESSFUL") {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", payment.order_id)
      .single();
    return { success: true, order: existingOrder, alreadyProcessed: true };
  }

  const { verifyTransaction } = await import("@/lib/paystack");
  const verified = await verifyTransaction(payment.reference);

  if (!verified || verified.status !== "success") {
    await supabase
      .from("payments")
      .update({ status: "FAILED", updated_at: new Date().toISOString() })
      .eq("reference", payment.reference);
    return { error: "Payment verification failed" };
  }

  const order = payment.orders as { id: string; total: number; payment_status: string };
  const verifiedAmountNaira = Math.round(verified.amount) / 100;

  if (verifiedAmountNaira !== order.total || verified.currency !== "NGN") {
    return { error: "Payment amount mismatch" };
  }

  const { data: paymentRows } = await supabase
    .from("payments")
    .update({
      status: "SUCCESSFUL",
      provider_transaction_id: String(verified.id),
      paid_at: verified.paid_at,
      metadata: verified.metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", payment.reference)
    .eq("status", "PENDING")
    .select("id");

  // Webhook + success page can race — only fulfill once
  if (!paymentRows?.length) {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order.id)
      .single();
    return { success: true, order: existingOrder, alreadyProcessed: true };
  }

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

  if (updatedOrder) {
    const orderRow = updatedOrder as {
      order_number: string;
      first_name: string;
      email: string;
      subtotal: number;
      shipping_fee: number;
      discount: number;
      total: number;
      promo_code: string | null;
      order_items: { product_name: string; quantity: number; total: number }[];
    };

    if (orderRow.promo_code) {
      await incrementPromoUsage(orderRow.promo_code);
    }

    await markAbandonedCartRecovered(orderRow.email);

    await sendTemplatedEmail(
      orderRow.email,
      orderConfirmationEmail({
        orderNumber: orderRow.order_number,
        firstName: orderRow.first_name,
        total: orderRow.total,
        subtotal: orderRow.subtotal,
        shippingFee: orderRow.shipping_fee,
        discount: orderRow.discount,
        promoCode: orderRow.promo_code,
        email: orderRow.email,
        items: orderRow.order_items.map((i) => ({
          productName: i.product_name,
          quantity: i.quantity,
          total: i.total,
        })),
      })
    );

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendTemplatedEmail(
        adminEmail,
        adminNewOrderEmail(orderRow.order_number, orderRow.total)
      );
    }
  }

  return { success: true, order: updatedOrder };
}
