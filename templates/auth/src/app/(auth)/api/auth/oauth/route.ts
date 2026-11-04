import { NextResponse } from "next/server";

import { getRequestOrigin, sanitizeRedirectPath } from "@/lib/api/request";
import { HTTP_STATUS_CODES } from "@/lib/http";
import { Logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/utils/routes";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const redirectTo = sanitizeRedirectPath(url.searchParams.get("redirectTo"), routes.dashboard);
    const baseUrl = getRequestOrigin(request);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: HTTP_STATUS_CODES.SERVER_ERROR });
    }

    if (!data?.url) {
      return NextResponse.json({ error: "Missing OAuth redirect URL" }, { status: HTTP_STATUS_CODES.SERVER_ERROR });
    }

    // The frontend redirects the browser to this URL.
    return NextResponse.json({ url: data.url });
  } catch (err) {
    Logger.error("OAuth route failed", { data: { error: err } });

    return NextResponse.json({ error: "Unexpected error" }, { status: HTTP_STATUS_CODES.SERVER_ERROR });
  }
}
