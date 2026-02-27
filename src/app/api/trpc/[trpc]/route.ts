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

const handler = async (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createTRPCContext(req),
  });
};

export { handler as GET, handler as POST };