/**
 * Runs Supabase CLI commands against the database SUPABASE_TARGET points at:
 *
 *   remote  the hosted project linked with `__PM_RUN__ db:link` (default)
 *   local   the Docker stack started with `__PM_RUN__ db:start`
 *
 * SUPABASE_TARGET is read from the environment, then .env.local, then .env.
 *
 * Usage: node scripts/supabase.mjs <types|migrate|reset>
 */
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const DEFAULT_TARGET = "__SUPABASE_TARGET__";
const TYPES_FILE = "src/types/database.ts";

// Earlier files win: loadEnvFile never overrides a variable that is already set.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

const target = (process.env.SUPABASE_TARGET || DEFAULT_TARGET).trim().toLowerCase();
const command = process.argv[2];

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function info(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * Runs a fixed command line. A shell is needed so Windows finds the
 * `supabase.cmd` and `eslint.cmd` shims; never pass user input here.
 */
function run(commandLine, { capture = false } = {}) {
  const result = spawnSync(commandLine, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
    stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit",
  });

  if (result.status !== 0) {
    fail(`${commandLine} failed.`);
  }

  return result.stdout ?? "";
}

if (target !== "local" && target !== "remote") {
  fail(`SUPABASE_TARGET must be "local" or "remote", got "${target}".`);
}

if (target === "remote" && !existsSync("supabase/.temp/project-ref")) {
  fail("No linked Supabase project. Run `__PM_RUN__ db:link` first, or set SUPABASE_TARGET=local.");
}

const scope = target === "local" ? "--local" : "--linked";

info(`Supabase target: ${target}`);

switch (command) {
  case "types": {
    const types = run(`supabase gen types typescript ${scope} --schema public`, { capture: true });
    writeFileSync(TYPES_FILE, types);
    // The CLI output is not formatted for this project's lint rules.
    run(`eslint --fix ${TYPES_FILE}`);
    info(`Wrote ${TYPES_FILE}.`);
    break;
  }

  case "migrate": {
    run(target === "local" ? "supabase migration up --local" : "supabase db push");
    break;
  }

  case "reset": {
    if (target === "remote") {
      fail("Refusing to reset the hosted database: it deletes all of its data. "
        + "Run `supabase db reset --linked` yourself if you really mean it.");
    }

    run("supabase db reset --local");
    break;
  }

  default:
    fail(`Unknown command "${command ?? ""}". Use types, migrate or reset.`);
}
