export const MODULE_IDS = ["base", "react-query", "i18n", "supabase", "auth", "legal", "cloudflare"] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

/** Modules the user can toggle. `base` is always on. */
export type OptionalModuleId = Exclude<ModuleId, "base">;

export const PACKAGE_MANAGERS = ["pnpm", "npm", "bun"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/**
 * Which Supabase the `db:*` scripts and the default environment use:
 * `remote` is the linked hosted project, `local` the Docker stack started by
 * the Supabase CLI. Generated projects can switch later with SUPABASE_TARGET.
 */
export const SUPABASE_TARGETS = ["remote", "local"] as const;

export type SupabaseTarget = (typeof SUPABASE_TARGETS)[number];

/**
 * A boolean expression over module ids, `pm:<name>` and `supabase:<target>`
 * atoms, for example `auth and not legal` or `supabase:local`. See
 * `src/generator/preprocess.ts`.
 */
export type Condition = string;

/** A checklist entry, optionally shown only when a condition holds. */
export type Step = string | { text: string, when: Condition };

export type EnvVar = {
  name: string,
  /** Value written to `.env.example`. Defaults to empty. */
  value?: string,
  /** One-line explanation written above the variable. */
  comment?: string,
  /** Server-only secret: grouped separately and never prefixed with NEXT_PUBLIC_. */
  server?: boolean,
  /** Read by development scripts only, never by the app. */
  tooling?: boolean,
  /** Only written when the condition holds. */
  when?: Condition
};

export type ModuleManifest = {
  id: ModuleId,
  title: string,
  /** One-line summary shown in the wizard and the README module table. */
  description: string,
  requires: ModuleId[],
  /** Selected by default in the wizard and with `--yes`. */
  default: boolean,
  /** Template files that are only written when the condition holds, relative to `templates/<id>/`. */
  conditionalFiles?: Record<string, Condition>,
  /** Target paths this module overwrites from an earlier module. */
  replaces?: string[],
  dependencies?: Record<string, string>,
  devDependencies?: Record<string, string>,
  /** package.json scripts. Placeholders are substituted. */
  scripts?: Record<string, string>,
  /** Merged into the generated tsconfig.json. */
  tsconfig?: Record<string, unknown>,
  env?: EnvVar[],
  /** Local setup before the dev server can start. Placeholders are substituted. */
  setupSteps?: Step[],
  /** Things to try once the dev server runs. Placeholders are substituted. */
  nextSteps?: Step[],
  /** Steps before going live: hosted services, reviews, deployment. Placeholders are substituted. */
  launchSteps?: Step[],
  /** Bullet for the README "Stack" section. */
  stack?: string
};
