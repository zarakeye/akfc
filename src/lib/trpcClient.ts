// src/lib/trpcClient.ts
'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/trpc';
import superjson from 'superjson';
import { createTRPCClient } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>();

// ✅ client pour hooks React
export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          }); 
        }
      }),
    ]
  })
}

// ✅ client vanilla utilisable dans Zustand, actions, utils
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(url, opts) {
        return fetch(url, {
          ...opts,
          credentials: "include",
        });
      },
    }),
  ],
});
