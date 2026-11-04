import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

import type { Database } from "@/types/database";

/** Service-role client. Bypasses RLS: server-only, never expose to the browser. */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Missing SUPABASE_SECRET_KEY");

  return createClient<Database>(getSupabaseConfig().url, secret, {
    auth: { persistSession: false },
  });
}
