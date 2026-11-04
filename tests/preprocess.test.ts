import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  TemplateError, collectAtoms, evaluate, hasDirectives, preprocess
} from "../src/generator/preprocess.ts";

import type { PreprocessContext } from "../src/generator/preprocess.ts";
import type { ModuleId } from "../src/modules/types.ts";

function context(
  modules: ModuleId[],
  pm: PreprocessContext["pm"] = "pnpm",
  supabaseTarget: PreprocessContext["supabaseTarget"] = "remote",
): PreprocessContext {
  return { modules: new Set<ModuleId>(["base", ...modules]), pm, supabaseTarget };
}

const lines = (...values: string[]) => values.join("\n");

describe("evaluate", () => {
  it("checks module atoms", () => {
    assert.equal(evaluate("auth", context(["auth"])), true);
    assert.equal(evaluate("auth", context([])), false);
  });

  it("supports and, or, not and parentheses with the usual precedence", () => {
    const ctx = context(["auth"]);

    assert.equal(evaluate("auth and legal", ctx), false);
    assert.equal(evaluate("auth or legal", ctx), true);
    assert.equal(evaluate("not legal", ctx), true);
    assert.equal(evaluate("not (auth or cloudflare)", ctx), false);
    assert.equal(evaluate("legal or auth and not cloudflare", ctx), true);
  });

  it("checks the package manager", () => {
    assert.equal(evaluate("pm:pnpm", context([], "pnpm")), true);
    assert.equal(evaluate("pm:npm", context([], "pnpm")), false);
  });

  it("checks the Supabase target only when the supabase module is on", () => {
    assert.equal(evaluate("supabase:remote", context(["supabase"])), true);
    assert.equal(evaluate("supabase:local", context(["supabase"], "pnpm", "local")), true);
    assert.equal(evaluate("supabase:local", context(["supabase"])), false);
    assert.equal(evaluate("supabase:remote or supabase:local", context([])), false);
  });

  it("rejects unknown atoms and malformed expressions", () => {
    assert.throws(() => evaluate("auht", context([])), /Unknown condition "auht"/);
    assert.throws(() => evaluate("auth and", context([])), /Unexpected end/);
    assert.throws(() => evaluate("(auth", context([])), /Missing "\)"/);
    assert.throws(() => evaluate("auth legal", context([])), /Unexpected "legal"/);
    assert.throws(() => evaluate("", context([])), /Empty expression/);
  });
});

describe("preprocess", () => {
  it("keeps the active branch and removes directive lines", () => {
    const source = lines("a", "// @if auth", "b", "// @else", "c", "// @endif", "d");

    assert.equal(preprocess(source, context(["auth"]), "f"), lines("a", "b", "d"));
    assert.equal(preprocess(source, context([]), "f"), lines("a", "c", "d"));
  });

  it("supports nesting", () => {
    const source = lines("// @if auth", "a", "// @if legal", "b", "// @endif", "c", "// @endif");

    assert.equal(preprocess(source, context(["auth"]), "f"), lines("a", "c"));
    assert.equal(preprocess(source, context(["auth", "legal"]), "f"), lines("a", "b", "c"));
    assert.equal(preprocess(source, context(["legal"]), "f"), "");
  });

  it("recognizes every comment style", () => {
    const styles = [
      ["// @if auth", "// @endif"],
      ["# @if auth", "# @endif"],
      ["-- @if auth", "-- @endif"],
      ["<!-- @if auth -->", "<!-- @endif -->"],
      ["{/* @if auth */}", "{/* @endif */}"],
      ["/* @if auth */", "/* @endif */"],
    ];

    for (const [open, close] of styles) {
      assert.equal(preprocess(lines("x", `  ${open}`, "y", `  ${close}`), context([]), "f"), "x", open);
    }
  });

  it("collapses blank lines left by removed blocks", () => {
    const source = lines("a", "", "// @if auth", "b", "// @endif", "", "c");

    assert.equal(preprocess(source, context([]), "f"), lines("a", "", "c"));
  });

  it("drops a blank line left before a closing bracket", () => {
    const source = lines("{", "  a,", "", "  // @if auth", "  b,", "  // @endif", "}");

    assert.equal(preprocess(source, context([]), "f"), lines("{", "  a,", "}"));
  });

  it("keeps CRLF line endings", () => {
    assert.equal(preprocess("a\r\n// @if auth\r\nb\r\n// @endif\r\nc", context([]), "f"), "a\r\nc");
  });

  it("reports unbalanced directives with the file and line", () => {
    assert.throws(() => preprocess(lines("// @if auth", "a"), context([]), "file.ts"), (error: unknown) => {
      assert.ok(error instanceof TemplateError);
      assert.match(error.message, /^file\.ts:1: @if without a matching @endif/);

      return true;
    });
    assert.throws(() => preprocess("// @endif", context([]), "f"), /@endif without a matching @if/);
    assert.throws(() => preprocess(lines("// @if auth", "// @else", "// @else", "// @endif"), context([]), "f"), /Duplicate @else/);
  });

  it("does not treat ordinary comments as directives", () => {
    const source = lines("// if auth is on", "// @iffy", "# Configure @if needed");

    assert.equal(hasDirectives(source), false);
    assert.equal(preprocess(source, context([]), "f"), source);
  });
});

describe("collectAtoms", () => {
  it("lists every atom used by @if lines", () => {
    assert.deepEqual(collectAtoms(lines("// @if auth and not (legal or pm:npm)", "// @endif")), ["auth", "legal", "pm:npm"]);
  });
});
