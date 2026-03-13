import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"

import { appRouter } from "@akfc/backend/routers"
import { createTRPCContext } from "@akfc/backend/trpc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const handler = async (req: NextRequest): Promise<Response> => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createTRPCContext({ req }),
  })
}

export { handler as GET, handler as POST }