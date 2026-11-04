import { createTranslator } from "./translator";

import type { Namespace, Translator } from "./translator";

/** Async server code: `const t = await getText("common");`. */
export function getText(namespace?: Namespace): Promise<Translator> {
  return Promise.resolve(createTranslator(namespace));
}
