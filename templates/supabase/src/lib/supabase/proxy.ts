import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getSupabaseConfig } from "./config";

import type { NextRequest } from "next/server";

/**
 * Creates a Supabase client bound to a proxy request. Session cookies refreshed
 * by Supabase are written to both the request and the response, so the response
 * must be read through `getResponse()` after any auth call.
 */
export function createProxyClient(request: NextRequest) {
  const { publishableKey, url } = getSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, options, value }) => response.cookies.set(name, value, options));
      },
    },
  });

  return { getResponse: () => response, supabase };
}
