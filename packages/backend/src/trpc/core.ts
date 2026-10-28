import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { NextRequest } from "next/server";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { APP_ROOT } from "../../../config/app";

export type TRPCContext = {
  sessionClient: Awaited<ReturnType<typeof getSessionFromRequest>>;
  prisma: typeof prisma;
  requestIp: string | null;
  userAgent: string | null;
  appRoot: string;
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
    appRoot: APP_ROOT,
  };
}

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  // Une erreur non prévue (Prisma, réseau, bug) porte un message technique : nom de table,
  // texte de la requête… En production, le navigateur reçoit un message neutre ; le détail
  // reste dans les journaux du serveur (onError de la route /api/trpc).
  errorFormatter({ shape, error }) {
    if (error.code === "INTERNAL_SERVER_ERROR" && process.env.NODE_ENV === "production") {
      return { ...shape, message: "Erreur interne du serveur. Réessayez dans un instant." };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  const sessionClient = ctx.sessionClient;

  if (!sessionClient?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Connexion requise." });
  }

  return next({
    ctx: {
      ...ctx,
      sessionClient: sessionClient as AuthenticatedSessionClient,
    } as AuthenticatedTRPCContext,
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);