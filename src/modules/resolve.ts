import { MODULE_IDS } from "./types.ts";

import type { ModuleId, ModuleManifest } from "./types.ts";

export type ResolvedModules = {
  /** Enabled modules in canonical order (`MODULE_IDS`). Always contains `base`. */
  enabled: ModuleId[],
  /** Modules that were not selected but are required by a selected one. */
  implied: { id: ModuleId, requiredBy: ModuleId[] }[]
};

export function resolveModules(selected: Iterable<ModuleId>, registry: Record<ModuleId, ModuleManifest>): ResolvedModules {
  const explicit = new Set<ModuleId>(selected);
  explicit.add("base");

  const enabled = new Set<ModuleId>();
  const requiredBy = new Map<ModuleId, Set<ModuleId>>();

  const visit = (id: ModuleId, parent?: ModuleId) => {
    if (parent && !explicit.has(id)) {
      const parents = requiredBy.get(id) ?? new Set<ModuleId>();
      parents.add(parent);
      requiredBy.set(id, parents);
    }

    if (enabled.has(id)) {
      return;
    }

    enabled.add(id);

    for (const dependency of registry[id].requires) {
      visit(dependency, id);
    }
  };

  for (const id of explicit) {
    visit(id);
  }

  const ordered = MODULE_IDS.filter((id) => enabled.has(id));

  return {
    enabled: ordered,
    implied: ordered
      .filter((id) => requiredBy.has(id))
      .map((id) => ({ id, requiredBy: MODULE_IDS.filter((parent) => requiredBy.get(id)?.has(parent)) })),
  };
}
