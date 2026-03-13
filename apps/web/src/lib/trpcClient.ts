"use client"

import { createTRPCReact } from "@trpc/react-query"
import { httpBatchLink, createTRPCClient } from "@trpc/client"
import superjson from "superjson"

import type { AppRouter } from "@akfc/backend/routers"

export const trpc = createTRPCReact<AppRouter>()

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          })
        },
      }),
    ],
  })
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        })
      },
    }),
  ],
})