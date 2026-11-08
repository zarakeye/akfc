import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { buildConsentPdf } from "@backend/modules/imageConsent/consentPdf.service";
import { effectiveLegalAge, missingForMinor } from "@contracts/legal/imageConsent";

/**
 * Formulaire d'autorisation de droit à l'image PRÉ-REMPLI (nom, prénom, date de naissance, e-mail,
 * qui signe ; parent référent pour un mineur), à imprimer et signer.
 * Le membre connecté obtient le sien ; un admin, celui de n'importe quel membre (`?userId=`).
 * Mineur : seulement quand tout est renseigné (409 sinon, avec ce qui manque).
 */
export async function GET(req: NextRequest): Promise<Response> {
  const session = await getSessionFromRequest(req);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const asked = req.nextUrl.searchParams.get("userId");
  const userId = asked && session.user.isAdmin ? asked : session.user.id;
  const m = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true, lastName: true, email: true, birthDate: true, birthDateVerified: true,
      legalAge: true, guardianName: true, guardianEmail: true, guardianRelation: true,
    },
  });
  if (!m) return new NextResponse("Not found", { status: 404 });

  const legalAge = effectiveLegalAge(m);
  if (legalAge === "MINOR") {
    const missing = missingForMinor(m);
    if (missing.length > 0) {
      return new NextResponse(`À renseigner d'abord : ${missing.join(", ")}.`, { status: 409 });
    }
  }
  const pdf = await buildConsentPdf({ ...m, legalAge });
  const name = [m.lastName, m.firstName].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "") || "membre";
  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="autorisation-droit-image-${name}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
