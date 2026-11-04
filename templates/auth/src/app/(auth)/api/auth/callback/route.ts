import { NextResponse } from "next/server";

// @if legal
import { recordTermsAcceptance } from "@/features/legal/api/terms-acceptance";
// @endif
import { getRequestOrigin, sanitizeRedirectPath } from "@/lib/api/request";
import { Logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/utils/routes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const redirectTo = sanitizeRedirectPath(searchParams.get("redirectTo"), routes.home);

  if (code) {
    try {
      const supabase = await createClient();
      // @if legal
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      // @else
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      // @endif
      if (!error) {
        // @if legal
        if (data.user) {
          try {
            await recordTermsAcceptance(data.user.id);
          } catch (acceptanceError) {
            Logger.error("Failed to record Terms acceptance", { data: { error: acceptanceError } });
          }
        }

        // @endif
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    } catch (exchangeError) {
      // A network or provider failure must end on a real page, not a raw 500.
      Logger.error("Failed to exchange auth code for a session", { data: { error: exchangeError } });
    }
  }

  return NextResponse.redirect(`${origin}${routes.signIn}?error=auth_callback`);
}
