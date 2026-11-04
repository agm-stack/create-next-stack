import { appConfig } from "@/config";

/**
 * Returns the public Supabase settings, failing fast with a clear message when
 * they are missing instead of surfacing an obscure client error later.
 */
export function getSupabaseConfig() {
  const { publishableKey, url } = appConfig.supabase;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase configuration: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { publishableKey, url };
}
