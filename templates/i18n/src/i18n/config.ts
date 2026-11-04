export const locales = ["en"] as const;
export const defaultLocale = locales[0];

export type AppLocale = (typeof locales)[number];
