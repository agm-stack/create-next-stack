import { CLOUDFLARE_COMPATIBILITY_DATE } from "../modules/versions.ts";

import type { Placeholders } from "./placeholders.ts";
import type { PreprocessContext } from "./preprocess.ts";
import type { ModuleId, PackageManager, SupabaseTarget } from "../modules/types.ts";

export type ProjectOptions = {
  /** Display name, e.g. "Acme Notes". */
  name: string,
  /** npm package name and folder-safe identifier, e.g. "acme-notes". */
  slug: string,
  description: string,
  pm: PackageManager,
  port: number,
  /** Resolved modules in canonical order, including `base`. */
  modules: ModuleId[],
  /** Which Supabase the db scripts target by default. Defaults to `remote`. */
  supabaseTarget?: SupabaseTarget
};

export const DEFAULT_SUPABASE_TARGET: SupabaseTarget = "remote";

/** Condition context for directives, conditional files, env vars and steps. */
export function getContext(options: ProjectOptions): PreprocessContext {
  return {
    modules: new Set(options.modules),
    pm: options.pm,
    supabaseTarget: options.supabaseTarget ?? DEFAULT_SUPABASE_TARGET,
  };
}

const PM_COMMANDS: Record<PackageManager, { run: string, exec: string, install: string, dlx: string }> = {
  pnpm: { run: "pnpm", exec: "pnpm exec", install: "pnpm install", dlx: "pnpm dlx" },
  npm: { run: "npm run", exec: "npx", install: "npm install", dlx: "npx" },
  bun: { run: "bun run", exec: "bunx", install: "bun install", dlx: "bunx" },
};

export function getPmCommands(pm: PackageManager) {
  return PM_COMMANDS[pm];
}

export function getPlaceholders(options: ProjectOptions, now = new Date()): Placeholders {
  const commands = getPmCommands(options.pm);

  return {
    APP_NAME: options.name,
    APP_SLUG: options.slug,
    APP_DESCRIPTION: options.description,
    DEV_PORT: String(options.port),
    PM_RUN: commands.run,
    PM_EXEC: commands.exec,
    PM_INSTALL: commands.install,
    PM_DLX: commands.dlx,
    YEAR: String(now.getFullYear()),
    TODAY: now.toISOString().slice(0, 10),
    CF_COMPAT_DATE: CLOUDFLARE_COMPATIBILITY_DATE,
    SUPABASE_TARGET: options.supabaseTarget ?? DEFAULT_SUPABASE_TARGET,
  };
}
