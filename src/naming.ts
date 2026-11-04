/**
 * Turns free-form input ("My App!", "./projects/my-app") into a valid,
 * unscoped npm package name: lowercase, `a-z0-9-` only, no leading dot or
 * dash, at most 214 characters.
 */
export function toSlug(input: string): string {
  const segments = input.trim().split(/[\\/]/).filter(Boolean);
  const lastSegment = segments.at(-1) ?? "";

  return lastSegment
    // Split accented letters into letter + combining mark, then drop the marks.
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 214);
}

/** "my-cool-app" → "My Cool App". */
export function toDisplayName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Returns an error message, or `undefined` when the name is a valid slug. */
export function validateSlug(slug: string): string | undefined {
  if (!slug) {
    return "Enter a name with at least one letter or digit.";
  }

  if (slug !== toSlug(slug)) {
    return "Use lowercase letters, digits and dashes only.";
  }

  if (["node_modules", "favicon.ico", "next", "react", "react-dom"].includes(slug)) {
    return `"${slug}" is reserved. Pick another name.`;
  }

  return undefined;
}

/** Returns an error message, or `undefined` when the port is usable. */
export function validatePort(value: string): string | undefined {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    return "Use a whole number between 1024 and 65535.";
  }

  return undefined;
}

/**
 * Display name and description are written into JSON, TypeScript string
 * literals, HTML and ICU messages, so characters with special meaning in any
 * of them are rejected instead of escaped per format.
 */
const UNSAFE_TEXT = /["`\\<>{}$\r\n]/;

/** Returns an error message, or `undefined` when the text is safe to embed. */
export function validateText(value: string, label: string, { required = true } = {}): string | undefined {
  if (required && !value.trim()) {
    return `Enter a ${label}.`;
  }

  if (UNSAFE_TEXT.test(value)) {
    return `The ${label} cannot contain double quotes, backticks, backslashes, braces, angle brackets, $ or line breaks.`;
  }

  if (value.length > 160) {
    return `Keep the ${label} under 160 characters.`;
  }

  return undefined;
}
