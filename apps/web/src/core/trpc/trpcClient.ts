"use client"

import { createTRPCReact } from "@trpc/react-query"
import { httpBatchLink, createTRPCClient } from "@trpc/client"
import superjson from "superjson"

import type { AppRouter } from "@backend/modules"

/** Un seul lien pour les deux clients : même adresse, même transformateur. */
const links = [
  httpBatchLink({
    url: "/api/trpc",
    transformer: superjson,
  }),
]

/** Hooks React (useQuery, useMutation, useUtils), branchés par AppProviders. */
export const trpc = createTRPCReact<AppRouter>()

export function getTrpcClient() {
  return trpc.createClient({ links })
}

/** Appels directs, hors des composants (adaptateurs du finder, formulaire de connexion). */
export const trpcClient = createTRPCClient<AppRouter>({ links })
