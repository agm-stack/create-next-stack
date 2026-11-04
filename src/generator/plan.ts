import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { registry } from "../modules/registry.ts";

import { renderEnvExample } from "./env.ts";
import { deepMerge, toJson } from "./json-merge.ts";
import { getContext, getPlaceholders } from "./options.ts";
import { renderPackageJson } from "./package-json.ts";
import { substitute } from "./placeholders.ts";
import { evaluate, hasDirectives, preprocess } from "./preprocess.ts";
import { renderReadme } from "./readme.ts";
import { renderTsconfig } from "./tsconfig.ts";

import type { ProjectOptions } from "./options.ts";
import type { PreprocessContext } from "./preprocess.ts";
import type { ModuleId } from "../modules/types.ts";

export type PlannedFile = {
  /** POSIX path relative to the project root. */
  path: string,
  content: string | Buffer,
  /** Module that contributed the file, or "generated". */
  from: ModuleId | "generated"
};

const BINARY_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2"]);

/**
 * npm never publishes files named `.gitignore` or `.npmrc`, so templates store
 * them with a leading underscore instead of a dot.
 */
const RENAMED_FILES: Record<string, string> = {
  _gitignore: ".gitignore",
  _npmrc: ".npmrc",
};

/** Files merged as JSON when several modules ship the same path. */
const isMergeableJson = (path: string) => path.startsWith("messages/") && path.endsWith(".json");

export function findTemplatesRoot(start = dirname(fileURLToPath(import.meta.url))): string {
  let directory = start;

  for (;;) {
    const candidate = join(directory, "templates");

    if (existsSync(join(candidate, "base"))) {
      return candidate;
    }

    const parent = dirname(directory);

    if (parent === directory) {
      throw new Error("Could not find the templates directory.");
    }

    directory = parent;
  }
}

export function listFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .sort();
}

export function toTargetPath(templatePath: string): string {
  const separator = templatePath.lastIndexOf("/");
  const directory = templatePath.slice(0, separator + 1);
  const name = templatePath.slice(separator + 1);

  return `${directory}${RENAMED_FILES[name] ?? name}`;
}

function extension(path: string) {
  const index = path.lastIndexOf(".");

  return index === -1 ? "" : path.slice(index).toLowerCase();
}

export function planProject(options: ProjectOptions, templatesRoot = findTemplatesRoot()): PlannedFile[] {
  const context: PreprocessContext = getContext(options);
  const placeholders = getPlaceholders(options);
  const files = new Map<string, PlannedFile>();

  for (const id of options.modules) {
    const manifest = registry[id];
    const moduleRoot = join(templatesRoot, id);

    for (const templatePath of listFiles(moduleRoot)) {
      const condition = manifest.conditionalFiles?.[templatePath];

      if (condition && !evaluate(condition, context)) {
        continue;
      }

      const target = toTargetPath(templatePath);
      const label = `templates/${id}/${templatePath}`;
      const raw = readFileSync(join(moduleRoot, templatePath));
      const existing = files.get(target);

      if (BINARY_EXTENSIONS.has(extension(target))) {
        files.set(target, { path: target, content: raw, from: id });

        continue;
      }

      const source = raw.toString("utf8");
      const directives = hasDirectives(source);
      let content = directives ? preprocess(source, context, label) : source;
      content = substitute(content, placeholders, label);

      // A file whose every line sits inside an inactive @if is not written.
      if (directives && content.trim() === "") {
        continue;
      }

      if (existing && isMergeableJson(target)) {
        const merged = deepMerge(JSON.parse(existing.content as string), JSON.parse(content));
        files.set(target, { path: target, content: toJson(merged), from: existing.from });

        continue;
      }

      if (existing && !manifest.replaces?.includes(target)) {
        throw new Error(`${label} overwrites ${target} from "${existing.from}" without listing it in "replaces".`);
      }

      files.set(target, { path: target, content, from: id });
    }
  }

  const generated: PlannedFile[] = [
    { path: "package.json", content: renderPackageJson(options), from: "generated" },
    { path: "tsconfig.json", content: renderTsconfig(options), from: "generated" },
    { path: ".env.example", content: renderEnvExample(options), from: "generated" },
    { path: "README.md", content: renderReadme(options), from: "generated" },
  ];

  for (const file of generated) {
    if (files.has(file.path)) {
      throw new Error(`${file.path} is generated and must not exist in templates.`);
    }

    files.set(file.path, file);
  }

  return [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
}
