import { parseArgs } from "node:util";

import { MODULE_IDS, PACKAGE_MANAGERS, SUPABASE_TARGETS } from "./modules/types.ts";

import type { OptionalModuleId, PackageManager, SupabaseTarget } from "./modules/types.ts";

export type CliArgs = {
  directory?: string,
  name?: string,
  description?: string,
  modules?: OptionalModuleId[],
  pm?: PackageManager,
  supabase?: SupabaseTarget,
  port?: string,
  git: boolean,
  install: boolean,
  yes: boolean,
  dryRun: boolean,
  help: boolean,
  version: boolean
};

export const OPTIONAL_MODULES = MODULE_IDS.filter((id): id is OptionalModuleId => id !== "base");

export const HELP = `Usage: create-next-stack [directory] [options]

Scaffold a Next.js App Router project with strict TypeScript and Tailwind CSS,
plus the modules you choose. Run without options for an interactive wizard.

Options:
  --name <name>            Display name, e.g. "Acme Notes" (default: from directory)
  --description <text>     One-line description used in metadata and the README
  --modules <list>         Comma-separated modules: ${OPTIONAL_MODULES.join(", ")}
  --all                    Enable every module
  --minimal                Base project only, no optional modules
  --pm <name>              Package manager: ${PACKAGE_MANAGERS.join(", ")} (default: pnpm)
  --supabase <target>      Supabase the db scripts use: remote (linked hosted project, default)
                           or local (Docker stack). Switch later with SUPABASE_TARGET.
  --port <number>          Dev server port (default: 3000)
  --no-git                 Skip git init and the initial commit
  --no-install             Skip installing dependencies
  -y, --yes                Accept defaults for anything not passed as a flag
  --dry-run                List the files that would be written, write nothing
  -h, --help               Show this help
  -v, --version            Show the version

Examples:
  npm create @agm-stack/next-stack@latest
  pnpm create @agm-stack/next-stack my-app --modules auth,legal
  npx @agm-stack/create-next-stack my-app --all --pm npm --yes`;

function parseModules(value: string): OptionalModuleId[] {
  const ids = value.split(",").map((id) => id.trim()).filter(Boolean);
  const unknown = ids.filter((id) => !OPTIONAL_MODULES.includes(id as OptionalModuleId));

  if (unknown.length > 0) {
    throw new Error(`Unknown module(s): ${unknown.join(", ")}. Available: ${OPTIONAL_MODULES.join(", ")}.`);
  }

  return ids as OptionalModuleId[];
}

export function parseCliArgs(argv: string[]): CliArgs {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    allowNegative: true,
    options: {
      name: { type: "string" },
      description: { type: "string" },
      modules: { type: "string" },
      all: { type: "boolean", default: false },
      minimal: { type: "boolean", default: false },
      pm: { type: "string" },
      supabase: { type: "string" },
      port: { type: "string" },
      git: { type: "boolean", default: true },
      install: { type: "boolean", default: true },
      yes: { type: "boolean", short: "y", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });

  if (positionals.length > 1) {
    throw new Error(`Expected at most one directory, got: ${positionals.join(" ")}.`);
  }

  const presets = [values.all, values.minimal, values.modules !== undefined].filter(Boolean).length;

  if (presets > 1) {
    throw new Error("Use only one of --modules, --all and --minimal.");
  }

  if (values.pm !== undefined && !PACKAGE_MANAGERS.includes(values.pm as PackageManager)) {
    throw new Error(`Unknown package manager "${values.pm}". Use one of: ${PACKAGE_MANAGERS.join(", ")}.`);
  }

  if (values.supabase !== undefined && !SUPABASE_TARGETS.includes(values.supabase as SupabaseTarget)) {
    throw new Error(`Unknown Supabase target "${values.supabase}". Use one of: ${SUPABASE_TARGETS.join(", ")}.`);
  }

  let modules: OptionalModuleId[] | undefined;

  if (values.all) {
    modules = [...OPTIONAL_MODULES];
  } else if (values.minimal) {
    modules = [];
  } else if (values.modules !== undefined) {
    modules = parseModules(values.modules);
  }

  return {
    directory: positionals[0],
    name: values.name,
    description: values.description,
    modules,
    pm: values.pm as PackageManager | undefined,
    supabase: values.supabase as SupabaseTarget | undefined,
    port: values.port,
    git: values.git,
    install: values.install,
    yes: values.yes,
    dryRun: values["dry-run"],
    help: values.help,
    version: values.version,
  };
}
