import { useTranslations } from "next-intl";

export const useText = useTranslations;
export type Translator = ReturnType<typeof useText>;