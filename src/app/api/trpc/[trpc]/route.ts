import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/server/trpc/core";

/**
 * Important:
 * - Prisma doit tourner en runtime Node (pas Edge)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Handles incoming requests to /api/trpc.
 * Calls the fetchRequestHandler from @trpc/server/adapters/fetch,
 * passing in the appRouter, the current request, and a function to create a TRPC context from the request.
 * @returns A promise resolving to a Response object.
 */
const handler = async (req: NextRequest): Promise<Response> => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createTRPCContext(req),
  });
};

export { handler as GET, handler as POST };