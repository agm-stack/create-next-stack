# Keeping templates up to date

This guide covers the routine changes to the templates.

## Changing a template

1. Edit the file under `templates/<module>/`. Keep directives on their own
   lines and gate an import together with every use of it, or a disabled
   module leaves an unused import behind.
2. Run the fast checks:

   ```bash
   npm test
   ```

3. Generate and check the combinations your change touches:

   ```bash
   node scripts/e2e.ts --preset all
   ```

   ```bash
   node scripts/e2e.ts --preset minimal
   ```

   Pass a module list to test a specific seam, for example
   `--preset auth` (auth without legal) or `--preset legal` (legal without
   auth).

## Fixing lint issues found in a generated project

Generated projects lint with zero warnings in CI. When a template change
introduces a fixable issue, fix it in a generated project and copy the result
back:

```bash
node scripts/generate.ts .e2e/fix all
```

```bash
cd .e2e/fix && pnpm install && pnpm exec eslint --fix
```

```bash
node scripts/sync-back.ts .e2e/fix all
```

`sync-back.ts` copies a fixed file back only when its template has no
directives or placeholders, so the copy is exact. It lists the other files
for you to update by hand.

## Bumping dependencies

Versions for generated projects live in `src/modules/versions.ts`. Change them
there, then run the `all` and `minimal` e2e presets. Dependabot only updates
this repository's own tooling, not that table.

## Adding a module

1. Add the id to `MODULE_IDS` in `src/modules/types.ts`, after every module it
   requires.
2. Add a manifest to `src/modules/registry.ts`: description, requirements,
   dependencies, scripts, environment variables and next steps.
3. Put its files in `templates/<id>/`. Use `conditionalFiles` for files that
   only make sense with another module, and `replaces` to override a file from
   an earlier module.
4. Add the id to the commit scopes in `commitlint.config.js`, the README
   module table and the snapshot (`npm run test:update`).

## Rules the integrity tests enforce

- No banned words. `tests/templates.test.ts` keeps them as SHA-256 hashes, so
  this repository never spells them out.
- Feature folders use kebab-case file names and no `helpers/` folders.
  Cross-feature imports follow the allowed map in the test, and
  infrastructure (`src/lib`, `src/components/ui`) never imports a feature.
- `.gitignore` and `.npmrc` are stored as `_gitignore` and `_npmrc`, because
  npm drops the dotted names when publishing.
- Only known directive atoms and placeholders are used.
