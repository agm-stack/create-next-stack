import { spawnSync } from "node:child_process";

import type { PackageManager } from "./modules/types.ts";

type CommandResult = { ok: boolean, output: string };

type RunOptions = { inherit?: boolean, env?: NodeJS.ProcessEnv };

function toResult(result: ReturnType<typeof spawnSync>): CommandResult {
  return {
    ok: result.status === 0,
    output: `${result.stdout?.toString() ?? ""}${result.stderr?.toString() ?? ""}`.trim(),
  };
}

/** Runs an executable directly, so arguments with spaces stay intact. */
function run(command: string, args: string[], cwd: string, options: RunOptions = {}): CommandResult {
  return toResult(spawnSync(command, args, {
    cwd,
    env: options.env ?? process.env,
    stdio: options.inherit ? "inherit" : "pipe",
    encoding: "utf8",
  }));
}

/**
 * Runs a fixed command line through the shell. Needed for package managers,
 * whose Windows shims (`pnpm.cmd`) only resolve through a shell. Never pass
 * user input here.
 */
function runShell(commandLine: string, cwd: string, options: RunOptions = {}): CommandResult {
  return toResult(spawnSync(commandLine, {
    cwd,
    env: options.env ?? process.env,
    shell: true,
    stdio: options.inherit ? "inherit" : "pipe",
    encoding: "utf8",
  }));
}

/** Detects the package manager that launched `create`, e.g. `pnpm create …`. */
export function detectPackageManager(userAgent = process.env.npm_config_user_agent ?? ""): PackageManager | undefined {
  if (userAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  if (userAgent.startsWith("bun")) {
    return "bun";
  }

  if (userAgent.startsWith("npm")) {
    return "npm";
  }

  return undefined;
}

export function isGitAvailable(): boolean {
  return run("git", ["--version"], process.cwd()).ok;
}

export function initGit(directory: string): CommandResult {
  return run("git", ["init", "-q", "-b", "main"], directory);
}

/**
 * Creates the initial commit. Hooks are skipped (HUSKY=0) because lint-staged
 * would lint every generated file; the scaffold is already lint-clean.
 */
export function commitAll(directory: string, message: string): CommandResult {
  const env = { ...process.env, HUSKY: "0" };
  const added = run("git", ["add", "-A"], directory, { env });

  if (!added.ok) {
    return added;
  }

  return run("git", ["commit", "-q", "-m", message], directory, { env });
}

export function installDependencies(directory: string, pm: PackageManager): boolean {
  return runShell(`${pm} install`, directory, { inherit: true }).ok;
}
