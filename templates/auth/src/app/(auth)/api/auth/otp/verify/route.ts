import { NextResponse } from "next/server";
import { z } from "zod";

// @if legal
import { recordTermsAcceptance } from "@/features/legal/api/terms-acceptance";
// @endif
import { sanitizeRedirectPath } from "@/lib/api/request";
import { routeHandler } from "@/lib/api/route-handler";
import { HTTP_STATUS_CODES } from "@/lib/http";
import { Logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/utils/routes";

const schema = z.object({
  email: z.email(),
  // Supabase sends 6 digits by default; projects can raise the length to 10.
  token: z.string().regex(/^\d{6,10}$/),
  redirectTo: z.string().optional(),
});

// Signs in with the code from the sign-in email instead of its link. The code
// works in any browser; the link only works in the browser that requested it
// (PKCE).
export const POST = routeHandler({ rateLimit: "auth", schema }, async ({ data }) => {
  const { email, redirectTo, token } = data;
  const supabase = await createClient();
  // @if legal
  const { data: session, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  // @else
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  // @endif

  if (error) {
    // Logged without the code; a wrong or expired code is a normal user error.
    Logger.warn("Supabase OTP verification failed", { data: { code: error.code, status: error.status } });
    const errorStatus = error.status;
    const status = typeof errorStatus === "number"
      && errorStatus >= HTTP_STATUS_CODES.BAD_REQUEST
      && errorStatus < 500
      ? errorStatus
      : HTTP_STATUS_CODES.SERVER_ERROR;

    return NextResponse.json({ error: error.message }, { status });
  }

  // @if legal
  if (session.user) {
    try {
      await recordTermsAcceptance(session.user.id, "email-code");
    } catch (acceptanceError) {
      Logger.error("Failed to record Terms acceptance", { data: { error: acceptanceError } });
    }
  }

  // @endif
  return NextResponse.json({ redirectTo: sanitizeRedirectPath(redirectTo, routes.dashboard) });
});
