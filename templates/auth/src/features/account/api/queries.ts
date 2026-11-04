import { queryOptions } from "@tanstack/react-query";

import { getUserPreferences } from "./service";

export const accountQueries = {
  all: () => ["account"] as const,
  // Keyed by user so cached preferences never carry over to another account.
  preferences: (userId: string | undefined) =>
    queryOptions({
      queryKey: [...accountQueries.all(), "preferences", userId ?? null] as const,
      queryFn: getUserPreferences,
      enabled: Boolean(userId),
      staleTime: Infinity,
    }),
};
