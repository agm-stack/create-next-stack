import {
  QueryClient,
  useMutation as useMutationHook,
  useQueryClient as useQueryClientHook,
  useQuery as useQueryHook
} from "@tanstack/react-query";
import { cache } from "react";

import { appConfig } from "@/config";

import { HTTP_STATUS_CODES, isHttpClientError } from "@/lib/http";

import type { QueryClientConfig } from "@tanstack/react-query";

export const useMutation = useMutationHook;
export const useQuery = useQueryHook;
export const useQueryClient = useQueryClientHook;

export function createClientQueryClient(config: QueryClientConfig = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: appConfig.queries.client.staleTime,
        retry: appConfig.queries.client.retries
      }
    },
    ...config
  });
}

/** One QueryClient per request — shared across layout, pages, and nested server components. */
export const getServerQueryClient = cache(() => createServerQueryClient());

export function createServerQueryClient(config: QueryClientConfig = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: appConfig.queries.server.staleTime,
        retry: (failureCount, error) => {
          if (failureCount >= appConfig.queries.server.retries) return false;
          if (isHttpClientError(error)) {
            const status = error.response?.status;
            if (!status) return false;

            const isServerError = status >= 500 && status < 600;
            const isRateLimitError = status === HTTP_STATUS_CODES.TOO_MANY_REQUESTS;

            return isServerError || isRateLimitError;
          }
          return false;
        },
        retryDelay: appConfig.queries.server.retryDelay
      },
    },
    ...config
  });
}
