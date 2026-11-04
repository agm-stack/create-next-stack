# @agm-stack/create-next-stack

[![npm version](https://img.shields.io/npm/v/@agm-stack/create-next-stack.svg)](https://www.npmjs.com/package/@agm-stack/create-next-stack)
[![CI](https://github.com/agm-stack/create-next-stack/actions/workflows/ci.yml/badge.svg)](https://github.com/agm-stack/create-next-stack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Scaffold a production-ready **Next.js App Router** project with strict
TypeScript, Tailwind CSS v4 and a shadcn/Base UI component system. Add only
the modules you need: **Supabase auth**, **legal pages**, **React Query**,
**i18n** and **Cloudflare Workers** deployment.

```bash
npm create @agm-stack/next-stack@latest
```

It gives every new project the same proven structure: feature folders, a
typed API route handler, design tokens, agent instructions and a strict lint
setup. Every module combination is linted,
type-checked, tested and built in CI.

## Contents

- [Quick start](#quick-start)
- [What you get](#what-you-get)
- [Modules](#modules)
- [CLI options](#cli-options)
- [Generated project](#generated-project)
- [How the templates work](#how-the-templates-work)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)

## Quick start

Run it with your package manager of choice and answer the prompts:

```bash
pnpm create @agm-stack/next-stack
```

```bash
npm create @agm-stack/next-stack@latest
```

```bash
bunx @agm-stack/create-next-stack
```

```text
┌   create-next-stack
│
◇  Project name
│  acme-notes
│
◇  Display name (titles, metadata, emails)
│  Acme Notes
│
◇  One-line description
│  Notes for teams that move fast.
│
◇  Modules (space to toggle, enter to confirm)
│  React Query, i18n, Supabase, Auth, Legal
│
◇  Package manager
│  pnpm
│
◇  Dev server port
│  3000
│
◇  Project ──────────────────────────────────────────────╮
│                                                         │
│  Directory   acme-notes                                 │
│  Package     acme-notes                                 │
│  Name        Acme Notes                                 │
│  Modules     react-query, i18n, supabase, auth, legal   │
│  Tooling     pnpm, port 3000                            │
│                                                         │
├─────────────────────────────────────────────────────────╯
```

The CLI writes the project, runs `git init`, installs dependencies and makes
an initial commit. It then prints two checklists, which are also written to
the generated `README.md`:

- **Next steps** get the project running locally: environment variables, the
  local Supabase stack, the dev server and a first sign-in.
- **Before launch** covers going live: the hosted Supabase project, auth
  redirect URLs and email templates, Google OAuth, legal details and
  deployment.

Skip the prompts with flags:

```bash
pnpm create @agm-stack/next-stack acme-notes --modules auth,legal --yes
```

## What you get

Every project, with or without modules:

- **Next.js 16 App Router** with React 19, the React Compiler and a request
  proxy (`src/proxy.ts`).
- **Strict TypeScript** with the `@/*` alias and typed routes.
- **Tailwind CSS v4**, configured in CSS, with semantic light and dark tokens
  in `src/styles/tokens.css`.
- **shadcn components on Base UI** (button, dialog, form fields, select,
  tabs, toast, tooltip and more), plus a theme playground at
  `/dev/theme-playground`.
- **Forms** with react-hook-form and zod.
- **API route handler** (`routeHandler`) with zod body validation, body size
  limits, typed errors and pluggable rate limiting.
- **HTTP client** on axios with retries, a loop guard and error categories.
- **Copy in `messages/`**, read through `useText` and `getText`, so adding
  i18n later does not change call sites.
- **Quality tooling**: ESLint with
  [`@agm-stack/eslint-config-next`](https://github.com/agm-stack/eslint-config-next),
  Stylelint, Vitest with Testing Library, Husky, lint-staged and commitlint
  with Conventional Commits.
- **Agent instructions**: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules` and
  `docs/agent-rules/`, including the feature-folder conventions.

## Modules

| Module | Adds | Requires | Default |
| --- | --- | --- | --- |
| `react-query` | TanStack Query provider, per-request server client, `queryOptions` and `mutationOptions` factories, lazy devtools | none | yes |
| `i18n` | next-intl with typed message namespaces and shared formats; `useText` and `getText` become next-intl aliases | none | yes |
| `supabase` | Browser, server, proxy and service-role clients, local `supabase/config.toml`, migrations folder, generated database types and `db:*` scripts | none | yes |
| `auth` | Passwordless email link plus one-time code, Google OAuth, optional hCaptcha, proxy-protected routes, a dashboard, user preferences and account deletion | `supabase`, `react-query`, `i18n` | yes |
| `legal` | Terms, Privacy and Cookie Policy pages driven by messages, a cookie consent manager, and versioned terms acceptance when `auth` is on | `i18n` | yes |
| `cloudflare` | Cloudflare Workers deployment through vinext, plus Workers rate-limit bindings for API routes | none | no |

### Remote or local Supabase

With the `supabase` module, the wizard asks which database you develop
against. Your answer becomes `SUPABASE_TARGET` in `.env.example`, and you can
switch at any time by changing it in `.env.local`:

| Target | Develop against | `db:types` | `db:migrate` | `db:reset` |
| --- | --- | --- | --- | --- |
| `remote` (default) | A hosted project linked with `db:link`. No Docker. | from the linked project | `supabase db push` | refuses, to protect hosted data |
| `local` | The Docker stack from `db:start`, with Mailpit for auth emails | from the local stack | `supabase migration up` | rebuilds the local database |

The generated `scripts/supabase.mjs` reads the target, runs the right Supabase
CLI command and formats the regenerated types. The checklists adapt too: for
`remote`, they include adding `localhost` to the hosted project's redirect
URLs; for `local`, they include moving to a hosted project before launch.

Required modules are added automatically, and the CLI tells you which ones it
added and why. Modules adapt to each other: for example, the privacy policy
lists Supabase, Cloudflare, Google and hCaptcha as processors only when those
modules are enabled, and sign-in records terms acceptance only when `legal` is
on.

## CLI options

```text
create-next-stack [directory] [options]
```

| Option | Description |
| --- | --- |
| `[directory]` | Project folder. Its last segment becomes the package name, so `apps/Acme Notes` becomes `acme-notes`. |
| `--name <name>` | Display name for titles, metadata, emails and legal pages. Defaults to the directory in title case. |
| `--description <text>` | One-line description used in metadata, the README and `AGENTS.md`. |
| `--modules <list>` | Comma-separated modules, for example `auth,legal`. |
| `--all` | Enable every module. |
| `--minimal` | Base project only. |
| `--pm <name>` | `pnpm` (default), `npm` or `bun`. Defaults to the manager that ran the command. |
| `--supabase <target>` | `remote` (default) or `local`. See [Remote or local Supabase](#remote-or-local-supabase). |
| `--port <number>` | Dev server port (default `3000`). |
| `--no-git` | Skip `git init` and the initial commit. |
| `--no-install` | Skip installing dependencies. |
| `-y, --yes` | Use defaults for anything not passed as a flag. |
| `--dry-run` | List the files that would be written. |

The name you enter is used in several places. The package name (`acme-notes`)
becomes the folder, `package.json` name, Supabase `project_id`, Cloudflare
Worker name and storage key prefix. The display name (`Acme Notes`) appears in
page titles, the web manifest, the logo wordmark, auth emails, legal pages and
`AGENTS.md`.

## Generated project

With every module enabled:

```text
src/
  app/
    (auth)/            Sign-in, sign-up and /api/auth/*
    (app)/             Signed-in pages (dashboard)
    (account)/         /api/account/* (preferences, deletion)
    (legal)/           Terms, privacy and cookie policy
    dev/               Development-only pages (theme playground)
  components/          UI primitives (ui/), providers, layout
  features/            Feature folders: api/, components/, pages/
  hooks/  i18n/  lib/  styles/  types/  utils/
  proxy.ts             Session refresh and route protection
messages/en/           Application copy, one file per namespace
supabase/              Local config, migrations and email templates
docs/agent-rules/      Conventions for humans and AI agents
```

Features follow one layout, documented in the generated
`docs/agent-rules/project-architecture.md`:

```text
src/features/<feature>/
  api/service.ts      Browser HTTP calls
  api/queries.ts      queryOptions factories and query hooks
  api/mutations.ts    mutationOptions factories and mutation hooks
  api/context.ts      Server route context (server-only)
  api/db.ts           Server repository: rows to DTOs (server-only)
  components/         Feature UI
  pages/<name>.tsx    Page components; src/app route files re-export them
  types.ts            Feature types
```

## How the templates work

Templates live in [`templates/<module>/`](templates), mirroring the paths
they are written to. Generation runs four steps:

1. **Collect.** Each enabled module contributes its files, in a fixed order.
   A module may overwrite an earlier module's file only if its manifest lists
   it under `replaces`.
2. **Preprocess.** Files shared by several modules use line directives in
   comments, so they stay valid, lintable source:

   ```ts
   export const routes = {
     home: "/",
     // @if auth
     signIn: "/sign-in",
     dashboard: "/dashboard",
     // @endif
     // @if legal
     terms: "/legal/terms",
     // @endif
   } as const;
   ```

   Conditions combine module names, `pm:<name>` and `supabase:<target>` with
   `and`, `or`, `not` and parentheses. Lines are removed, never edited. `//`, `#`, `--`, `/* */`,
   `<!-- -->` and `{/* */}` comments all work.
3. **Substitute.** `__APP_NAME__`, `__APP_SLUG__`, `__APP_DESCRIPTION__`,
   `__DEV_PORT__`, `__PM_RUN__`, `__PM_EXEC__` and friends are replaced. An
   unknown `__PLACEHOLDER__` fails generation.
4. **Generate.** `package.json`, `tsconfig.json`, `.env.example` and
   `README.md` are built from the module manifests in
   [`src/modules/registry.ts`](src/modules/registry.ts). Message files under
   `messages/` that several modules ship are deep-merged.

CI guards the templates in three layers:

- **Unit tests** cover the preprocessor, placeholders, naming and argument
  parsing.
- **Template integrity tests** plan all 64 module combinations and check for
  unknown directives and placeholders, path collisions, invalid JSON,
  feature-folder rule violations and leftover product names.
- **End-to-end tests** generate the `minimal` and `all` presets, install them
  and run `lint` with zero warnings, `lint:styles`, `typecheck`, `test` and
  `build`.

See [docs/design.md](docs/design.md) for the reasoning and
[docs/template-sync.md](docs/template-sync.md) for keeping templates up to
date.

## Requirements

- Node.js 24 or newer.
- Docker, for the local Supabase stack, when the `supabase` module is enabled.

## Contributing

Issues and pull requests are welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Adrian Manduc
