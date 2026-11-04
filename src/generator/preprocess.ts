import type { ModuleId, PackageManager, SupabaseTarget } from "../modules/types.ts";

/**
 * Line-based conditional preprocessor for template files.
 *
 * A directive is a whole line whose only content is a comment holding
 * `@if <expr>`, `@else` or `@endif`, in any of these comment styles:
 *
 *   // @if auth            # @if cloudflare        -- @if supabase
 *   <!-- @if legal -->     {/* @if i18n *\/}      /* @if auth *\/
 *
 * Directive lines and the lines of inactive branches are removed; no line is
 * ever edited. Expressions combine module ids, `pm:<name>` and
 * `supabase:<target>` atoms with `and`, `or`, `not` and parentheses.
 * `supabase:local` and `supabase:remote` are false when the supabase module
 * is off.
 */

export type PreprocessContext = {
  modules: ReadonlySet<ModuleId>,
  pm: PackageManager,
  supabaseTarget: SupabaseTarget
};

export class TemplateError extends Error {
  constructor(file: string, line: number, message: string) {
    super(`${file}:${line}: ${message}`);
    this.name = "TemplateError";
  }
}

const DIRECTIVE = /^\s*(?:\/\/|#|--|<!--|\{\/\*|\/\*)\s*@(if|else|endif)\b(.*?)\s*(?:-->|\*\/\}|\*\/)?\s*$/;

export const KNOWN_ATOMS: ReadonlySet<string> = new Set<string>([
  "base",
  "react-query",
  "i18n",
  "supabase",
  "auth",
  "legal",
  "cloudflare",
  "pm:pnpm",
  "pm:npm",
  "pm:bun",
  "supabase:local",
  "supabase:remote",
]);

type Token = { type: "atom", value: string } | { type: "op", value: "and" | "or" | "not" | "(" | ")" };

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];

  for (const raw of expression.replaceAll("(", " ( ").replaceAll(")", " ) ").split(/\s+/)) {
    if (!raw) {
      continue;
    }

    if (raw === "and" || raw === "or" || raw === "not" || raw === "(" || raw === ")") {
      tokens.push({ type: "op", value: raw });
    } else {
      tokens.push({ type: "atom", value: raw });
    }
  }

  return tokens;
}

/** Throws a plain `Error` on syntax errors or unknown atoms. */
export function evaluate(expression: string, context: PreprocessContext): boolean {
  const tokens = tokenize(expression);
  let position = 0;

  const peek = () => tokens[position];

  function parseOr(): boolean {
    let value = parseAnd();

    while (peek()?.value === "or") {
      position++;
      const right = parseAnd();
      value = value || right;
    }

    return value;
  }

  function parseAnd(): boolean {
    let value = parseNot();

    while (peek()?.value === "and") {
      position++;
      const right = parseNot();
      value = value && right;
    }

    return value;
  }

  function parseNot(): boolean {
    if (peek()?.value === "not") {
      position++;

      return !parseNot();
    }

    return parsePrimary();
  }

  function parsePrimary(): boolean {
    const token = tokens[position++];

    if (!token) {
      throw new Error(`Unexpected end of expression "${expression}"`);
    }

    if (token.value === "(") {
      const value = parseOr();

      if (tokens[position++]?.value !== ")") {
        throw new Error(`Missing ")" in expression "${expression}"`);
      }

      return value;
    }

    if (token.type !== "atom") {
      throw new Error(`Unexpected "${token.value}" in expression "${expression}"`);
    }

    if (!KNOWN_ATOMS.has(token.value)) {
      throw new Error(`Unknown condition "${token.value}" in expression "${expression}"`);
    }

    if (token.value.startsWith("pm:")) {
      return token.value === `pm:${context.pm}`;
    }

    if (token.value.startsWith("supabase:")) {
      return context.modules.has("supabase") && token.value === `supabase:${context.supabaseTarget}`;
    }

    return context.modules.has(token.value as ModuleId);
  }

  if (tokens.length === 0) {
    throw new Error("Empty expression");
  }

  const result = parseOr();

  if (position !== tokens.length) {
    throw new Error(`Unexpected "${tokens[position]?.value}" in expression "${expression}"`);
  }

  return result;
}

type Frame = {
  /** Whether the enclosing scope is active. */
  parentActive: boolean,
  /** Whether the current branch is active. */
  active: boolean,
  seenElse: boolean,
  line: number
};

export function hasDirectives(source: string): boolean {
  return source.split(/\r?\n/).some((line) => DIRECTIVE.test(line));
}

export function preprocess(source: string, context: PreprocessContext, file: string): string {
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r?\n/);
  const output: string[] = [];
  const stack: Frame[] = [];
  let removedSinceLastKept = false;

  const isActive = () => stack.at(-1)?.active ?? true;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const match = DIRECTIVE.exec(line);

    if (match) {
      const [, keyword, rest = ""] = match;
      const expression = rest.trim();
      removedSinceLastKept = true;

      if (keyword === "if") {
        const parentActive = isActive();
        let value: boolean;

        try {
          value = evaluate(expression, context);
        } catch (error) {
          throw new TemplateError(file, lineNumber, (error as Error).message);
        }

        stack.push({ parentActive, active: parentActive && value, seenElse: false, line: lineNumber });

        return;
      }

      const frame = stack.at(-1);

      if (!frame) {
        throw new TemplateError(file, lineNumber, `@${keyword} without a matching @if`);
      }

      if (expression) {
        throw new TemplateError(file, lineNumber, `@${keyword} does not take an expression`);
      }

      if (keyword === "else") {
        if (frame.seenElse) {
          throw new TemplateError(file, lineNumber, "Duplicate @else");
        }

        frame.seenElse = true;
        // The else branch is active when the parent is active and the if branch was not.
        frame.active = frame.parentActive && !frame.active;

        return;
      }

      stack.pop();

      return;
    }

    if (!isActive()) {
      removedSinceLastKept = true;

      return;
    }

    // Removing a block can leave two blank lines next to each other, or a blank
    // line right after an opening line. Drop the extra blank line.
    if (removedSinceLastKept && line.trim() === "") {
      const previous = output.at(-1);

      if (previous === undefined || previous.trim() === "" || /[[{(]\s*$/.test(previous)) {
        return;
      }
    }

    // A block removed right before a closing bracket can leave a dangling blank line.
    if (removedSinceLastKept && /^\s*[\]})]/.test(line) && output.at(-1)?.trim() === "") {
      output.pop();
    }

    output.push(line);
    removedSinceLastKept = false;
  });

  const unclosed = stack.at(-1);

  if (unclosed) {
    throw new TemplateError(file, unclosed.line, "@if without a matching @endif");
  }

  return output.join(newline);
}

/** Returns every atom used by directives in `source`, for template integrity checks. */
export function collectAtoms(source: string): string[] {
  const atoms: string[] = [];

  for (const line of source.split(/\r?\n/)) {
    const match = DIRECTIVE.exec(line);

    if (match?.[1] === "if") {
      for (const token of tokenize(match[2] ?? "")) {
        if (token.type === "atom") {
          atoms.push(token.value);
        }
      }
    }
  }

  return atoms;
}
