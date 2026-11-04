import "server-only";

import { ApiError } from "@/lib/api/errors";
import { HTTP_STATUS_CODES } from "@/lib/http";
import { Logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function isAuthOutage(error: { name?: string, status?: number }): boolean {
  return error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500;
}

/**
 * Resolves the signed-in user. A missing session is a 401, but an unreachable
 * auth service is a 503, so clients do not mistake an outage for a sign-out.
 */
export async function requireUser(supabase: ServerSupabaseClient) {
  let result: Awaited<ReturnType<ServerSupabaseClient["auth"]["getUser"]>>;

  try {
    result = await supabase.auth.getUser();
  } catch (error) {
    Logger.error("Auth lookup failed", { data: { error } });
    throw new ApiError(HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, "Authentication service unavailable");
  }

  if (result.error) {
    if (isAuthOutage(result.error)) {
      Logger.error("Auth lookup failed", { data: { error: result.error } });
      throw new ApiError(HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, "Authentication service unavailable");
    }

    throw ApiError.unauthorized();
  }

  if (!result.data.user) {
    throw ApiError.unauthorized();
  }

  return result.data.user;
}

/**
 * Route context for signed-in API routes:
 * `routeHandler({ createContext: createAuthenticatedContext }, ...)`.
 */
export async function createAuthenticatedContext() {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  return {
    supabase,
    user,
    userId: user.id,
  };
}
