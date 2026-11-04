import { registry } from "../modules/registry.ts";

import { getContext, getPlaceholders } from "./options.ts";
import { substitute } from "./placeholders.ts";
import { evaluate } from "./preprocess.ts";

import type { ProjectOptions } from "./options.ts";
import type { Step } from "../modules/types.ts";

export type NextStepsContext = {
  /** Directory to `cd` into, relative to where the CLI ran. Omitted in the README. */
  directory?: string,
  /** Whether dependencies still need to be installed. */
  needsInstall: boolean
};

export type Checklists = {
  /** Get the project running locally, in order. */
  nextSteps: string[],
  /** Before going live: hosted services, reviews, deployment. */
  launchSteps: string[]
};

/**
 * The checklists printed after generation and written to the README. Steps
 * contain Markdown code spans; the CLI colors them.
 */
export function getChecklists(options: ProjectOptions, context: NextStepsContext): Checklists {
  const placeholders = getPlaceholders(options);
  const conditionContext = getContext(options);
  // Drops steps whose condition does not hold, then substitutes placeholders.
  const resolve = (steps: Step[] | undefined): string[] => (steps ?? []).flatMap((step) => {
    if (typeof step === "string") {
      return [render(step)];
    }

    return evaluate(step.when, conditionContext) ? [render(step.text)] : [];
  });
  const render = (text: string) => substitute(text, placeholders, "next steps");
  const manifests = options.modules.map((id) => registry[id]);
  // Module tips first, then the base project's general ones.
  const afterDev = [...manifests.filter((manifest) => manifest.id !== "base"), ...manifests.filter((manifest) => manifest.id === "base")];
  const nextSteps: string[] = [];

  if (context.directory) {
    nextSteps.push(`Open the project: \`cd ${context.directory}\`.`);
  }

  if (context.needsInstall) {
    nextSteps.push(render("Install dependencies: `__PM_INSTALL__`."));
  }

  nextSteps.push(
    "Copy `.env.example` to `.env.local` and fill in the values.",
    ...manifests.flatMap((manifest) => resolve(manifest.setupSteps)),
    render("Start the dev server with `__PM_RUN__ dev` and open http://localhost:__DEV_PORT__."),
    ...afterDev.flatMap((manifest) => resolve(manifest.nextSteps)),
  );

  return {
    nextSteps,
    launchSteps: manifests.flatMap((manifest) => resolve(manifest.launchSteps)),
  };
}
