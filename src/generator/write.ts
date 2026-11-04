import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PlannedFile } from "./plan.ts";

/** Returns an error message when `directory` exists and is not empty. */
export function checkTargetDirectory(directory: string): string | undefined {
  if (!existsSync(directory)) {
    return undefined;
  }

  const entries = readdirSync(directory).filter((entry) => entry !== ".git" && entry !== ".DS_Store");

  return entries.length > 0 ? `${directory} already exists and is not empty.` : undefined;
}

export function writeProject(files: readonly PlannedFile[], directory: string): void {
  const error = checkTargetDirectory(directory);

  if (error) {
    throw new Error(error);
  }

  for (const file of files) {
    const target = join(directory, ...file.path.split("/"));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }
}
