# __APP_NAME__ agent instructions

__APP_DESCRIPTION__

Next.js may insert a "This is NOT the Next.js you know" block at the top of
this file when `next dev` runs. Keep it: it points agents at the
version-matched docs in `node_modules/next/dist/docs/`.

## Read selectively

Do not load every document for every prompt:

1. Read only the source material the task needs. Product and architecture
   specs live in `docs/` as the project grows.
2. For code matching a Cursor rule, read the matching guidance under
   `docs/agent-rules/`. Skip unrelated rule documents.

For documentation-only or configuration-only prompts, read only the files that
the change directly affects.

## Working rules

- Use the Next.js App Router with strict TypeScript and the `@/*` alias.
- Follow the feature-folder layout in `docs/agent-rules/project-architecture.md`.
- Do only what the prompt asks; do not continue into follow-up work unless
  explicitly asked.
- Make small, reviewable diffs. Do not perform unrelated refactors.
- Do not add dependencies unless the prompt requires them.
- Keep docs in sync: update the relevant doc in the same change when behavior,
  routes or architecture change.
- Keep application-owned user-facing copy in `messages/`. User-generated
  content is data and is not translated.
- Run the checks the repository supports (`__PM_RUN__ lint`,
  `__PM_RUN__ lint:styles`, `__PM_RUN__ typecheck`, `__PM_RUN__ test`). Never
  add placeholder scripts for tools that are not installed.
- At completion, summarize changed files and checks, then stop.

## Copy and internationalization

- New application-owned user-facing copy goes into `messages/en/*.json`
  rather than being hard-coded in JSX/TSX. Each file is one namespace,
  registered in `src/i18n/messages.ts`.
<!-- @if i18n -->
- Use `getText` (`@/i18n/get-text`, an alias of next-intl's
  `getTranslations`) in async server code and `useText` (`@/hooks/use-text`,
  an alias of `useTranslations`) in components.
- Use the locale-aware `next-intl` formatting helpers for application dates,
  times and numbers.
- To add a locale: add it to `src/i18n/config.ts`, add its message files,
  choose the request or user-preference source without changing URLs by
  default, review date and number formats and localized metadata, then add a
  locale switcher only when a second locale ships.
<!-- @else -->
- Use `getText` (`@/i18n/get-text`) in async server code and `useText`
  (`@/hooks/use-text`) in components. They read the message files directly
  and support `{name}` interpolation. Moving to next-intl later keeps the
  same call sites.
<!-- @endif -->
- Stable internal identifiers and raw external error or debug details are not
  translated.
<!-- @if supabase -->

## Database

- Schema changes are SQL migrations in `supabase/migrations/`, applied with
  `__PM_RUN__ db:migrate` and followed by `__PM_RUN__ db:types` to regenerate
  `src/types/database.ts`.
- The `db:*` scripts target the database named by `SUPABASE_TARGET` in
  `.env.local`: `remote` (the linked hosted project) or `local` (the Docker
  stack). Never run destructive commands against the remote target.
- Browser code never queries Supabase tables directly. It calls the
  application API (`/api/...`); server repositories map rows to DTOs.
<!-- @endif -->
<!-- @if cloudflare -->

## Deployment

- Production runs on Cloudflare Workers through vinext. Worker settings and
  bindings live in `cloudflare.config.ts`; keep rate-limit bindings in sync
  with `src/lib/api/rate-limit.ts`.
<!-- @endif -->

## Git commits

- Commit messages use Conventional Commits. A commitlint hook rejects others.

## Cursor and MCP policy

- `AGENTS.md` is the portable repository guidance; `.cursor/rules/*.mdc` are
  small Cursor entry points. Detailed rule guidance lives in
  `docs/agent-rules/`.
- MCPs are developer tools, not runtime dependencies. MCP configuration must
  use environment interpolation for secrets, never commit tokens or keys,
  prefer project-scoped or read-only access, and require manual approval for
  destructive actions. Never connect production data to an autonomous coding
  workflow.
