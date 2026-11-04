import agm from "@agm-stack/eslint-config-next";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Templates are linted inside the generated projects (see scripts/e2e.ts).
  globalIgnores(["templates/**", "dist/**", "tests/fixtures/**", "tests/**/*.snapshot", ".e2e/**"]),
  agm.configs.typescript,
  {
    // Tool configs are loaded through their default export.
    files: ["eslint.config.js", "tsup.config.ts", "commitlint.config.js"],
    rules: { "import/no-default-export": "off" },
  },
  {
    // Development scripts report progress on the console.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
]);
