import type { locales } from "./config";
import type { formats } from "./formats";
import type { messages } from "./messages";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module "next-intl" {
  interface AppConfig {
    Formats: typeof formats,
    Locale: (typeof locales)[number],
    Messages: typeof messages
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */
