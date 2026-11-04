/**
 * Template integrity: checks every module's templates against the generator's
 * rules, and plans every module combination so a broken directive or a path
 * collision fails here instead of in a generated project.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { getPlaceholders } from "../src/generator/options.ts";
import { PLACEHOLDER_KEYS, collectPlaceholders, substitute } from "../src/generator/placeholders.ts";
import { findTemplatesRoot, listFiles, planProject, toTargetPath } from "../src/generator/plan.ts";
import { KNOWN_ATOMS, collectAtoms } from "../src/generator/preprocess.ts";
import { registry } from "../src/modules/registry.ts";
import { resolveModules } from "../src/modules/resolve.ts";
import { MODULE_IDS, PACKAGE_MANAGERS, SUPABASE_TARGETS } from "../src/modules/types.ts";

import type { ModuleId, OptionalModuleId, SupabaseTarget } from "../src/modules/types.ts";

const templatesRoot = findTemplatesRoot();
const BINARY = /\.(png|ico|jpe?g|gif|webp|woff2?)$/;

/**
 * SHA-256 hashes of lowercase words that must never appear in templates, such
 * as names of private projects. Stored as hashes so this public repository does
 * not spell them out. Add one with:
 * node -e "console.log(require('crypto').createHash('sha256').update('word').digest('hex'))"
 */
const BANNED_WORD_HASHES = new Set([
  "cf3532b177b91dcda103c01ac60b916b022ca4280a86927dbb6c8f8b7f76cf6f",
]);

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const templates = MODULE_IDS.flatMap((module) =>
  listFiles(join(templatesRoot, module)).map((path) => ({
    module,
    path,
    target: toTargetPath(path),
    source: BINARY.test(path) ? "" : readFileSync(join(templatesRoot, module, path), "utf8"),
  })),
);

const OPTIONAL = MODULE_IDS.filter((id): id is OptionalModuleId => id !== "base");

/** Every subset of the optional modules (64 combinations). */
function allSelections(): OptionalModuleId[][] {
  return Array.from({ length: 2 ** OPTIONAL.length }, (_, mask) => OPTIONAL.filter((_id, bit) => mask & (1 << bit)));
}

function plan(selection: OptionalModuleId[], pm: (typeof PACKAGE_MANAGERS)[number] = "pnpm", supabaseTarget: SupabaseTarget = "remote") {
  return planProject({
    name: "Test App",
    slug: "test-app",
    description: "A test project.",
    pm,
    supabaseTarget,
    port: 3000,
    modules: resolveModules(selection, registry).enabled,
  });
}

describe("templates", () => {
  it("contain no banned words", () => {
    const leaks = templates.filter(({ path, source }) =>
      `${path}\n${source}`.toLowerCase().match(/[a-z0-9]+/g)?.some((word) => BANNED_WORD_HASHES.has(sha256(word))));

    assert.deepEqual(leaks.map(({ module, path }) => `${module}/${path}`), []);
  });

  it("use only known directive atoms and placeholders", () => {
    for (const { module, path, source } of templates) {
      for (const atom of collectAtoms(source)) {
        assert.ok(KNOWN_ATOMS.has(atom), `${module}/${path}: unknown atom ${atom}`);
      }

      for (const key of collectPlaceholders(source)) {
        assert.ok((PLACEHOLDER_KEYS as readonly string[]).includes(key), `${module}/${path}: unknown placeholder __${key}__`);
      }
    }
  });

  it("store dotfiles npm would drop under an underscore name", () => {
    const unpublishable = templates.filter(({ path }) => /(^|\/)\.(gitignore|npmrc)$/.test(path));

    assert.deepEqual(unpublishable.map(({ path }) => path), []);
  });

  it("keep JSON valid after placeholder substitution", () => {
    const values = getPlaceholders({
      name: "Test App", slug: "test-app", description: "A test.", pm: "pnpm", port: 3000, modules: ["base"]
    });

    for (const { module, path, source } of templates.filter((template) => template.path.endsWith(".json"))) {
      assert.doesNotThrow(() => JSON.parse(substitute(source, values, path)), `${module}/${path}`);
    }
  });

  it("follow the feature-folder conventions", () => {
    // Allowed cross-feature imports: importer -> imported features.
    const allowed: Record<string, string[]> = {
      account: ["auth"],
      auth: ["legal"],
      dashboard: ["account", "auth"],
      legal: [],
    };

    for (const { module, path, source } of templates) {
      const feature = /^src\/features\/([^/]+)\//.exec(path)?.[1];
      const fileName = path.split("/").at(-1) ?? "";

      if (path.startsWith("src/features/")) {
        assert.ok(!/[A-Z]/.test(fileName), `${module}/${path}: file names are kebab-case`);
        assert.ok(!path.includes("/helpers/"), `${module}/${path}: use api/ or the feature root instead of helpers/`);
      }

      for (const [, imported] of source.matchAll(/from "@\/features\/([^/"]+)\//g)) {
        if (!feature) {
          assert.ok(
            !path.startsWith("src/lib/") && !path.startsWith("src/components/ui/"),
            `${module}/${path}: infrastructure must not import features`,
          );
        } else if (imported !== feature) {
          assert.ok(allowed[feature]?.includes(imported ?? ""), `${module}/${path}: ${feature} must not import ${imported}`);
        }
      }
    }
  });
});

