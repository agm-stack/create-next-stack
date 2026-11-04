import { browserHttpClient } from "@/lib/http/browser-http-client";

import type { ServiceOptions } from "@/types";

export function signInWithMagicLink(
  payload: { email: string, captchaToken?: string, redirectTo?: string },
  options?: ServiceOptions
) {
  const { captchaToken, email, redirectTo } = payload;
  const { httpClient = browserHttpClient, httpClientConfig } = options || {};
  return httpClient.post("/api/auth/otp", { captchaToken, email, redirectTo }, httpClientConfig);
}

export async function verifyEmailCode(
  payload: { email: string, token: string, redirectTo?: string },
  options?: ServiceOptions
) {
  const { email, redirectTo, token } = payload;
  const { httpClient = browserHttpClient, httpClientConfig } = options || {};
  const { data } = await httpClient.post<{ redirectTo: string }>(
    "/api/auth/otp/verify",
    { email, redirectTo, token },
    httpClientConfig
  );
  return data;
}

export async function signInWithGoogle(payload: { redirectTo?: string }, options?: ServiceOptions) {
  const { redirectTo } = payload;
  const { httpClient = browserHttpClient, httpClientConfig } = options || {};
  const { data } = await httpClient.get<{ url: string }>(
    `/api/auth/oauth?${redirectTo ? `redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
    httpClientConfig
  );
  return data;
}

export function signOut(options?: ServiceOptions) {
  const { httpClient = browserHttpClient, httpClientConfig } = options || {};
  return httpClient.post("/api/auth/sign-out", {}, httpClientConfig);
}
