"use client";

import { useEffect } from "react";

import { ErrorScreen } from "@/components/common/error-screen";
import { useText } from "@/hooks/use-text";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string },
  reset: () => void
}) {
  const t = useText("common.errorPage");

  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <ErrorScreen
      description={t("description")}
      homeLabel={t("home")}
      retryLabel={t("retry")}
      title={t("title")}
      onRetry={reset}
    />
  );
}
