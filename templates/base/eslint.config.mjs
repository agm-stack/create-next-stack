import agm from "@agm-stack/eslint-config-next";
import next from "@agm-stack/eslint-config-next/next";
import tailwind from "@agm-stack/eslint-config-next/tailwind";
// @if react-query
import pluginQuery from "@tanstack/eslint-plugin-query";
// @endif
// @if i18n
import { defineConfig, globalIgnores } from "eslint/config";
// @else
import { defineConfig } from "eslint/config";
// @endif

const config = defineConfig([
  // @if i18n
  globalIgnores(["messages/**/*.d.json.ts"]),
  // @endif
  agm.configs.recommended,
  // @if i18n
  // next-intl loads the request config through its default export.
  next({ defaultExportFiles: ["src/i18n/request.ts"] }),
  // @else
  next(),
  // @endif
  tailwind({ cssConfigPath: "./src/styles/index.css" }),
  // @if i18n
  agm.configs.i18n,
  // @endif
  // @if react-query
  pluginQuery.configs["flat/recommended"],
  // @endif
]);

export default config;
