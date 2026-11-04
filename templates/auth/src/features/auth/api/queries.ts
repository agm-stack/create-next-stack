import { queryOptions } from "@tanstack/react-query";
import { useEffect } from "react";

import { useQuery, useQueryClient } from "@/lib/react-query";
import { createClient } from "@/lib/supabase/client";

import type { User } from "../types";

export const authQueries = {
  all: () => ["auth"] as const,
  user: () =>
    queryOptions({
      queryKey: [...authQueries.all(), "user"] as const,
      queryFn: async (): Promise<User | null> => (await createClient().auth.getUser()).data.user,
      staleTime: Infinity,
    }),
};

/** The signed-in user in client components, kept in sync with auth state changes. */
export function useUser() {
  const queryClient = useQueryClient();

  // Shared and cached by React Query: any number of useUser() callers (and
  // remounts) result in a single getUser() request.
  const { data: user = null, isPending } = useQuery(authQueries.user());

  // Keep the cache in sync with sign in/out and token refresh, no request needed.
  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(authQueries.user().queryKey, session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return {
    isAuthenticated: Boolean(user),
    isLoading: isPending,
    user,
  };
}
