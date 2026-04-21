import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { NextRequest } from "next/server";

import { prisma } from "../prisma";
import { getSessionFromRequest } from "../modules/auth/getSessionFromRequest";

export type TRPCContext = {
  sessionClient: Awaited<ReturnType<typeof getSessionFromRequest>>;
  prisma: typeof prisma;
  requestIp: string | null;
  userAgent: string | null;
};

type SessionClient = NonNullable<TRPCContext["sessionClient"]>;
type AuthenticatedSessionClient = SessionClient & {
  user: NonNullable<SessionClient["user"]>;
};

type AuthenticatedTRPCContext = Omit<TRPCContext, "sessionClient"> & {
  sessionClient: AuthenticatedSessionClient;
};

function getIpFromRequest(req: Request | NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return null;
}

export async function createTRPCContext({
  req,
}: {
  req: Request | NextRequest;
}): Promise<TRPCContext> {
  const sessionClient = await getSessionFromRequest(req);

  return {
    sessionClient,
    prisma,
    requestIp: getIpFromRequest(req),
    userAgent: req.headers.get("user-agent"),
  };
}

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  const sessionClient = ctx.sessionClient;

  if (!sessionClient?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      sessionClient: sessionClient as AuthenticatedSessionClient,
    } as AuthenticatedTRPCContext,
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);