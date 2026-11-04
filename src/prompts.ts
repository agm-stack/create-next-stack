import { basename, dirname, join } from "node:path";

import * as p from "@clack/prompts";
import color from "picocolors";

import { OPTIONAL_MODULES } from "./args.ts";
import { registry } from "./modules/registry.ts";
import { resolveModules } from "./modules/resolve.ts";
import { PACKAGE_MANAGERS } from "./modules/types.ts";
import {
  toDisplayName, toSlug, validatePort, validateSlug, validateText
} from "./naming.ts";

import type { CliArgs } from "./args.ts";
import type { OptionalModuleId, PackageManager, SupabaseTarget } from "./modules/types.ts";

export type Answers = {
  directory: string,
  slug: string,
  name: string,
  description: string,
  modules: OptionalModuleId[],
  pm: PackageManager,
  supabaseTarget: SupabaseTarget,
  port: number,
  git: boolean,
  install: boolean
};

export const DEFAULT_DESCRIPTION = "A Next.js app with strict TypeScript and Tailwind CSS.";

export function defaultModules(): OptionalModuleId[] {
  return OPTIONAL_MODULES.filter((id) => registry[id].default);
}

/** Prompts resolve to a cancel symbol on Ctrl+C; exit cleanly in that case. */
function exitIfCancelled<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled. Nothing was written.");
    process.exit(0);
  }

  return value as Exclude<T, symbol>;
}

function slugError(input: string | undefined): string | undefined {
  return validateSlug(toSlug(input ?? ""));
}

/**
 * Asks for anything not given as a flag. With `--yes` (or no TTY) it uses the
 * defaults instead and never prompts.
 */
export async function collectAnswers(args: CliArgs, detectedPm: PackageManager | undefined): Promise<Answers> {
  const interactive = !args.yes && Boolean(process.stdin.isTTY);
  const fallbackPm = args.pm ?? detectedPm ?? "pnpm";

  let directory = args.directory;

  if (!directory) {
    directory = interactive
      ? exitIfCancelled(await p.text({
        message: "Project name",
        placeholder: "my-app",
        defaultValue: "my-app",
        validate: (value) => slugError(value || "my-app"),
      }))
      : "my-app";
  }

  const slug = toSlug(directory);
  const directoryError = validateSlug(slug);
  const typedName = basename(directory.trim());
  // "Acme Notes" was typed as a display name: keep its casing as the default.
  const suggestedName = /[A-Z ]/.test(typedName) && !validateText(typedName, "name") ? typedName : toDisplayName(slug);

  // The folder always uses the package-safe name: "apps/Acme Notes" -> "apps/acme-notes".
  directory = join(dirname(directory.trim()), slug);

  if (directoryError) {
    throw new Error(`Invalid project name "${directory}": ${directoryError}`);
  }

  let name = args.name;

  if (name === undefined) {
    name = interactive
      ? exitIfCancelled(await p.text({
        message: "Display name (titles, metadata, emails)",
        initialValue: suggestedName,
        validate: (value) => validateText(value ?? "", "display name"),
      }))
      : suggestedName;
  }

  let description = args.description;

  if (description === undefined) {
    description = interactive
      ? exitIfCancelled(await p.text({
        message: "One-line description",
        initialValue: DEFAULT_DESCRIPTION,
        validate: (value) => validateText(value ?? "", "description"),
      }))
      : DEFAULT_DESCRIPTION;
  }

  for (const [value, label] of [[name, "display name"], [description, "description"]] as const) {
    const error = validateText(value, label);

    if (error) {
      throw new Error(error);
    }
  }

  let modules = args.modules;

  if (modules === undefined) {
    modules = interactive
      ? exitIfCancelled(await p.multiselect<OptionalModuleId>({
        message: "Modules (space to toggle, enter to confirm)",
        options: OPTIONAL_MODULES.map((id) => {
          const manifest = registry[id];
          const requires = manifest.requires.length > 0 ? ` Requires ${manifest.requires.join(", ")}.` : "";

          return { value: id, label: manifest.title, hint: `${manifest.description}${requires}` };
        }),
        initialValues: defaultModules(),
        required: false,
      }))
      : defaultModules();
  }

  let supabaseTarget = args.supabase;
  const usesSupabase = resolveModules(modules, registry).enabled.includes("supabase");

  if (supabaseTarget === undefined) {
    supabaseTarget = interactive && usesSupabase
      ? exitIfCancelled(await p.select<SupabaseTarget>({
        message: "Supabase for development (change later with SUPABASE_TARGET)",
        options: [
          { value: "remote", label: "Remote", hint: "A hosted project linked with the Supabase CLI. No Docker needed." },
          { value: "local", label: "Local", hint: "The Supabase Docker stack on your machine." },
        ],
        initialValue: "remote",
      }))
      : "remote";
  }

  let pm = args.pm;

  if (pm === undefined) {
    pm = interactive
      ? exitIfCancelled(await p.select<PackageManager>({
        message: "Package manager",
        options: PACKAGE_MANAGERS.map((value) => ({ value, label: value })),
        initialValue: fallbackPm,
      }))
      : fallbackPm;
  }

  let port = args.port;

  if (port === undefined) {
    port = interactive
      ? exitIfCancelled(await p.text({
        message: "Dev server port",
        initialValue: "3000",
        validate: (value) => validatePort(value ?? ""),
      }))
      : "3000";
  }

  const portError = validatePort(port);

  if (portError) {
    throw new Error(`Invalid port "${port}": ${portError}`);
  }

  let git = args.git;
  let install = args.install;

  if (interactive && args.git) {
    git = exitIfCancelled(await p.confirm({ message: "Initialize a git repository?", initialValue: true }));
  }

  if (interactive && args.install && !args.dryRun) {
    install = exitIfCancelled(await p.confirm({ message: `Install dependencies with ${pm}?`, initialValue: true }));
  }

  return {
    directory, slug, name, description, modules, pm, supabaseTarget, port: Number(port), git, install
  };
}

export function formatModuleList(ids: readonly string[]): string {
  return ids.length > 0 ? ids.map((id) => color.cyan(id)).join(", ") : color.dim("none");
}
