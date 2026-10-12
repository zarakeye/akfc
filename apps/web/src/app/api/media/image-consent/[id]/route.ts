import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { getR2Bucket, getR2Client } from "@backend/modules/storage/adapters/r2/client";

/**
 * Formulaire de droit à l'image signé — servi au membre CONCERNÉ et aux admins seulement.
 * 401 sans session ; 404 pour tout autre membre (on ne révèle pas l'existence du formulaire).
 * Stream même origine (pdf.js le lit sans CORS), jamais d'URL signée partageable, jamais en cache.
 * `?download=1` → pièce jointe ; sinon affichage dans la page (aperçu).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await getSessionFromRequest(req);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const form = await prisma.imageConsentForm.findUnique({
    where: { id },
    select: { userId: true, storageKey: true, mimeType: true, fileName: true },
  });
  if (!form || (!session.user.isAdmin && form.userId !== session.user.id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const download = req.nextUrl.searchParams.get("download") === "1";
  const disposition = `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(form.fileName)}`;
  try {
    const obj = await getR2Client().send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: form.storageKey }));
    if (!obj.Body) return new NextResponse("Not found", { status: 404 });
    return new Response(obj.Body.transformToWebStream(), {
      status: 200,
      headers: {
        "Content-Type": form.mimeType,
        "Content-Disposition": disposition,
        ...(obj.ContentLength ? { "Content-Length": String(obj.ContentLength) } : {}),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[image-consent] r2 stream error", id, err instanceof Error ? err.message : err);
    return new NextResponse("Not found", { status: 404 });
  }
}
