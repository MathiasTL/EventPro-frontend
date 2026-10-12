"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/entities/auth/context";
import { ApiRequestError } from "@/shared/api/client";

const NO_RETRY_STATUSES = [401, 403, 404];

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiRequestError && NO_RETRY_STATUSES.includes(error.status)) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

/** Cached data is per user: drop it on logout and when another user signs in, so it never leaks across sessions. */
function SessionCacheReset() {
  const queryClient = useQueryClient();
  const userId = useAuth().user?.id ?? null;
  const previous = useRef(userId);

  useEffect(() => {
    const before = previous.current;
    previous.current = userId;
    if (before === userId) return;
    if (userId === null) queryClient.clear();
    // Another user without a logout in between (e.g. a login in another tab): mounted queries must refetch.
    else if (before !== null) void queryClient.resetQueries();
  }, [userId, queryClient]);

  return null;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return (
    <QueryClientProvider client={client}>
      <SessionCacheReset />
      {children}
    </QueryClientProvider>
  );
}
