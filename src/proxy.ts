import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required so auth cookies stay valid across requests
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAccountPublic =
    pathname === "/account/login" ||
    pathname === "/account/forgot-password" ||
    pathname === "/account/reset-password";
  const isAccountProtected = pathname.startsWith("/account") && !isAccountPublic;

  // Signed-in users shouldn't see login again
  if (pathname === "/account/login" && user) {
    return NextResponse.redirect(new URL("/account/orders", request.url));
  }

  // Customer account: require sign-in for account pages
  if (isAccountProtected && !user) {
    return NextResponse.redirect(new URL("/account/login", request.url));
  }

  if (isAdminRoute && !isAdminLogin) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin/login?error=unauthorized", request.url)
      );
    }
  }

  if (isAdminLogin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|auth/callback|auth/recovery|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
