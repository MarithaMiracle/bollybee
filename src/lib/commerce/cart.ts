import { createServiceClient } from "@/lib/supabase/admin";
import type { CartItem, CartValidationResult, ValidatedCartItem } from "@/types";
import { calculateLineTotal } from "@/lib/money";

function isGiftSetItem(item: CartItem) {
  return item.isGiftSet || item.variationId.startsWith("gift-set-");
}

export async function validateCart(
  cartItems: CartItem[]
): Promise<CartValidationResult> {
  const errors: string[] = [];
  const validated: ValidatedCartItem[] = [];

  if (!cartItems.length) {
    return { items: [], subtotal: 0, errors: ["Your cart is empty"] };
  }

  const supabase = createServiceClient();
  const regularItems = cartItems.filter((i) => !isGiftSetItem(i));
  const giftItems = cartItems.filter((i) => isGiftSetItem(i));

  let subtotal = 0;

  if (regularItems.length > 0) {
    const variationIds = regularItems.map((i) => i.variationId);
    const { data: variations, error } = await supabase
      .from("product_variations")
      .select(
        `*, products!inner(id, name, slug, active, product_images(image_url, sort_order))`
      )
      .in("id", variationIds);

    if (error || !variations) {
      return { items: [], subtotal: 0, errors: ["Unable to validate cart"] };
    }

    for (const cartItem of regularItems) {
      const variation = variations.find((v) => v.id === cartItem.variationId);
      if (!variation) {
        errors.push("A product in your cart is no longer available");
        continue;
      }

      const product = variation.products as {
        id: string;
        name: string;
        slug: string;
        active: boolean;
        product_images: { image_url: string; sort_order: number }[];
      };

      if (!product.active || !variation.active) {
        errors.push(`${product.name} is no longer available`);
        continue;
      }

      if (variation.stock_quantity < cartItem.quantity) {
        errors.push(
          `${product.name} (${variation.name}) — only ${variation.stock_quantity} left in stock`
        );
        continue;
      }

      const images = product.product_images?.sort(
        (a, b) => a.sort_order - b.sort_order
      );
      subtotal += calculateLineTotal(variation.price, cartItem.quantity);

      validated.push({
        ...cartItem,
        productName: product.name,
        variationName: variation.name,
        price: variation.price,
        sku: variation.sku,
        stock: variation.stock_quantity,
        slug: product.slug,
        imageUrl: images?.[0]?.image_url ?? null,
      });
    }
  }

  if (giftItems.length > 0) {
    const giftIds = giftItems.map((i) => i.productId);
    const { data: giftSets } = await supabase
      .from("gift_sets")
      .select("*")
      .in("id", giftIds)
      .eq("active", true);

    for (const cartItem of giftItems) {
      const gs = giftSets?.find((g) => g.id === cartItem.productId);
      if (!gs) {
        errors.push("A gift set in your cart is no longer available");
        continue;
      }
      subtotal += calculateLineTotal(gs.price, cartItem.quantity);
      validated.push({
        ...cartItem,
        productName: gs.name,
        variationName: "Gift Set",
        price: gs.price,
        sku: `GS-${gs.slug}`,
        stock: 999,
        slug: `gift-sets`,
        imageUrl: gs.image_url,
        isGiftSet: true,
      });
    }
  }

  return { items: validated, subtotal, errors };
}

export async function getShippingFee(
  stateName: string,
  lgaName: string
): Promise<number> {
  const supabase = createServiceClient();

  const { data: state } = await supabase
    .from("states")
    .select("id")
    .eq("name", stateName)
    .eq("active", true)
    .single();

  if (!state) return 4500;

  const { data: lga } = await supabase
    .from("lgas")
    .select("id")
    .eq("state_id", state.id)
    .eq("name", lgaName)
    .eq("active", true)
    .maybeSingle();

  if (lga) {
    const { data: lgaRate } = await supabase
      .from("shipping_rates")
      .select("price")
      .eq("state_id", state.id)
      .eq("lga_id", lga.id)
      .eq("active", true)
      .maybeSingle();

    if (lgaRate) return lgaRate.price;
  }

  const { data: stateRate } = await supabase
    .from("shipping_rates")
    .select("price")
    .eq("state_id", state.id)
    .is("lga_id", null)
    .eq("active", true)
    .maybeSingle();

  return stateRate?.price ?? 4500;
}
