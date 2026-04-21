import { appRouter } from "./index";
import type { NextRequest } from "next/server";
import { createTRPCContext } from "./core";

/**
 * trpcCaller.ts
 *
 * Permet d'appeler le router côté serveur (tests, jobs, scripts).
 * L'ancien code importait createContext depuis l'index; désormais, le context
 * est créé via createTRPCContext(req).
 *
 * NOTE:
 * - On exige un req pour que cookies/ip/user-agent soient cohérents.
 * - Si tu as besoin d'un caller sans req, on peut fournir une fonction dédiée.
 */

export async function createTRPCCaller(req: NextRequest) {
  const ctx = await createTRPCContext({ req });
  return appRouter.createCaller(ctx);
}