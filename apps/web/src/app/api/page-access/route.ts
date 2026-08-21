import type { NextRequest } from "next/server";

import { createTRPCContext } from "@backend/trpc";
import { pageKeyForPath } from "@/config/pageRegistry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Décide si la requête a le droit de VOIR la vraie page `path` :
 *   - route non toggable → autorisée ;
 *   - admin (role ADMIN) → autorisée (voit toujours la vraie page) ;
 *   - sinon → autorisée uniquement si la page est publiée.
 * Consommée par le middleware (qui rewrite vers /en-construction si refusé).
 */
export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  const key = pageKeyForPath(path);
  if (!key) return Response.json({ allowed: true });

  const ctx = await createTRPCContext({ req });

  const userId = ctx.sessionClient?.user?.id;
  if (userId) {
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    });
    if (me?.role?.name === "ADMIN") return Response.json({ allowed: true });
  }

  const row = await ctx.prisma.pageVisibility.findUnique({ where: { key } });
  return Response.json({ allowed: row?.published === true });
}
