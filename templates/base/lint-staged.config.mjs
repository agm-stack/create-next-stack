import path from "node:path";

// Windows limits a command line to ~8k characters. With long route paths such as
// "src/app/(auth)/api/auth/otp/verify/route.ts" a large commit overflows it, so the
// staged files are split into small batches and passed as relative paths.
const BATCH_SIZE = 20;

function toBatches(files) {
  const relative = files.map((file) => path.relative(process.cwd(), file).replace(/\\/g, "/"));
  const batches = [];

  for (let index = 0; index < relative.length; index += BATCH_SIZE) {
    batches.push(relative.slice(index, index + BATCH_SIZE));
  }

  return batches;
}

const quote = (file) => `"${file}"`;

const config = {
  "*.{cjs,js,mjs,ts,tsx}": (files) =>
    toBatches(files).map((batch) => `eslint --fix ${batch.map(quote).join(" ")}`),
  "**/*.css": (files) =>
    toBatches(files).map((batch) => `stylelint --fix ${batch.map(quote).join(" ")}`),
};

export default config;
