"use client";

import { toastManager } from "@/components/ui/toast";
import { useText } from "@/hooks/use-text";

import { getHttpErrorCategory } from "@/lib/http";

type RequestErrorToastOptions = {
  title?: string
};

export function useRequestErrorToast() {
  const t = useText("common");

  return (error: unknown, options: RequestErrorToastOptions = {}) => {
    const category = getHttpErrorCategory(error);

    toastManager.add({
      description: t(`apiErrors.${category}`),
      title: options.title ?? t("apiErrors.title"),
      type: "error",
    });
  };
}
