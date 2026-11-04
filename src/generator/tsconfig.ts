import { registry } from "../modules/registry.ts";

import { toJson } from "./json-merge.ts";

import type { ProjectOptions } from "./options.ts";

const BASE_TSCONFIG = {
  compilerOptions: {
    target: "ES2017",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    allowArbitraryExtensions: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "react-jsx",
    incremental: true,
    plugins: [{ name: "next" }],
    paths: {
      "@/*": ["./src/*"],
    },
  },
  include: [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts",
  ],
  exclude: ["node_modules"],
};

/** Modules append entries to `include`; other keys are not patched. */
export function renderTsconfig(options: ProjectOptions): string {
  const tsconfig = structuredClone(BASE_TSCONFIG);

  for (const id of options.modules) {
    const include = registry[id].tsconfig?.include;

    if (Array.isArray(include)) {
      tsconfig.include.push(...(include as string[]));
    }
  }

  return toJson(tsconfig);
}
