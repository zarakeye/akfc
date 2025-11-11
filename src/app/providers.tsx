'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { trpc, getTrpcClient } from '@lib/trpcClient';
import { JSX, useState } from 'react';

/**
 * Provides the QueryClient and TRPC client to the application.
 * It also renders the React Query Devtools component.
 * 
 * @param {React.ReactNode} children The children of the component.
 * @returns {JSX.Element} A JSX element containing the QueryClient and TRPC client providers, and the React Query Devtools component.
 */
export function AppProviders({ children }: { children: React.ReactNode }): JSX.Element {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => getTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}