import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/** Resend test sender only delivers to verified addresses — redirect when using onboarding@resend.dev */
export function isResendTestMode(): boolean {
  const from = process.env.EMAIL_FROM ?? "";
  return from.includes("resend.dev") && Boolean(process.env.RESEND_TEST_TO);
}

export function getResendTestInbox(): string | undefined {
  return isResendTestMode() ? process.env.RESEND_TEST_TO : undefined;
}

export function resolveEmailRecipient(to: string): string {
  const testTo = getResendTestInbox();
  if (testTo) return testTo;
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
      const msg = String(error.message ?? error);
      if (msg.includes("rate_limit") || msg.includes("quota")) {
        console.error("[email] Resend quota/rate limit hit — free tier is 100 emails/day");
      }
      return false;
    }
    console.info("[email] Sent", template.subject, "→", recipient, data?.id ?? "");
    return true;
  } catch (e) {
    console.error("[email] Send failed:", e);
    return false;
  }
}

export * from "./templates";
