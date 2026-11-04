"use client";

import { useEffect } from "react";

import { ErrorScreen } from "@/components/common/error-screen";

import commonMessages from "../../messages/en/common.json";

import "@/styles/index.css";

// global-error replaces the root layout, so the app providers (and next-intl)
// are not available. The copy is read straight from the messages file instead.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string },
  reset: () => void
}) {
  const t = commonMessages.errorPage;

  useEffect(() => {
    console.error("Unhandled root error", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorScreen
          description={t.description}
          homeLabel={t.home}
          retryLabel={t.retry}
          title={t.title}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
