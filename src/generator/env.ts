import { registry } from "../modules/registry.ts";

import { getContext, getPlaceholders } from "./options.ts";
import { substitute } from "./placeholders.ts";
import { evaluate } from "./preprocess.ts";

import type { ProjectOptions } from "./options.ts";
import type { EnvVar } from "../modules/types.ts";

function renderGroup(title: string, variables: EnvVar[], render: (text: string) => string): string[] {
  if (variables.length === 0) {
    return [];
  }

  const lines = [`# ${title}`, ""];

  for (const variable of variables) {
    if (variable.comment) {
      lines.push(`# ${render(variable.comment)}`);
    }

    lines.push(`${variable.name}=${render(variable.value ?? "")}`, "");
  }

  return lines;
}

/**
 * Builds `.env.example`: names and safe defaults only, never secrets. Public
 * variables come first, server-only secrets after them.
 */
export function renderEnvExample(options: ProjectOptions): string {
  const placeholders = getPlaceholders(options);
  const render = (text: string) => substitute(text, placeholders, ".env.example");
  const context = getContext(options);
  const variables = options.modules
    .flatMap((id) => registry[id].env ?? [])
    .filter((variable) => !variable.when || evaluate(variable.when, context));

  const lines = [
    "# Copy this file to .env.local and fill in the values. Never commit .env.local.",
    "",
    ...renderGroup("Public (exposed to the browser)", variables.filter((variable) => !variable.server && !variable.tooling), render),
    ...renderGroup("Server only (secrets)", variables.filter((variable) => variable.server), render),
    ...renderGroup("Tooling (read by scripts, not by the app)", variables.filter((variable) => variable.tooling), render),
  ];

  return `${lines.join("\n").trimEnd()}\n`;
}
