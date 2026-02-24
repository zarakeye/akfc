import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { NextRequest } from "next/server";

import { prisma } from "@/server/prisma";
import { getSessionFromRequest } from "@/server/auth/getSessionFromRequest";

/**
 * core.ts
 *
 * TRPC central:
 * - type SessionCtx
 * - createTRPCContext(req)
 * - router / procedures
 */

export type SessionCtx = {
  sessionClient: Awaited<ReturnType<typeof getSessionFromRequest>> | null;
  prisma: typeof prisma;
  requestIp: string | null;
  userAgent: string | null;
};

function getIpFromRequest(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return null;
}

export async function createTRPCContext(req: NextRequest): Promise<SessionCtx> {
  const sessionClient = await getSessionFromRequest(req);

  return {
    sessionClient,
    prisma,
    requestIp: getIpFromRequest(req),
    userAgent: req.headers.get("user-agent"),
  };
}

export const t = initTRPC.context<SessionCtx>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.sessionClient?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(isAuthed);