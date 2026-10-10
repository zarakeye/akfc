import { NextResponse } from "next/server";

import { prisma } from "@backend/prisma";

/**
 * Logo d'un partenaire du club (public). Stocké en base ; l'URL porte ?v=… (date du logo), d'où
 * un cache long. Sandbox + nosniff : un SVG ouvert directement ne peut rien exécuter (et les SVG
 * à contenu actif sont déjà refusés à l'envoi).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const partner = await prisma.sitePartner.findUnique({
    where: { id },
    select: { logoData: true, logoMime: true, isActive: true },
  });
  if (!partner?.logoData || !partner.logoMime) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(partner.logoData), {
    status: 200,
    headers: {
      "Content-Type": partner.logoMime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
