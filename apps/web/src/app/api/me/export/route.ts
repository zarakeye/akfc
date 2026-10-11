import { NextResponse } from "next/server";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { exportMyData } from "@backend/modules/privacy/exportMyData.service";

/**
 * « Télécharger mes données » (profil) : export JSON des données personnelles du membre connecté
 * (droit d'accès et de portabilité, RGPD). Session obligatoire ; jamais mis en cache.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const session = await getSessionFromRequest(req);
  if (!session?.user) return new NextResponse("Connexion requise.", { status: 401 });
  const data = await exportMyData(prisma, session.user.id);
  if (!data) return new NextResponse("Compte introuvable.", { status: 404 });
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mes-donnees-akfc-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
