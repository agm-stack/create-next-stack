import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

import type { Database } from "@/types/database";

export function createClient() {
  const { publishableKey, url } = getSupabaseConfig();

  return createBrowserClient<Database>(url, publishableKey);
}
