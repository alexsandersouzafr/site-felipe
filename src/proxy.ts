import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { resolveAdminAccess } from "@/lib/admin-access";
import { updateSession } from "@/lib/supabase/proxy";

import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLocaleRoute =
    pathname === "/" || /^\/(pt|en|es)(\/|$)/.test(pathname);

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return isLocaleRoute ? handleI18nRouting(request) : NextResponse.next();
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = Boolean(profile?.is_admin);
  }

  const access = resolveAdminAccess({
    pathname,
    isAuthenticated: Boolean(user),
    isAdmin,
  });

  if (access.action === "redirect") {
    const redirectResponse = NextResponse.redirect(
      new URL(access.to, request.url),
    );

    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    return redirectResponse;
  }

  if (isLocaleRoute) {
    return handleI18nRouting(request);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/", "/(pt|en|es)/:path*", "/admin/:path*"],
};
