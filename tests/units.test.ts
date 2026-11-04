import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCliArgs } from "../src/args.ts";
import { deepMerge } from "../src/generator/json-merge.ts";
import { getPlaceholders } from "../src/generator/options.ts";
import { collectPlaceholders, substitute } from "../src/generator/placeholders.ts";
import { toTargetPath } from "../src/generator/plan.ts";
import { registry } from "../src/modules/registry.ts";
import { resolveModules } from "../src/modules/resolve.ts";
import {
  toDisplayName, toSlug, validatePort, validateSlug, validateText
} from "../src/naming.ts";
import { detectPackageManager } from "../src/postinstall.ts";

const placeholders = getPlaceholders(
  {
    name: "Acme Notes", slug: "acme-notes", description: "Notes.", pm: "npm", port: 4000, modules: ["base"]
  },
  new Date("2026-05-17T10:00:00Z"),
);

describe("naming", () => {
  it("turns free-form input into a package-safe slug", () => {
    assert.equal(toSlug("My App!"), "my-app");
    assert.equal(toSlug("./projects/Café Crème"), "cafe-creme");
    assert.equal(toSlug("myCoolApp"), "my-cool-app");
    assert.equal(toSlug("---"), "");
  });

  it("derives a display name from the slug", () => {
    assert.equal(toDisplayName("acme-notes"), "Acme Notes");
  });

  it("validates slugs, ports and embeddable text", () => {
    assert.equal(validateSlug("acme-notes"), undefined);
    assert.match(validateSlug("") ?? "", /at least one/);
    assert.match(validateSlug("react") ?? "", /reserved/);
    assert.equal(validatePort("3000"), undefined);
    assert.match(validatePort("80") ?? "", /between/);
    assert.equal(validateText("Ada's App", "name"), undefined);
    assert.match(validateText("Say \"hi\"", "name") ?? "", /double quotes/);
    assert.match(validateText("{name}", "name") ?? "", /braces/);
  });
});

describe("placeholders", () => {
  it("substitutes known keys", () => {
    assert.equal(substitute("__APP_NAME__ on :__DEV_PORT__ via __PM_RUN__ dev", placeholders, "f"), "Acme Notes on :4000 via npm run dev");
    assert.equal(substitute("v__TODAY__", placeholders, "f"), "v2026-05-17");
  });

  it("rejects unknown all-caps placeholders but ignores other identifiers", () => {
    assert.throws(() => substitute("a\n__APP_TITLE__", placeholders, "f"), /f:2: Unknown placeholder __APP_TITLE__/);
    assert.equal(substitute("__InternalSupabase __html __cf_bm", placeholders, "f"), "__InternalSupabase __html __cf_bm");
  });

  it("lists placeholders", () => {
    assert.deepEqual(collectPlaceholders("__APP_NAME__ and __YEAR__"), ["APP_NAME", "YEAR"]);
  });
});

describe("json merge", () => {
  it("merges objects recursively and replaces arrays", () => {
    assert.deepEqual(
      deepMerge({ a: { b: 1, c: [1] }, d: 1 }, { a: { c: [2], e: 3 } }),
      { a: { b: 1, c: [2], e: 3 }, d: 1 },
    );
  });
});

describe("module resolution", () => {
  it("adds required modules and reports why", () => {
    const { enabled, implied } = resolveModules(["auth"], registry);

    assert.deepEqual(enabled, ["base", "react-query", "i18n", "supabase", "auth"]);
    assert.deepEqual(implied, [
      { id: "react-query", requiredBy: ["auth"] },
      { id: "i18n", requiredBy: ["auth"] },
      { id: "supabase", requiredBy: ["auth"] },
    ]);
  });

  it("does not report explicitly selected modules as implied", () => {
    assert.deepEqual(resolveModules(["i18n", "legal"], registry).implied, []);
  });

  it("always includes base", () => {
    assert.deepEqual(resolveModules([], registry).enabled, ["base"]);
  });
});

describe("template paths", () => {
  it("restores dotfiles that npm would not publish", () => {
    assert.equal(toTargetPath("_gitignore"), ".gitignore");
    assert.equal(toTargetPath("supabase/_gitignore"), "supabase/.gitignore");
    assert.equal(toTargetPath("src/app/page.tsx"), "src/app/page.tsx");
  });
});

describe("cli arguments", () => {
  it("parses flags and presets", () => {
    const args = parseCliArgs(["my-app", "--modules", "auth, legal", "--pm", "bun", "--supabase", "local", "--no-git", "-y"]);

    assert.equal(args.directory, "my-app");
    assert.deepEqual(args.modules, ["auth", "legal"]);
    assert.equal(args.pm, "bun");
    assert.equal(args.supabase, "local");
    assert.equal(args.git, false);
    assert.equal(args.install, true);
    assert.equal(args.yes, true);
    assert.deepEqual(parseCliArgs(["--minimal"]).modules, []);
    assert.equal(parseCliArgs(["--all"]).modules?.length, 6);
  });

  it("rejects conflicting or unknown values", () => {
    assert.throws(() => parseCliArgs(["--all", "--minimal"]), /only one/);
    assert.throws(() => parseCliArgs(["--modules", "auth,payments"]), /Unknown module\(s\): payments/);
    assert.throws(() => parseCliArgs(["--pm", "yarn"]), /Unknown package manager/);
    assert.throws(() => parseCliArgs(["--supabase", "cloud"]), /Unknown Supabase target/);
    assert.throws(() => parseCliArgs(["a", "b"]), /at most one directory/);
  });
});

describe("package manager detection", () => {
  it("reads npm_config_user_agent", () => {
    assert.equal(detectPackageManager("pnpm/11.10.0 npm/? node/v24.0.0 win32 x64"), "pnpm");
    assert.equal(detectPackageManager("npm/11.0.0 node/v24.0.0 linux x64"), "npm");
    assert.equal(detectPackageManager("bun/1.3.0"), "bun");
    assert.equal(detectPackageManager(""), undefined);
  });
});
