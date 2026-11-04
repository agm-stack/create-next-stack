import { NextResponse } from "next/server";
import { z } from "zod";

import { appConfig } from "@/config";
import { routeHandler } from "@/lib/api/route-handler";
import { HTTP_STATUS_CODES } from "@/lib/http";
import { Logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email(),
  captchaToken: appConfig.captcha.enabled
    ? z.string().min(1)
    : z.string().optional(),
  redirectTo: z.string().optional(),
});

export const POST = routeHandler({ rateLimit: "auth", schema }, async ({ context, data }) => {
  const { captchaToken, email, redirectTo } = data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      ...(appConfig.captcha.enabled && captchaToken ? { captchaToken } : {}),
      emailRedirectTo: `${context.baseUrl}/api/auth/callback${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
    },
  });

  if (error) {
    Logger.error("Supabase OTP request failed", { data: { error } });
    const errorStatus = error.status;
    const status = typeof errorStatus === "number"
      && errorStatus >= HTTP_STATUS_CODES.BAD_REQUEST
      && errorStatus < 500
      ? errorStatus
      : HTTP_STATUS_CODES.SERVER_ERROR;

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ message: "Magic link sent", code: HTTP_STATUS_CODES.SUCCESS });
});
