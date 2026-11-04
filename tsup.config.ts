import { defineConfig } from "tsup";

// One self-contained ESM file: prompts and colors are bundled so `npm create`
// downloads a single small package with no runtime dependencies.
export default defineConfig({
  entry: { cli: "src/cli.ts" },
  format: "esm",
  target: "node24",
  platform: "node",
  outDir: "dist",
  clean: true,
  minify: false,
  sourcemap: false,
  splitting: false,
  noExternal: [/.*/],
  banner: { js: "#!/usr/bin/env node" },
});
