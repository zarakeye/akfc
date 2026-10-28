import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"

import { appRouter } from "@backend/modules"
import { createTRPCContext } from "@backend/trpc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const handler = async (req: NextRequest): Promise<Response> => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createTRPCContext({ req }),
    // Seules les erreurs imprévues sont journalisées : un refus (FORBIDDEN, NOT_FOUND…) est un
    // résultat normal. L'entrée n'est jamais écrite (elle peut contenir un mot de passe).
    onError({ error, path }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[trpc] ${path ?? "?"} :`, error.cause ?? error)
      }
    },
  })
}

export { handler as GET, handler as POST }