/**
 * Development helper: after running `eslint --fix` inside a generated project,
 * copies the fixed files back into `templates/` when that is lossless, that is
 * when the template file has no directives and no placeholders, so the
 * generated file is a byte-for-byte copy of it. Files that need manual work
 * are listed instead.
 *
 *   node scripts/sync-back.ts <generated-dir> <preset> [pnpm|npm|bun]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { collectPlaceholders } from "../src/generator/placeholders.ts";
import { findTemplatesRoot, listFiles, toTargetPath } from "../src/generator/plan.ts";
import { hasDirectives } from "../src/generator/preprocess.ts";
import { registry } from "../src/modules/registry.ts";
import { resolveModules } from "../src/modules/resolve.ts";
import { MODULE_IDS } from "../src/modules/types.ts";

import type { ModuleId } from "../src/modules/types.ts";

const [directory, preset = "all"] = process.argv.slice(2);

if (!directory) {
  console.error("Usage: node scripts/sync-back.ts <generated-dir> <preset>");
  process.exit(1);
}

const selected: ModuleId[] = preset === "all" ? [...MODULE_IDS] : preset === "minimal" ? [] : (preset.split(",") as ModuleId[]);
const { enabled } = resolveModules(selected, registry);
const templatesRoot = findTemplatesRoot();
const owner = new Map<string, { module: ModuleId, path: string }>();

for (const id of enabled) {
  for (const templatePath of listFiles(join(templatesRoot, id))) {
    owner.set(toTargetPath(templatePath), { module: id, path: templatePath });
  }
}

let copied = 0;

for (const [target, { module, path }] of owner) {
  const generatedPath = join(resolve(directory), target);

  if (!existsSync(generatedPath) || /\.(png|ico|jpe?g|webp|woff2?)$/.test(target) || target.startsWith("messages/")) {
    continue;
  }

  const templateFile = join(templatesRoot, module, path);
  const template = readFileSync(templateFile, "utf8");
  const generated = readFileSync(generatedPath, "utf8");

  if (template === generated) {
    continue;
  }

  if (hasDirectives(template) || collectPlaceholders(template).length > 0) {
    process.stdout.write(`manual: templates/${module}/${path}\n`);
    continue;
  }

  writeFileSync(templateFile, generated);
  copied++;
  process.stdout.write(`synced: templates/${module}/${path}\n`);
}

process.stdout.write(`${copied} file(s) synced.\n`);
