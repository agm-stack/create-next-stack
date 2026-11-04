/**
 * Dependency versions written into generated projects. This is the single
 * place to bump them; the e2e workflow installs and builds a project with
 * every module enabled, so a broken combination fails CI.
 */
export const versions = {
  // Framework
  next: "16.4.3",
  react: "19.3.1",
  "react-dom": "19.3.1",

  // UI
  "@base-ui/react": "^1.9.0",
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "lucide-react": "^1.61.0",
  "tailwind-merge": "^3.7.0",
  "tw-animate-css": "^1.4.0",

  // Forms, validation and HTTP
  "@hookform/resolvers": "^6.0.0",
  axios: "^1.20.0",
  "react-hook-form": "^7.91.0",
  zod: "^4.6.7",

  // Modules
  "@tanstack/react-query": "^5.105.0",
  "@tanstack/react-query-devtools": "^5.105.0",
  "@tanstack/eslint-plugin-query": "^5.105.0",
  "next-intl": "^4.14.9",
  "@supabase/ssr": "^0.12.7",
  "@supabase/supabase-js": "^2.118.0",
  supabase: "^2.122.0",
  "@hcaptcha/react-hcaptcha": "^2.2.0",
  "js-cookie": "^3.0.8",
  "@types/js-cookie": "^3.0.6",
  vinext: "^1.3.0",
  "@vinext/cloudflare": "^1.2.0",
  "react-server-dom-webpack": "^19.3.1",
  cf: "1.0.0-beta.21",
  "@cloudflare/vite-plugin": "2.0.0-beta.v.4",
  "@vitejs/plugin-react": "^6.1.2",
  "@vitejs/plugin-rsc": "^0.5.38",
  "oxc-transform-react": "^0.155.0",
  vite: "8.3.0",

  // Tooling
  "@agm-stack/eslint-config-next": "^0.1.0",
  "@commitlint/cli": "^21.2.4",
  "@commitlint/config-conventional": "^21.2.4",
  "@tailwindcss/postcss": "^4.3.3",
  "@testing-library/react": "^16.3.3",
  "@types/node": "^24.19.2",
  "@types/react": "^19.2.18",
  "@types/react-dom": "^19.2.7",
  "babel-plugin-react-compiler": "1.0.0",
  eslint: "^9.39.5",
  "eslint-config-next": "16.4.3",
  "eslint-plugin-tailwindcss": "^4.4.0",
  husky: "^9.1.7",
  jsdom: "^30.1.3",
  "lint-staged": "^17.6.0",
  "server-only": "^0.0.1",
  shadcn: "^4.22.1",
  stylelint: "^17.16.0",
  "stylelint-config-standard": "^40.0.0",
  tailwindcss: "^4.3.3",
  typescript: "^5.9.3",
  vitest: "^5.0.5",
} as const;

export type PackageName = keyof typeof versions;

/** Picks `{ name: version }` entries from the table. */
export function pick(...names: PackageName[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, versions[name]]));
}

/** Cloudflare Workers compatibility date for new projects. */
export const CLOUDFLARE_COMPATIBILITY_DATE = "2026-10-26";

/** Package manager versions pinned in `packageManager` (corepack). */
export const PACKAGE_MANAGER_VERSIONS = {
  pnpm: "11.10.0",
} as const;
