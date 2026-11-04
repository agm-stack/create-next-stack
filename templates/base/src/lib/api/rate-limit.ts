import "server-only";

import { Logger } from "@/lib/logger";

import { ApiError } from "./errors";

/**
 * Rate limiting profiles for API routes (`routeHandler({ rateLimit })`).
// @if cloudflare
 * They map to Cloudflare Workers Rate Limiting bindings, which only support 10
 * or 60 second windows, so these are burst limits. Use database quotas or WAF
 * rules for hourly or daily ceilings.
 *
 * Keep the limits in sync with the bindings in cloudflare.config.ts.
// @else
 * No limiter is wired up yet: `getRateLimiter` below is the place to plug one
 * in (for example your hosting platform's limiter or a Redis-based one).
// @endif
 */
export const RATE_LIMIT_PROFILES = {
  // @if auth
  /** Sign-in, OTP and OAuth start: keyed by client IP. */
  auth: { binding: "RATE_LIMIT_AUTH", limit: 10, period: 60 },
  // @endif
  /** Reads and frequent updates. */
  standard: { binding: "RATE_LIMIT_STANDARD", limit: 120, period: 60 },
  /** Creates, deletes and other expensive writes. */
  write: { binding: "RATE_LIMIT_WRITE", limit: 20, period: 60 },
} as const;

export type RateLimitProfile = keyof typeof RATE_LIMIT_PROFILES;

type RateLimiter = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>
};

let warnedUnavailable = false;

// @if cloudflare
async function getRateLimiter(bindingName: string): Promise<RateLimiter | undefined> {
  try {
    // A variable specifier keeps bundlers from resolving the Workers-only
    // module, so Node (local dev, tests) simply fails and rate limiting is off.
    const specifier = "cloudflare:workers";
    const workers = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ specifier) as {
      env?: Record<string, unknown>
    };

    return workers.env?.[bindingName] as RateLimiter | undefined;
  } catch {
    return undefined;
  }
}
// @else
/** Returns the limiter for a profile. Until one is plugged in, requests are not rate limited. */
function getRateLimiter(_bindingName: string): Promise<RateLimiter | undefined> {
  return Promise.resolve(undefined);
}
// @endif

export function getClientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

/**
 * Throws a 429 `ApiError` when the key exceeded the profile's limit. Fails open
 * when the binding is unavailable so an infrastructure problem never blocks
 * legitimate users.
 */
export async function enforceRateLimit(
  profile: RateLimitProfile,
  key: string,
  routeName: string,
): Promise<void> {
  const { binding, period } = RATE_LIMIT_PROFILES[profile];
  const limiter = await getRateLimiter(binding);

  if (!limiter) {
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      Logger.warn("Rate limiter binding unavailable; requests are not rate limited", {
        data: { binding },
      });
    }

    return;
  }

  let success: boolean;

  try {
    ({ success } = await limiter.limit({ key: `${routeName}:${key}` }));
  } catch (error) {
    Logger.error("Rate limiter failed", { data: { error } });

    return;
  }

  if (!success) {
    Logger.warn("Rate limit exceeded", { data: { profile, route: routeName } });

    throw ApiError.tooManyRequests(period);
  }
}
