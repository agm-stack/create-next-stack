import { type NextRequest, NextResponse } from "next/server";

// @if auth
import { Logger } from "@/lib/logger";
import { createProxyClient } from "@/lib/supabase/proxy";
import { routePrefixes, routes } from "@/utils/routes";
// @else
import { routePrefixes } from "@/utils/routes";
// @endif

// @if auth
/** Routes reachable without a session. Everything else requires sign-in. */
function isPublicRoute(pathname: string) {
  return (
    pathname === routes.home ||
    pathname.startsWith(routes.signIn) ||
    pathname.startsWith(routes.signUp) ||
    pathname.startsWith(routePrefixes.authApi) ||
    // @if legal
    pathname.startsWith(routePrefixes.legal) ||
    // @endif
    (process.env.NODE_ENV === "development" && isDevOnlyRoute(pathname))
  );
}

// @endif
function isDevOnlyRoute(pathname: string) {
  return pathname.startsWith(routePrefixes.dev) || pathname.startsWith(routePrefixes.devApi);
}

// @if auth
export async function proxy(request: NextRequest) {
// @else
export function proxy(request: NextRequest) {
// @endif
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (process.env.NODE_ENV !== "development" && isDevOnlyRoute(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // @if auth
  const { getResponse, supabase } = createProxyClient(request);

  // If the auth service is unreachable, fall back to "signed out" instead of
  // failing every request: public pages keep working and protected ones redirect.
  let user: unknown = null;

  try {
    const { data } = await supabase.auth.getClaims();
    user = data?.claims ?? null;
  } catch (error) {
    Logger.error("Auth claims lookup failed in proxy", { data: { error } });
  }

  // Signed-in users visiting the home or auth pages go to the dashboard.
  if (user && (pathname === routes.home || pathname.startsWith(routes.signIn) || pathname.startsWith(routes.signUp))) {
    const url = nextUrl.clone();
    url.pathname = routes.dashboard;
    return NextResponse.redirect(url);
  }

  // Signed-out users on protected routes go to sign-in and come back afterwards.
  if (!user && !isPublicRoute(pathname)) {
    const url = nextUrl.clone();
    url.pathname = routes.signIn;
    url.search = "";
    const redirectTarget = `${pathname}${nextUrl.search}`;
    url.searchParams.set("redirectTo", redirectTarget);

    return NextResponse.redirect(url);
  }

  return getResponse();
  // @else
  // Add request-level rules here: redirects, headers, access checks.
  return NextResponse.next();
  // @endif
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|manifest.json|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
