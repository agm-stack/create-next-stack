# Contributing

Thanks for your interest in improving `@agm-stack/create-next-stack`. Issues
and pull requests are welcome.

## Development setup

Requirements: Node.js 24 or newer and npm. The e2e checks also need pnpm
(`corepack enable`) and, for the `supabase` module, nothing else: the local
Supabase stack is not started during checks.

```bash
git clone https://github.com/agm-stack/create-next-stack.git
```

```bash
cd create-next-stack && npm install
```

| Command | What it does |
| --- | --- |
| `npm run lint` | Lints the CLI source, tests and scripts. Templates are linted inside generated projects. |
| `npm run typecheck` | Type-checks the CLI with `tsc`. |
| `npm test` | Unit and template integrity tests on the Node.js test runner. |
| `npm run test:update` | Same, and rewrites the file-list snapshot after an intentional change. |
| `npm run build` | Bundles the CLI into `dist/cli.js` with tsup. |
| `npm run e2e -- --preset all` | Generates a project, installs it and runs its lint, typecheck, tests and build. |
| `node scripts/generate.ts <dir> <preset>` | Generates a project without prompts or installs. |
| `npm start -- [args]` | Rebuilds, then runs the CLI in the folder you called it from (in `.e2e/` when called from the repository root). |
| `node dist/cli.js` | Runs the last build without rebuilding. |

Tests and scripts run TypeScript directly through Node's type stripping, so
they import sources with `.ts` extensions and avoid syntax that needs
compiling (enums, parameter properties).

Read [docs/design.md](docs/design.md) before changing how generation works,
and [docs/template-sync.md](docs/template-sync.md) before changing templates.
If you work with an AI coding agent, it picks up the repository rules from
[AGENTS.md](AGENTS.md).

## Commits and pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/). Scopes
  are optional and limited to the list in `commitlint.config.js`. A Husky
  hook and the Commitlint workflow check every message.
- Pull requests are squash-merged, so the title must be a valid commit
  message too.
- A change to generated output is a `feat` or `fix` of the CLI. A change that
  removes a module, flag or generated file that users rely on is breaking
  (`feat!:`).

## Releases

Releases are automated with release-please. Merging its release pull request
tags the version and publishes to npm through trusted publishing, so no npm
token is stored in the repository. Do not bump `version` or edit
`CHANGELOG.md` by hand.
