type JsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges JSON objects into a new object. Objects merge recursively;
 * arrays and primitives from later patches replace earlier values.
 */
export function deepMerge<T extends JsonObject>(base: T, ...patches: JsonObject[]): T {
  const result: JsonObject = structuredClone(base);

  for (const patch of patches) {
    mergeInto(result, patch);
  }

  return result as T;
}

function mergeInto(target: JsonObject, patch: JsonObject) {
  for (const [key, value] of Object.entries(patch)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      mergeInto(target[key], value);
    } else {
      target[key] = structuredClone(value);
    }
  }
}

/** Returns a copy of `record` with keys sorted alphabetically. */
export function sortKeys<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

export function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
