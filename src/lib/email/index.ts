export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // Isolated email abstraction — configure Resend/SendGrid/etc. via env
  const provider = process.env.EMAIL_PROVIDER;

  if (!provider) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Email]", payload.subject, "→", payload.to);
    }
    return true;
  }

  // Future: integrate actual email provider
  return true;
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  firstName: string;
  total: number;
  items: { productName: string; quantity: number; total: number }[];
}): EmailPayload {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>₦${i.total.toLocaleString()}</td></tr>`
    )
    .join("");

  return {
    to: "",
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <h1>Thank you, ${order.firstName}!</h1>
      <p>Your Bollybee order <strong>${order.orderNumber}</strong> has been confirmed.</p>
      <table>${itemsHtml}</table>
      <p><strong>Total: ₦${order.total.toLocaleString()}</strong></p>
      <p>Track your order at bollybee.com/track-order</p>
    `,
  };
}

export function contactAcknowledgementEmail(name: string): EmailPayload {
  return {
    to: "",
    subject: "We received your message — Bollybee",
    html: `<p>Dear ${name},</p><p>Thank you for contacting Bollybee. We will respond shortly.</p>`,
  };
}

export function adminNewOrderEmail(orderNumber: string, total: number): EmailPayload {
  return {
    to: process.env.ADMIN_EMAIL || "",
    subject: `New Order — ${orderNumber}`,
    html: `<p>New order ${orderNumber} for ₦${total.toLocaleString()}</p>`,
  };
}
