#!/usr/bin/env node
/**
 * Send a test email via Resend. Uses .env.local, or pass --env=.env.vercel.prod
 * Usage: node scripts/test-email.mjs
 */
import { readFileSync, existsSync } from "fs";
import { Resend } from "resend";

const envFile = process.argv.find((a) => a.startsWith("--env="))?.slice(6) ?? ".env.local";

function loadEnv(path) {
  if (!existsSync(path)) {
    console.error(`❌ ${path} not found`);
    process.exit(1);
  }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[m[1].trim()] = val;
  }
}

loadEnv(envFile);

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Bollybee <onboarding@resend.dev>";
const testTo = process.env.RESEND_TEST_TO;

if (!apiKey) {
  console.error("❌ RESEND_API_KEY missing. Add to .env.local or Vercel env.");
  process.exit(1);
}

if (!testTo) {
  console.error("❌ RESEND_TEST_TO missing. Set to the inbox you check (Resend test mode).");
  process.exit(1);
}

const resend = new Resend(apiKey);
const recipient = from.includes("resend.dev") ? testTo : testTo;

console.log("From:", from);
console.log("To:", recipient, from.includes("resend.dev") ? "(test redirect)" : "");

const { data, error } = await resend.emails.send({
  from,
  to: recipient,
  subject: "Bollybee test email",
  html: "<p>If you see this, Resend is working.</p>",
});

if (error) {
  console.error("❌ Resend error:", error);
  process.exit(1);
}

console.log("✅ Sent. Message id:", data?.id);
console.log("Check inbox:", recipient);
