# Design notes

This document records the decisions behind the generator, for contributors
and for anyone building a similar scaffolder.

## Templates are real source files

Templates are complete, readable files in `templates/<module>/`, not string
builders in TypeScript. A file that differs between module combinations
carries line directives in comments (`// @if auth`). This keeps three
properties:

- A template reads like the code it produces, so reviewing a change to the
  generated project means reviewing a normal diff.
- Fixes found in a generated project can often be copied straight back
  (`scripts/sync-back.ts` does this automatically when a template has no
  directives or placeholders).
- No template engine syntax (`{{ }}`, EJS) leaks into files that editors and
  linters would choke on.

The preprocessor only removes whole lines. It never edits a line, so the
output is always a subset of the template's lines plus placeholder values.
When a removed block would leave two blank lines in a row, or a blank line
right after an opening bracket or before a closing one, the extra blank line
is dropped, which keeps generated projects clean under the stylistic lint
rules.

## Modules, order and overrides

Modules are applied in a fixed order (`MODULE_IDS` in
`src/modules/types.ts`): `base`, `react-query`, `i18n`, `supabase`, `auth`,
`legal`, `cloudflare`. A module may only require modules that come earlier,
which the integrity tests enforce, so the order is also a valid dependency
order.

A path can be written by one module only, with two exceptions:

- A module may overwrite an earlier module's file when its manifest lists the
  path in `replaces`. The `i18n` module uses this to swap the plain `useText`
  and `getText` helpers for next-intl aliases.
- JSON files under `messages/` are deep-merged. This lets a module add copy to
  another module's namespace, for example `auth` adding an "Account data"
  section to the privacy policy, without the base copy mentioning features
  that are not installed. Overlays are listed in `conditionalFiles` so they
  are only written when the namespace's owner is enabled.

Generated files (`package.json`, `tsconfig.json`, `.env.example`,
`README.md`) are assembled from the manifests in `src/modules/registry.ts`
instead of templates, because JSON cannot carry comment directives and these
files are mostly lists that modules add to.

## Remote or local Supabase

The Supabase target is a generation-time default and a runtime setting at the
same time. The wizard's answer (`--supabase remote|local`, default `remote`)
does three things:

- It seeds `SUPABASE_TARGET` in `.env.example` and the fallback inside the
  generated `scripts/supabase.mjs`.
- It picks the `NEXT_PUBLIC_SUPABASE_URL` default (the local API URL, or an
  empty value with a pointer to the dashboard).
- It selects checklist steps through the `supabase:local` and
  `supabase:remote` atoms, which manifests use for env vars and steps (`when`)
  and templates can use in directives. Both atoms are false when the supabase
  module is off.

Database scripts go through `scripts/supabase.mjs` instead of calling the
Supabase CLI directly, so switching targets is a one-line change in
`.env.local` rather than editing `package.json`. The script refuses to reset a
remote database: `supabase db reset --linked` wipes hosted data and should
never be one keystroke away.

## Copy without i18n

Every variant keeps user-facing copy in `messages/en/*.json`. Without the
`i18n` module, `useText` and `getText` are small functions that read those
files and interpolate `{name}` values. With it, they become aliases of
next-intl's `useTranslations` and `getTranslations`. Components call the same
helpers in both cases, so most shared files need no directives, and adding
i18n later is a dependency and two file swaps rather than a rewrite.

## Names and placeholders

The wizard asks for a project name, turns its last path segment into a
kebab-case package name (`__APP_SLUG__`) and proposes a title-cased display
name (`__APP_NAME__`). The display name and description are embedded in JSON,
TypeScript strings, HTML and ICU messages, so characters that are special in
any of those (`"`, backticks, backslashes, braces, angle brackets, `$`, line
breaks) are rejected up front instead of escaped per format.

Placeholders use an all-caps `__NAME__` pattern so mixed-case identifiers
such as Supabase's `__InternalSupabase` never match. An unknown all-caps
placeholder is treated as a typo and fails generation.

## Dependencies and versions

The CLI bundles its two runtime libraries (`@clack/prompts`, `picocolors`)
with tsup, so `npm create` downloads one small package with no dependency
tree. Versions written into generated projects live in one table,
`src/modules/versions.ts`, taken from the app the templates come from, so a
bump happens in one place and the e2e workflow proves it.

Generated projects use `@agm-stack/eslint-config-next` rather than an inline
ESLint config, so lint rules improve through a dependency update instead of
diverging between projects.

## Checks

| Layer | What it proves | Where |
| --- | --- | --- |
| Unit tests | Preprocessor, placeholders, naming, arguments, resolution | `tests/preprocess.test.ts`, `tests/units.test.ts` |
| Integrity tests | Every template and all 64 module combinations plan cleanly, with no unknown directives or placeholders, path collisions, invalid JSON, feature-folder violations or product names | `tests/templates.test.ts` |
| E2E | Generated projects install, lint with zero warnings, type-check, test and build | `scripts/e2e.ts`, CI `e2e` job |

E2E runs `minimal` and `all` in CI. Locally, any preset or module list works:
`node scripts/e2e.ts --preset auth,legal --pm npm`.

`server-only` is a dev dependency in generated projects even though server
modules import it: Next.js bundles it, and Vitest tests mock it with
`vi.mock("server-only", () => ({}))`.

## Things deliberately left out

- **Payments, uploads and analytics.** They depend too much on the product.
- **Yarn.** Yarn Berry needs extra configuration (`nodeLinker`) and doubles
  the matrix for little benefit. pnpm, npm and bun are supported.
- **A mounted cookie banner.** The generated app only uses strictly necessary
  cookies, which need no consent. `ConsentManager` ships ready to mount when
  analytics or marketing cookies are added.
