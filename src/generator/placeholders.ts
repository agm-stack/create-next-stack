import { TemplateError } from "./preprocess.ts";

export const PLACEHOLDER_KEYS = [
  "APP_NAME",
  "APP_SLUG",
  "APP_DESCRIPTION",
  "DEV_PORT",
  "PM_RUN",
  "PM_EXEC",
  "PM_INSTALL",
  "PM_DLX",
  "YEAR",
  "TODAY",
  "CF_COMPAT_DATE",
  "SUPABASE_TARGET",
] as const;

export type PlaceholderKey = (typeof PLACEHOLDER_KEYS)[number];

export type Placeholders = Record<PlaceholderKey, string>;

const PLACEHOLDER = /__([A-Z][A-Z0-9_]*[A-Z0-9])__/g;

const KNOWN = new Set<string>(PLACEHOLDER_KEYS);

/**
 * Replaces `__KEY__` tokens. Any other all-caps `__X__` token is a typo and
 * fails generation. Mixed-case identifiers such as `__InternalSupabase` are not
 * matched by the pattern.
 */
export function substitute(source: string, values: Placeholders, file: string): string {
  return source.replace(PLACEHOLDER, (token, key: string, offset: number) => {
    if (!KNOWN.has(key)) {
      const line = source.slice(0, offset).split("\n").length;
      throw new TemplateError(file, line, `Unknown placeholder ${token}`);
    }

    return values[key as PlaceholderKey];
  });
}

export function collectPlaceholders(source: string): string[] {
  return [...source.matchAll(PLACEHOLDER)].map((match) => match[1] ?? "");
}
