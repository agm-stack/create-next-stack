import { pick } from "./versions.ts";

import type { ModuleId, ModuleManifest } from "./types.ts";

const base: ModuleManifest = {
  id: "base",
  title: "Base",
  description: "Next.js App Router, strict TypeScript, Tailwind CSS v4, shadcn/Base UI, Vitest and linting.",
  requires: [],
  default: true,
  stack: "Next.js App Router, React 19 with the React Compiler, strict TypeScript, Tailwind CSS v4 with semantic tokens, "
    + "shadcn components on Base UI, react-hook-form and zod",
  conditionalFiles: {
    "pnpm-workspace.yaml": "pm:pnpm",
  },
  dependencies: pick(
    "next",
    "react",
    "react-dom",
    "@base-ui/react",
    "@hookform/resolvers",
    "axios",
    "class-variance-authority",
    "clsx",
    "lucide-react",
    "react-hook-form",
    "tailwind-merge",
    "tw-animate-css",
    "zod",
  ),
  devDependencies: pick(
    "@agm-stack/eslint-config-next",
    "@commitlint/cli",
    "@commitlint/config-conventional",
    "@tailwindcss/postcss",
    "@testing-library/react",
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "babel-plugin-react-compiler",
    "eslint",
    "eslint-config-next",
    "eslint-plugin-tailwindcss",
    "husky",
    "jsdom",
    "lint-staged",
    "server-only",
    "shadcn",
    "stylelint",
    "stylelint-config-standard",
    "tailwindcss",
    "typescript",
    "vitest",
  ),
  scripts: {
    dev: "next dev --port __DEV_PORT__",
    build: "next build",
    start: "next start --port __DEV_PORT__",
    lint: "eslint",
    "lint:styles": "stylelint \"src/**/*.css\"",
    typecheck: "next typegen && tsc --noEmit",
    test: "vitest run",
    "test:watch": "vitest",
    prepare: "husky",
  },
  env: [
    {
      name: "NEXT_PUBLIC_SITE_URL",
      value: "http://localhost:__DEV_PORT__",
      comment: "Public origin of the site, used for metadata, robots.txt and the sitemap.",
    },
    {
      name: "NEXT_PUBLIC_APP_ENVIRONMENT",
      value: "local",
      comment: "local | preview | production",
    },
  ],
  nextSteps: [
    "Replace the placeholder mark in `src/app/icon.svg` and `src/components/ui/logo.tsx`, and tune the brand colors in `src/styles/tokens.css`.",
    "Preview the component system at http://localhost:__DEV_PORT__/dev/theme-playground (development only).",
  ],
};

const reactQuery: ModuleManifest = {
  id: "react-query",
  title: "React Query",
  description: "TanStack Query provider, query/mutation factories and devtools.",
  requires: [],
  default: true,
  stack: "TanStack Query with a per-request server client, `queryOptions` factories and lazy devtools",
  dependencies: pick("@tanstack/react-query", "@tanstack/react-query-devtools"),
  devDependencies: pick("@tanstack/eslint-plugin-query"),
};

const i18n: ModuleManifest = {
  id: "i18n",
  title: "i18n",
  description: "next-intl with typed messages and locale-aware formatting.",
  requires: [],
  default: true,
  stack: "next-intl with typed message namespaces and shared date and number formats",
  replaces: ["src/hooks/use-text.ts", "src/i18n/get-text.ts"],
  dependencies: pick("next-intl"),
};

const supabase: ModuleManifest = {
  id: "supabase",
  title: "Supabase",
  description: "Browser, server, proxy and admin clients, local config and typed database.",
  requires: [],
  default: true,
  stack: "Supabase SSR clients (browser, server, proxy, service role), local stack config and generated database types",
  conditionalFiles: {
    "messages/en/legal.json": "legal",
  },
  dependencies: pick("@supabase/ssr", "@supabase/supabase-js"),
  devDependencies: pick("supabase"),
  // db:types, db:migrate and db:reset go through scripts/supabase.mjs, which
  // targets the local stack or the linked project based on SUPABASE_TARGET.
  scripts: {
    "db:link": "supabase link",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:migrate": "node scripts/supabase.mjs migrate",
    "db:reset": "node scripts/supabase.mjs reset",
    "db:types": "node scripts/supabase.mjs types",
  },
  env: [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      value: "http://127.0.0.1:54321",
      comment: "Supabase API URL. `__PM_RUN__ db:start` prints the local one.",
      when: "supabase:local",
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      comment: "Supabase project URL, e.g. https://your-project-ref.supabase.co (Project Settings > API).",
      when: "supabase:remote",
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      comment: "Supabase publishable (anon) key.",
    },
    {
      name: "SUPABASE_SECRET_KEY",
      comment: "Supabase secret (service role) key. Server only: bypasses row level security.",
      server: true,
    },
    {
      name: "SUPABASE_TARGET",
      value: "__SUPABASE_TARGET__",
      comment: "remote | local: which Supabase the db:* scripts use. remote is the linked hosted project, local the Docker stack.",
      tooling: true,
    },
  ],
  setupSteps: [
    {
      when: "supabase:local",
      text: "Start the local Supabase stack with `__PM_RUN__ db:start` (needs Docker). It applies the migrations; "
        + "copy the printed API URL, publishable key and secret key into `.env.local`.",
    },
    {
      when: "supabase:remote",
      text: "Create a project at https://supabase.com and link it with `__PM_RUN__ db:link`, "
        + "then copy its URL, publishable key and secret key (Project Settings > API) into `.env.local`.",
    },
    {
      when: "supabase:remote and auth",
      text: "Apply the migrations to the linked project with `__PM_RUN__ db:migrate`.",
    },
  ],
  launchSteps: [
    {
      when: "supabase:local",
      text: "Create the hosted project at https://supabase.com, link it with `__PM_RUN__ db:link`, "
        + "set `SUPABASE_TARGET=remote` and push the migrations with `__PM_RUN__ db:migrate`.",
    },
    {
      when: "supabase:remote",
      text: "Consider a separate Supabase project for production, so development data and tests never touch it.",
    },
  ],
};

