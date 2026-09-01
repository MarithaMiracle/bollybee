import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/** Resend test sender only delivers to verified addresses — redirect when using onboarding@resend.dev */
export function resolveEmailRecipient(to: string): string {
  const from = process.env.EMAIL_FROM ?? "";
  const testTo = process.env.RESEND_TEST_TO;
  if (testTo && from.includes("resend.dev")) return testTo;
  return to;
}

export async function sendTemplatedEmail(
  to: string,
  template: { subject: string; html: string }
): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipped:", template.subject);
    return false;
  }

  const from = process.env.EMAIL_FROM || "Bollybee <onboarding@resend.dev>";
  const recipient = resolveEmailRecipient(to);

  try {
    const { data, error } = await client.emails.send({
      from,
      to: recipient,
      subject: template.subject,
      html: template.html,
    });
    if (error) {
      console.error("[email] Resend error:", JSON.stringify(error));
      return false;
    }
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] Sent", template.subject, "→", recipient, data?.id ?? "");
    }
    return true;
  } catch (e) {
    console.error("[email] Send failed:", e);
    return false;
  }
}

export * from "./templates";
