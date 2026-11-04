import "server-only";

import { userPreferenceSchemas } from "../types";

import type { UserPreferenceKey, UserPreferences } from "../types";
import type { Database, Json } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export class UserPreferencesRepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "UserPreferencesRepositoryError";
  }
}

function isPreferenceKey(key: string): key is UserPreferenceKey {
  return Object.hasOwn(userPreferenceSchemas, key);
}

/** Keeps only known keys whose stored value still matches its schema. */
export function parseUserPreferences(rows: readonly { key: string, value: Json }[]): UserPreferences {
  const preferences: Record<string, unknown> = {};

  for (const row of rows) {
    if (!isPreferenceKey(row.key)) {
      continue;
    }

    const parsed = userPreferenceSchemas[row.key].safeParse(row.value);

    if (parsed.success) {
      preferences[row.key] = parsed.data;
    }
  }

  return preferences as UserPreferences;
}

/**
 * Server-only access to `user_preferences`. Browser roles can only read their
 * own rows, so writes go through the service role and always scope by userId.
 */
export function createUserPreferencesRepository(client: SupabaseClient<Database>) {
  return {
    async list(userId: string): Promise<UserPreferences> {
      const { data, error } = await client
        .from("user_preferences")
        .select("key, value")
        .eq("user_id", userId);

      if (error) {
        throw new UserPreferencesRepositoryError("Unable to load preferences", error);
      }

      return parseUserPreferences(data);
    },

    /** Upserts every given key. Values must already be validated. */
    async update(userId: string, preferences: UserPreferences): Promise<void> {
      const rows = Object.entries(preferences)
        .filter(([key, value]) => isPreferenceKey(key) && value !== undefined)
        .map(([key, value]) => ({ key, user_id: userId, value: value as Json }));

      if (rows.length === 0) {
        return;
      }

      const { error } = await client
        .from("user_preferences")
        .upsert(rows, { onConflict: "user_id,key" });

      if (error) {
        throw new UserPreferencesRepositoryError("Unable to save preferences", error);
      }
    },
  };
}

export type UserPreferencesRepository = ReturnType<typeof createUserPreferencesRepository>;
