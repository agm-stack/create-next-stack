import { createTranslator } from "@/i18n/translator";

import type { Namespace, Translator } from "@/i18n/translator";

export type { Translator };

/** Client and server components: `const t = useText("common");`. */
export function useText(namespace?: Namespace): Translator {
  return createTranslator(namespace);
}
