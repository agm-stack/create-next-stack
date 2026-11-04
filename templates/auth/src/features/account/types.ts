import { z } from "zod";

/**
 * Preference keys the app knows, with the shape of each stored value. Rows
 * with other keys or values that fail their schema are ignored on read. Add a
 * key here to start storing it; no migration is needed.
 */
export const userPreferenceSchemas = {
  theme: z.enum(["light", "dark", "system"]),
} as const;

export type UserPreferenceKey = keyof typeof userPreferenceSchemas;

export type UserPreferences = {
  [K in UserPreferenceKey]?: z.infer<(typeof userPreferenceSchemas)[K]>
};

/** PATCH body: any subset of known preferences. */
export const updateUserPreferencesSchema = z.object(userPreferenceSchemas).partial().strict();

export type UpdateUserPreferencesRequest = z.infer<typeof updateUserPreferencesSchema>;
