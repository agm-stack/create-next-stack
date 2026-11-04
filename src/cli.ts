import { readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import * as p from "@clack/prompts";
import color from "picocolors";

import { HELP, parseCliArgs } from "./args.ts";
import { getChecklists } from "./generator/next-steps.ts";
import { findTemplatesRoot, planProject } from "./generator/plan.ts";
import { checkTargetDirectory, writeProject } from "./generator/write.ts";
import { registry } from "./modules/registry.ts";
import { resolveModules } from "./modules/resolve.ts";
import {
  commitAll, detectPackageManager, initGit, installDependencies, isGitAvailable
} from "./postinstall.ts";
import { collectAnswers, formatModuleList } from "./prompts.ts";

function readVersion(): string {
  const packageJson = join(findTemplatesRoot(), "..", "package.json");

  return (JSON.parse(readFileSync(packageJson, "utf8")) as { version: string }).version;
}

/** Turns Markdown code spans into colored text for the terminal. */
function formatStep(step: string): string {
  return step.replace(/`([^`]+)`/g, (_match, code: string) => color.cyan(code));
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(`${HELP}\n`);

    return;
  }

  if (args.version) {
    process.stdout.write(`${readVersion()}\n`);

    return;
  }

  p.intro(color.bgCyan(color.black(" create-next-stack ")));

  const answers = await collectAnswers(args, detectPackageManager());
  const target = resolve(answers.directory);
  const directoryError = checkTargetDirectory(target);

  if (directoryError) {
    throw new Error(`${directoryError} Choose another name or empty it first.`);
  }

  const { enabled, implied } = resolveModules(answers.modules, registry);

  for (const { id, requiredBy } of implied) {
    p.log.info(`Enabled ${color.cyan(id)} because ${requiredBy.join(", ")} ${requiredBy.length > 1 ? "require" : "requires"} it.`);
  }

  const files = planProject({
    name: answers.name,
    slug: answers.slug,
    description: answers.description,
    pm: answers.pm,
    port: answers.port,
    modules: enabled,
    supabaseTarget: answers.supabaseTarget,
  });

  p.note(
    [
      `${color.dim("Directory")}   ${relative(process.cwd(), target) || "."}`,
      `${color.dim("Package")}     ${answers.slug}`,
      `${color.dim("Name")}        ${answers.name}`,
      `${color.dim("Modules")}     ${formatModuleList(enabled.filter((id) => id !== "base"))}`,
      `${color.dim("Tooling")}     ${answers.pm}, port ${answers.port}`,
      ...(enabled.includes("supabase") ? [`${color.dim("Supabase")}    ${answers.supabaseTarget}`] : []),
    ].join("\n"),
    "Project",
  );

  if (args.dryRun) {
    p.log.message(files.map((file) => file.path).join("\n"));
    p.outro(`${files.length} files would be written. Dry run: nothing was written.`);

    return;
  }

  const spinner = p.spinner();
  spinner.start("Writing files");
  writeProject(files, target);
  spinner.stop(`Wrote ${files.length} files.`);

  const useGit = answers.git && isGitAvailable();

  if (answers.git && !useGit) {
    p.log.warn("git was not found, so no repository was created.");
  }

  // git init comes first so the husky `prepare` script can install hooks.
  if (useGit && !initGit(target).ok) {
    p.log.warn("git init failed; continuing without a repository.");
  }

  let installed = false;

  if (answers.install) {
    p.log.step(`Installing dependencies with ${answers.pm}`);
    installed = installDependencies(target, answers.pm);

    if (!installed) {
      p.log.warn(`Installing failed. Run ${color.cyan(`${answers.pm} install`)} in the project to retry.`);
    }
  }

  if (useGit) {
    const commit = commitAll(target, "chore: initial commit");

    if (commit.ok) {
      p.log.success("Created the initial commit.");
    } else {
      const reason = commit.output.split("\n")[0] ?? "unknown error";
      const hint = /identity|user\.(name|email)/i.test(commit.output)
        ? " Set git user.name and user.email, then commit the files yourself."
        : " The files are staged; commit them yourself.";

      p.log.warn(`Could not create the initial commit: ${reason}.${hint}`);
    }
  }

  const { launchSteps, nextSteps } = getChecklists(
    {
      name: answers.name,
      slug: answers.slug,
      description: answers.description,
      pm: answers.pm,
      port: answers.port,
      modules: enabled,
      supabaseTarget: answers.supabaseTarget,
    },
    { directory: relative(process.cwd(), target) || undefined, needsInstall: !installed },
  );

  p.note(nextSteps.map((step, index) => `${index + 1}. ${formatStep(step)}`).join("\n"), "Next steps");

  if (launchSteps.length > 0) {
    p.note(launchSteps.map((step) => `- ${formatStep(step)}`).join("\n"), "Before launch");
  }

  p.outro(`Done. Both checklists are in ${color.cyan("README.md")}.`);
}

main().catch((error: unknown) => {
  p.log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
