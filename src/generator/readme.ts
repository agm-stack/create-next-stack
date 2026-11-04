import { registry } from "../modules/registry.ts";

import { getChecklists } from "./next-steps.ts";
import { DEFAULT_SUPABASE_TARGET, getPmCommands } from "./options.ts";

import type { ProjectOptions } from "./options.ts";
import type { ModuleId } from "../modules/types.ts";

const SCRIPT_DESCRIPTIONS: Record<string, string> = {
  dev: "Start the dev server",
  build: "Production build",
  start: "Serve the production build",
  lint: "ESLint (formatting included)",
  "lint:styles": "Stylelint for CSS",
  typecheck: "Generate route types and run `tsc`",
  test: "Run the Vitest suite once",
  "test:watch": "Vitest in watch mode",
  "db:link": "Link the hosted Supabase project",
  "db:start": "Start the local Supabase stack (Docker)",
  "db:stop": "Stop the local Supabase stack",
  "db:migrate": "Apply pending migrations to the `SUPABASE_TARGET` database",
  "db:reset": "Rebuild the local database from migrations (local target only)",
  "db:types": "Regenerate `src/types/database.ts` from the `SUPABASE_TARGET` database",
  "dev:vinext": "Dev server on the Cloudflare Workers runtime",
  "build:vinext": "Build for Cloudflare Workers",
  "start:vinext": "Serve the Workers build locally",
  "deploy:vinext": "Deploy to Cloudflare Workers",
};

function structure(modules: ReadonlySet<ModuleId>): string {
  const has = (id: ModuleId) => modules.has(id);
  const lines = [
    "src/",
    "  app/                 Routes and route groups (thin files)",
    has("auth") && "    (auth)/            Sign-in, sign-up and /api/auth/*",
    has("auth") && "    (app)/             Signed-in pages (dashboard)",
    has("auth") && "    (account)/         /api/account/* (preferences, deletion)",
    has("legal") && "    (legal)/           Terms, privacy and cookie policy",
    "    dev/               Development-only pages (theme playground)",
    "  components/          UI primitives (ui/), providers, layout",
    has("auth") || has("legal") ? "  features/            Feature folders: api/, components/, pages/" : false,
    "  hooks/               Cross-feature hooks",
    "  i18n/                Message registry" + (has("i18n") ? " and next-intl config" : ""),
    "  lib/                 api (route handler, rate limit), http, logger, storage" + (has("supabase") ? ", supabase" : ""),
    "  styles/              Tailwind entry and design tokens",
    "  proxy.ts             Request proxy" + (has("auth") ? ": session refresh and route protection" : ""),
    "messages/en/           Application copy, one file per namespace",
    has("supabase") && "supabase/              Local config, migrations" + (has("auth") ? " and email templates" : ""),
    "docs/agent-rules/      Conventions for humans and AI agents",
  ];

  return lines.filter(Boolean).join("\n");
}

export function renderReadme(options: ProjectOptions): string {
  const modules = new Set(options.modules);
  const manifests = options.modules.map((id) => registry[id]);
  const pm = getPmCommands(options.pm);
  const scripts = manifests.flatMap((manifest) => Object.keys(manifest.scripts ?? {})).filter((name) => name !== "prepare");
  const { launchSteps, nextSteps } = getChecklists(options, { needsInstall: true });

  const launch = launchSteps.length > 0
    ? ["## Before launch", launchSteps.map((step) => `- [ ] ${step}`).join("\n")]
    : [];

  const target = options.supabaseTarget ?? DEFAULT_SUPABASE_TARGET;
  const database = modules.has("supabase")
    ? [
      "## Database",
      [
        `The \`db:*\` scripts work against the database \`SUPABASE_TARGET\` points at, set in \`.env.local\`. This project starts with \`${target}\`:`,
        "",
        `- \`remote\`: the hosted project linked with \`${pm.run} db:link\`. No Docker needed.`,
        `- \`local\`: the Docker stack started with \`${pm.run} db:start\`, configured in \`supabase/config.toml\`.`,
        "",
        "Schema changes are SQL migrations in `supabase/migrations/`. After adding one:",
        "",
        `1. Apply it with \`${pm.run} db:migrate\`.`,
        `2. Regenerate \`src/types/database.ts\` with \`${pm.run} db:types\`. The output is formatted for you.`,
        "",
        `\`${pm.run} db:reset\` rebuilds the local database from scratch and refuses to touch the hosted one.`,
        "",
        "Browser code never queries tables directly: it calls `/api/...` routes, and server repositories map rows to DTOs.",
      ].join("\n"),
    ]
    : [];

  const sections = [
    `# ${options.name}`,
    options.description,
    "## Stack",
    manifests.filter((manifest) => manifest.stack).map((manifest) => `- ${manifest.stack}.`).join("\n"),
    "Tooling: ESLint, Stylelint, Vitest with Testing Library, Husky, lint-staged and commitlint.",
    "## Getting started",
    `Requires Node.js 24 or newer${options.pm === "npm" ? "" : ` and ${options.pm}`}.`
      + (modules.has("supabase") && target === "local" ? " The local Supabase stack needs Docker." : ""),
    nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    ...launch,
    "## Scripts",
    ["| Command | Purpose |", "| --- | --- |", ...scripts.map((name) => `| \`${pm.run} ${name}\` | ${SCRIPT_DESCRIPTIONS[name] ?? ""} |`)].join("\n"),
    "## Project structure",
    `\`\`\`text\n${structure(modules)}\n\`\`\``,
    "Feature folders follow the layout in [docs/agent-rules/project-architecture.md](docs/agent-rules/project-architecture.md).",
    ...database,
    "## Conventions",
    [
      "- Copy lives in `messages/en/*.json`, never hard-coded in components.",
      "- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/); a commit hook checks them.",
      "- [AGENTS.md](AGENTS.md) and `docs/agent-rules/` describe the conventions for AI coding agents; `CLAUDE.md` and `.cursor/rules/` point to them.",
    ].join("\n"),
  ];

  return `${sections.join("\n\n")}\n`;
}
