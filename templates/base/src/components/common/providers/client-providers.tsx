"use client";

import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

// @if react-query
import { QueryProvider } from "./react-query-provider";

// @endif
export function ClientProviders({ children }: { children: React.ReactNode }) {
  // @if react-query
  return (
    <QueryProvider>
      <ToastProvider>
        <AnchoredToastProvider>{children}</AnchoredToastProvider>
      </ToastProvider>
    </QueryProvider>
  );
  // @else
  return (
    <ToastProvider>
      <AnchoredToastProvider>{children}</AnchoredToastProvider>
    </ToastProvider>
  );
  // @endif
}
