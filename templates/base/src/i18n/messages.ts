// @if auth
import auth from "../../messages/en/auth.json";
// @endif
import common from "../../messages/en/common.json";
// @if legal
import legal from "../../messages/en/legal.json";
// @endif
import themePlayground from "../../messages/en/theme-playground.json";

// @if i18n
import type { AppLocale } from "./config";

// @endif
/**
 * Every file in messages/en is one namespace. Register new files here (and in
 * next.config.ts when the i18n module is enabled); messages.test.ts checks it.
 */
export const messages = {
  // @if auth
  auth,
  // @endif
  common,
  // @if legal
  legal,
  // @endif
  themePlayground,
} as const;
// @if i18n

const messagesByLocale: Record<AppLocale, typeof messages> = {
  en: messages,
};

export function getMessages(locale: AppLocale) {
  return messagesByLocale[locale];
}
// @endif
