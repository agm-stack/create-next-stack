/**
 * `npm start -- [args]`: rebuilds the CLI, then runs it like a user would.
 *
 * npm runs scripts from the package root, so the CLI is started in the folder
 * you called `npm start` from (INIT_CWD). Called from the repository root, it
 * runs inside the gitignored `.e2e/` folder instead, so generated projects
 * never end up in the repository.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const build = spawnSync("npm run build --silent", { cwd: root, shell: true, stdio: "inherit" });

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

let cwd = resolve(process.env.INIT_CWD ?? process.cwd());

if (cwd === root) {
  cwd = join(root, ".e2e");
  mkdirSync(cwd, { recursive: true });
  console.log(`Running in ${cwd} (gitignored) to keep generated projects out of the repository.\n`);
}

const result = spawnSync(process.execPath, [join(root, "dist", "cli.js"), ...process.argv.slice(2)], { cwd, stdio: "inherit" });

process.exit(result.status ?? 1);
