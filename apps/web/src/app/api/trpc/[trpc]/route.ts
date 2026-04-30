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
  })
}

export { handler as GET, handler as POST }