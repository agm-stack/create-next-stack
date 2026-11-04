# Agent instructions

Instructions for AI coding agents working in this repository. Humans should
start with [CONTRIBUTING.md](CONTRIBUTING.md); this file only adds what an
agent cannot infer from the code. Architecture rationale lives in
[docs/design.md](docs/design.md).

## Commands

Run these before finishing any change:

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

When a change touches `templates/`, `src/modules/` or `src/generator/`, also
run the e2e check for the affected combinations (at least `all` and
`minimal`):

```bash
npm run e2e -- --preset all
```

## Invariants

- **Templates stay valid source.** Directives are whole-line comments
  (`// @if auth`, `# @if auth`, `<!-- @if auth -->`, `{/* @if auth */}`). An
  import and every use of it are gated by the same condition.
- **Lines are removed, never edited.** Do not add directive features that
  rewrite lines.
- **Generated projects lint with zero warnings** in every module combination.
- **No product names.** Templates must stay generic; the integrity test fails
  on the banned word hashes it lists.
- **Feature folders** in templates follow the layout in
  `templates/base/docs/agent-rules/project-architecture.md`. Kebab-case file
  names, no `helpers/` folders, cross-feature imports only along the edges
  allowed in `tests/templates.test.ts`.
- **Module order is dependency order.** A module only requires modules listed
  before it in `MODULE_IDS`.
- **One version table.** Generated-project dependency versions live only in
  `src/modules/versions.ts`.
- **Dotfiles npm drops** (`.gitignore`, `.npmrc`) are stored with a leading
  underscore.
- **The CLI has no runtime dependencies.** Everything is bundled by tsup;
  libraries are `devDependencies`.

## Keeping docs in sync

Update documentation in the same change as the code:

- New or changed module: the README module table, `docs/template-sync.md` if
  the process changes, and the commit scopes in `commitlint.config.js`.
- New or changed flag: the README options table and `HELP` in `src/args.ts`.
- Changes to how generation works: `docs/design.md`.

Do not edit `CHANGELOG.md` by hand; release-please generates it.

## Commits and releases

- Use [Conventional Commits](https://www.conventionalcommits.org/) with the
  scopes in `commitlint.config.js`. Never bypass hooks with `--no-verify`.
- Never run `npm publish` or bump `version` manually.
- Never add npm tokens, API keys or other secrets to the repository,
  workflows or templates. Templates reference secrets only by environment
  variable name.

## Scope

- Do only what the task asks; keep diffs small and avoid unrelated refactors.
- Do not add dependencies without a concrete need.
