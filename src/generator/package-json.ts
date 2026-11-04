import { registry } from "../modules/registry.ts";
import { PACKAGE_MANAGER_VERSIONS } from "../modules/versions.ts";

import { sortKeys, toJson } from "./json-merge.ts";
import { getPlaceholders } from "./options.ts";
import { substitute } from "./placeholders.ts";

import type { ProjectOptions } from "./options.ts";

/** Script order in the generated package.json: lifecycle first, then the rest as declared. */
const SCRIPT_ORDER = ["dev", "build", "start", "lint", "lint:styles", "typecheck", "test", "test:watch"];

export function renderPackageJson(options: ProjectOptions): string {
  const placeholders = getPlaceholders(options);
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const scripts: Record<string, string> = {};

  for (const id of options.modules) {
    const manifest = registry[id];
    Object.assign(dependencies, manifest.dependencies);
    Object.assign(devDependencies, manifest.devDependencies);

    for (const [name, command] of Object.entries(manifest.scripts ?? {})) {
      scripts[name] = substitute(command, placeholders, `${id} manifest`);
    }
  }

  // Known lifecycle scripts first, module scripts next, `prepare` last.
  const rank = (name: string) => {
    if (name === "prepare") {
      return Number.MAX_SAFE_INTEGER;
    }

    const index = SCRIPT_ORDER.indexOf(name);

    return index === -1 ? SCRIPT_ORDER.length : index;
  };
  const orderedScripts = Object.fromEntries(Object.entries(scripts).sort(([a], [b]) => rank(a) - rank(b)));

  const packageJson: Record<string, unknown> = {
    name: options.slug,
    version: "0.1.0",
    private: true,
    type: "module",
    ...(options.pm === "pnpm" ? { packageManager: `pnpm@${PACKAGE_MANAGER_VERSIONS.pnpm}` } : {}),
    scripts: orderedScripts,
    dependencies: sortKeys(dependencies),
    devDependencies: sortKeys(devDependencies),
  };

  return toJson(packageJson);
}
