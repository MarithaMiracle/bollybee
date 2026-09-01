const BRAND = {
  plum: "#5c3d4a",
  blush: "#ede4e0",
  background: "#faf8f5",
  foreground: "#1a1816",
  muted: "#6b6560",
};

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app").replace(/\/$/, "");
}

function logoUrl() {
  return `${appUrl()}/brand/bollybee-mark.png`;
}

export function emailLayout(content: string, preheader = "") {
  const home = appUrl();
  const logo = logoUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bollybee</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.background};font-family:Georgia,'Times New Roman',serif;color:${BRAND.foreground};">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e5ddd4;">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #e5ddd4;">
              <a href="${home}" style="text-decoration:none;display:inline-block;">
                <img src="${logo}" alt="Bollybee" width="46" height="56" style="display:block;margin:0 auto 10px;border:0;outline:none;" />
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.04em;color:${BRAND.plum};">Bollybee</p>
              </a>
              <p style="margin:8px 0 0;font-family:Inter,Arial,sans-serif;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:${BRAND.muted};">Fragrance Lab</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;text-align:center;border-top:1px solid #e5ddd4;font-family:Inter,Arial,sans-serif;font-size:12px;color:${BRAND.muted};">
              <p style="margin:0 0 8px;">Soft luxury, bottled.</p>
              <p style="margin:0;"><a href="${home}" style="color:${BRAND.plum};">${home.replace(/^https?:\/\//, "")}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:28px 0 0;text-align:center;">
    <a href="${href}" style="display:inline-block;background:${BRAND.plum};color:#faf8f5;text-decoration:none;padding:14px 28px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;">${label}</a>
  </p>`;
}

export function welcomeEmail(firstName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  return {
    subject: "Welcome to Bollybee",
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Welcome, ${firstName}</h1>
      <p style="margin:0 0 16px;color:${BRAND.muted};">Thank you for joining Bollybee. Discover premium fragrances crafted for confidence, warmth, and modern Nigerian luxury.</p>
      <p style="margin:0;">Your account lets you track orders, save addresses, and build your wishlist.</p>
      ${button(`${appUrl}/shop`, "Shop fragrances")}
      ${button(`${appUrl}/sample-packs`, "Try sample packs")}`,
      `Welcome to Bollybee, ${firstName}`
    ),
  };
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  firstName: string;
  total: number;
  email: string;
  items: { productName: string; quantity: number; total: number }[];
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5ddd4;">${i.productName} × ${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5ddd4;text-align:right;">₦${i.total.toLocaleString()}</td>
        </tr>`
    )
    .join("");

  return {
    subject: `Order confirmed — ${order.orderNumber}`,
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Thank you, ${order.firstName}</h1>
      <p style="margin:0 0 20px;color:${BRAND.muted};">Your payment was successful. We're preparing your order <strong>${order.orderNumber}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0;font-weight:600;">Total paid</td>
          <td style="padding:12px 0;text-align:right;font-weight:600;">₦${order.total.toLocaleString()}</td>
        </tr>
      </table>
      ${button(`${appUrl}/track-order?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.email)}`, "Track your order")}`,
      `Order ${order.orderNumber} confirmed`
    ),
  };
}

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Being processed",
  PACKED: "Packed and ready",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export function orderStatusEmail(order: {
  orderNumber: string;
  firstName: string;
  email: string;
  fulfillmentStatus: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  const label = STATUS_LABELS[order.fulfillmentStatus] ?? order.fulfillmentStatus.replace(/_/g, " ");

  return {
    subject: `Order update — ${order.orderNumber}`,
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Order update</h1>
      <p style="margin:0 0 8px;">Hi ${order.firstName},</p>
      <p style="margin:0 0 16px;color:${BRAND.muted};">Your order <strong>${order.orderNumber}</strong> is now: <strong>${label}</strong>.</p>
      ${button(`${appUrl}/track-order?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.email)}`, "View order status")}`,
      `${order.orderNumber} — ${label}`
    ),
  };
}

export function newsletterWelcomeEmail() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  return {
    subject: "You're in the Bollybee Circle",
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Welcome to the Circle</h1>
      <p style="margin:0 0 16px;color:${BRAND.muted};">You'll be first to know about new releases, exclusive offers, and fragrance tips from Bollybee.</p>
      ${button(`${appUrl}/shop`, "Explore the collection")}`,
      "Welcome to the Bollybee Circle"
    ),
  };
}

export function contactAcknowledgementEmail(name: string) {
  return {
    subject: "We received your message — Bollybee",
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Message received</h1>
      <p style="margin:0 0 16px;">Dear ${name},</p>
      <p style="margin:0;color:${BRAND.muted};">Thank you for contacting Bollybee. Our team will reply by email as soon as we can.</p>`,
      "We received your message"
    ),
  };
}

export function adminNewOrderEmail(orderNumber: string, total: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  return {
    subject: `New order — ${orderNumber}`,
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">New order</h1>
      <p style="margin:0 0 16px;color:${BRAND.muted};">Order <strong>${orderNumber}</strong> for <strong>₦${total.toLocaleString()}</strong> was placed.</p>
      ${button(`${appUrl}/admin/orders`, "View in admin")}`,
      `New order ${orderNumber}`
    ),
  };
}

export function abandonedCartEmail(firstName: string, itemCount: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  return {
    subject: "You left something behind — Bollybee",
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Still thinking it over?</h1>
      <p style="margin:0 0 16px;">Hi ${firstName || "there"},</p>
      <p style="margin:0 0 16px;color:${BRAND.muted};">You have ${itemCount} item${itemCount !== 1 ? "s" : ""} waiting in your cart. Your selected fragrances are ready when you are.</p>
      ${button(`${appUrl}/cart`, "Complete your order")}`,
      "Your Bollybee cart is waiting"
    ),
  };
}

export function lowStockAlertEmail(items: { productName: string; variationName: string; stock: number }[]) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bollybee.vercel.app";
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5ddd4;">${i.productName} (${i.variationName})</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5ddd4;text-align:right;color:#b91c1c;">${i.stock} left</td>
        </tr>`
    )
    .join("");

  return {
    subject: "Low stock alert — Bollybee Admin",
    html: emailLayout(
      `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${BRAND.plum};">Low stock alert</h1>
      <p style="margin:0 0 16px;color:${BRAND.muted};">The following variations are running low:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows}</table>
      ${button(`${appUrl}/admin/products`, "Manage inventory")}`,
      "Low stock alert"
    ),
  };
}