const auth: ModuleManifest = {
  id: "auth",
  title: "Auth",
  description: "Passwordless email link + code and Google sign-in, protected routes, dashboard and account deletion.",
  requires: ["supabase", "react-query", "i18n"],
  default: true,
  stack: "Supabase Auth with magic link plus one-time code and Google OAuth, proxy-protected routes, optional hCaptcha, user preferences and account deletion",
  conditionalFiles: {
    "messages/en/legal.json": "legal",
  },
  dependencies: pick("@hcaptcha/react-hcaptcha"),
  env: [
    {
      name: "NEXT_PUBLIC_CAPTCHA_ENABLED",
      value: "false",
      comment: "Show hCaptcha on sign-in. Enable it in Supabase Auth too.",
    },
    {
      name: "NEXT_PUBLIC_HCAPTCHA_SITEKEY",
      comment: "hCaptcha site key, required when the captcha is enabled.",
    },
  ],
  setupSteps: [
    {
      when: "supabase:remote",
      text: "In the Supabase dashboard, add `http://localhost:__DEV_PORT__/**` to the redirect URLs (Authentication > URL Configuration), "
        + "and paste the templates from `supabase/templates/` into the Magic Link and Confirm Signup emails, so they include the sign-in code.",
    },
  ],
  nextSteps: [
    {
      when: "supabase:local",
      text: "Sign in at http://localhost:__DEV_PORT__/sign-in. Local emails, with the sign-in link and code, "
        + "arrive in Mailpit at http://127.0.0.1:54324.",
    },
    {
      when: "supabase:remote",
      text: "Sign in at http://localhost:__DEV_PORT__/sign-in with a real email address. "
        + "Supabase's built-in email service is heavily rate limited; set up custom SMTP before inviting others.",
    },
  ],
  launchSteps: [
    "In the hosted Supabase project, set the Site URL to your production URL and add `<your site>/**` to the redirect URLs "
      + "(Authentication > URL Configuration).",
    {
      when: "supabase:local",
      text: "Paste the email templates from `supabase/templates/` into the hosted project's Magic Link and Confirm Signup emails.",
    },
    "Set up custom SMTP in Supabase (Authentication > Emails), since the built-in email service is only meant for testing.",
    "To enable Google sign-in, create an OAuth client in Google Cloud and enable the Google provider in Supabase "
      + "(locally: `[auth.external.google]` in `supabase/config.toml`).",
    "Optional: enable hCaptcha in Supabase Auth and set `NEXT_PUBLIC_CAPTCHA_ENABLED=true` with your site key.",
  ],
};

const legal: ModuleManifest = {
  id: "legal",
  title: "Legal",
  description: "Terms, privacy and cookie policy pages, consent manager and terms acceptance.",
  requires: ["i18n"],
  default: true,
  stack: "Terms of Service, Privacy Policy and Cookie Policy pages driven by messages, a cookie consent manager and versioned terms acceptance",
  conditionalFiles: {
    "messages/en/auth.json": "auth",
    "src/features/legal/api/terms-acceptance.ts": "auth",
    "supabase/migrations/20260101000000_create_terms_acceptances.sql": "auth",
  },
  dependencies: pick("js-cookie"),
  devDependencies: pick("@types/js-cookie"),
  launchSteps: [
    "Fill in the operator details in `src/features/legal/legal-data.ts` and review the policy copy in `messages/en/legal.json` "
      + "with a lawyer. It is a starting point, not legal advice.",
    "Mount `ConsentManager` in `src/app/layout.tsx` before adding analytics or marketing cookies.",
  ],
};

const cloudflare: ModuleManifest = {
  id: "cloudflare",
  title: "Cloudflare",
  description: "Deploy to Cloudflare Workers with vinext, plus Workers rate limiting.",
  requires: [],
  default: false,
  stack: "Cloudflare Workers deployment through vinext, with Workers rate-limit bindings for API routes",
  conditionalFiles: {
    "messages/en/legal.json": "legal",
  },
  dependencies: pick("vinext", "@vinext/cloudflare", "react-server-dom-webpack"),
  devDependencies: pick(
    "cf",
    "@cloudflare/vite-plugin",
    "@vitejs/plugin-react",
    "@vitejs/plugin-rsc",
    "oxc-transform-react",
    "vite",
  ),
  scripts: {
    "dev:vinext": "vite dev --port __DEV_PORT__",
    "build:vinext": "vite build",
    "start:vinext": "vinext start --port __DEV_PORT__",
    "deploy:vinext": "vinext-cloudflare deploy",
  },
  tsconfig: {
    include: [".cloudflare/types"],
  },
  launchSteps: [
    "Sign in to Cloudflare with `__PM_EXEC__ cf login`, add your production environment variables to the Worker, "
      + "then deploy with `__PM_RUN__ deploy:vinext`.",
    "Rate-limit namespaces in `cloudflare.config.ts` must be unique per Cloudflare account; "
      + "change them if another Worker already uses 1001 to 1003.",
  ],
};

export const registry: Record<ModuleId, ModuleManifest> = {
  base: base,
  "react-query": reactQuery,
  i18n: i18n,
  supabase: supabase,
  auth: auth,
  legal: legal,
  cloudflare: cloudflare,
};
