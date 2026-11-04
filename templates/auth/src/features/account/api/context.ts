import "server-only";

import { requireUser } from "@/features/auth/api/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { createUserPreferencesRepository } from "./preferences-db";

/**
 * Authenticated account context. Deleting a user and writing preferences need
 * the service role; every call is scoped by the signed-in user's id.
 */
export async function createAccountContext() {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  return {
    deleteUser: (userId: string) => createAdminClient().auth.admin.deleteUser(userId),
    preferences: createUserPreferencesRepository(createAdminClient()),
    supabase,
    user,
    userId: user.id,
  };
}
