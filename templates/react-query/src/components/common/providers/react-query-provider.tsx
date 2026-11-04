"use client";

import {
  QueryClientProvider,
  environmentManager
} from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useState } from "react";

import { setGlobalVariable } from "@/lib/global-variables";
import { createClientQueryClient, getServerQueryClient } from "@/lib/react-query";
import { LocalStorage, localStorageKeys } from "@/lib/storage";
import { isClient } from "@/utils/browser";

import type { QueryClient } from "@tanstack/react-query";

type Props = {
  children?: React.ReactNode
};

function isDevtoolsEnabled() {
  return isClient() ? !!LocalStorage.get(localStorageKeys.reactQueryDevTools) : false;
}

export function QueryProvider(props: Props) {

  const { children } = props;
  const queryClient = getQueryClient();
  const [showQueryDevTools, setShowQueryDevTools] = useState(false);

  useEffect(() => {
    const updateDevToolsVisibility = () => {
      setShowQueryDevTools(isDevtoolsEnabled());
    };

    // The preference lives in localStorage, so it can only be read after hydration.
    updateDevToolsVisibility();

    // Console toggle: `_app.setReactQueryDevTools(true)`
    setGlobalVariable("setReactQueryDevTools", (opened?: boolean) => {
      LocalStorage.set(localStorageKeys.reactQueryDevTools, !!opened);
      updateDevToolsVisibility();
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showQueryDevTools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

const ReactQueryDevtoolsProduction = lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    return getServerQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = createClientQueryClient();
    return browserQueryClient;
  }
}