describe("module manifests", () => {
  it("point conditional files and replacements at real templates", () => {
    for (const id of MODULE_IDS) {
      const manifest = registry[id];

      for (const file of Object.keys(manifest.conditionalFiles ?? {})) {
        assert.ok(existsSync(join(templatesRoot, id, file)), `${id}: conditional file ${file} does not exist`);
      }

      for (const target of manifest.replaces ?? []) {
        const earlier = MODULE_IDS.slice(0, MODULE_IDS.indexOf(id));

        assert.ok(
          templates.some((template) => template.target === target && earlier.includes(template.module)),
          `${id}: replaces ${target}, which no earlier module provides`,
        );
      }
    }
  });

  it("only require earlier modules, so the order is a valid dependency order", () => {
    for (const id of MODULE_IDS) {
      for (const required of registry[id].requires) {
        assert.ok(MODULE_IDS.indexOf(required) < MODULE_IDS.indexOf(id), `${id} requires later module ${required}`);
      }
    }
  });
});

describe("planning", () => {
  it("succeeds for every module combination and Supabase target", () => {
    for (const [selection, target] of allSelections().flatMap((s) => SUPABASE_TARGETS.map((t) => [s, t] as const))) {
      const files = plan(selection, "pnpm", target);
      const paths = files.map((file) => file.path);

      assert.equal(new Set(paths).size, paths.length, `duplicate paths for ${selection.join(",")}`);

      for (const file of files) {
        if (typeof file.content === "string" && file.path.endsWith(".json")) {
          assert.doesNotThrow(() => JSON.parse(file.content as string), `${selection.join(",")}: ${file.path}`);
        }
      }
    }
  });

  it("writes package-manager specific files only for that manager", () => {
    for (const pm of PACKAGE_MANAGERS) {
      const paths = plan([...OPTIONAL], pm).map((file) => file.path);

      assert.equal(paths.includes("pnpm-workspace.yaml"), pm === "pnpm", pm);
    }
  });

  it("configures the Supabase target in the environment and the db script", () => {
    for (const target of SUPABASE_TARGETS) {
      const files = plan(["supabase"], "pnpm", target);
      const env = files.find((file) => file.path === ".env.example")?.content as string;
      const script = files.find((file) => file.path === "scripts/supabase.mjs")?.content as string;

      assert.match(env, new RegExp(`^SUPABASE_TARGET=${target}$`, "m"));
      assert.equal(env.match(/^NEXT_PUBLIC_SUPABASE_URL=/gm)?.length, 1);
      assert.match(script, new RegExp(`const DEFAULT_TARGET = "${target}";`));
    }

    assert.ok(!plan([]).some((file) => file.path === "scripts/supabase.mjs"));
  });

  it("writes overlays only when their target module is enabled", () => {
    const paths = (selection: OptionalModuleId[]) => plan(selection).map((file) => file.path);

    assert.ok(!paths(["auth"]).includes("messages/en/legal.json"));
    assert.ok(!paths(["legal"]).includes("messages/en/auth.json"));
    assert.ok(!paths(["legal"]).includes("src/features/legal/api/terms-acceptance.ts"));
    assert.ok(paths(["auth", "legal"]).includes("src/features/legal/api/terms-acceptance.ts"));
  });

  it("matches the file list snapshot for the presets", (t) => {
    const presets: Record<string, ModuleId[]> = {
      minimal: [],
      all: [...OPTIONAL],
    };

    for (const selection of Object.values(presets)) {
      t.assert.snapshot(plan(selection as OptionalModuleId[]).map((file) => file.path), { serializers: [(value) => JSON.stringify(value, null, 2)] });
    }
  });
});
