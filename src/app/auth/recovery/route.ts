import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Server-side recovery handler — sets auth cookies before reset-password page loads. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const failUrl = `${origin}/account/reset-password?error=expired`;
  const successUrl = `${origin}/account/reset-password`;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(failUrl);
    return NextResponse.redirect(successUrl);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (error) return NextResponse.redirect(failUrl);
    return NextResponse.redirect(successUrl);
  }

  return NextResponse.redirect(failUrl);
}
