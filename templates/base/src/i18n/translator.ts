// @if not i18n
import { messages } from "./messages";

/**
 * Minimal translator used when next-intl is not installed. It reads the same
 * `messages/en/*.json` files, supports nested keys and `{name}` interpolation,
 * and returns the full key when a message is missing (like next-intl).
 * Adding the i18n module replaces it with next-intl's translator.
 */
type Messages = typeof messages;

type NamespacePath<T> = {
  [K in keyof T & string]: T[K] extends string ? never : K | `${K}.${NamespacePath<T[K]>}`
}[keyof T & string];

export type Namespace = NamespacePath<Messages>;

export type TranslationValues = Record<string, string | number>;

export type Translator = (key: string, values?: TranslationValues) => string;

function lookup(path: string): unknown {
  return path.split(".").reduce<unknown>(
    (node, segment) => (node !== null && typeof node === "object" ? (node as Record<string, unknown>)[segment] : undefined),
    messages,
  );
}

export function createTranslator(namespace?: Namespace): Translator {
  const prefix = namespace ? `${namespace}.` : "";

  return (key, values) => {
    const message = lookup(`${prefix}${key}`);

    if (typeof message !== "string") {
      return `${prefix}${key}`;
    }

    if (!values) {
      return message;
    }

    return message.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
  };
}
// @endif
