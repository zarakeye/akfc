import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import {
  getR2Bucket,
  getR2Client,
} from "@backend/modules/storage/adapters/r2/client";
import { fetchAuthenticatedAsset } from "@backend/modules/cloudinary/services/cloudinary.service";

/**
 * Livraison GATÉE MEMBRE d'un document mis à disposition.
 *
 * Analogue membre de la garde publique (`public/by-public-id`, `public/r2`) :
 *   - session authentifiée requise (401 sinon) ;
 *   - le MemberDocument doit CONCERNER le membre : audience ALL_MEMBERS, ou
 *     SPECIFIC avec ce membre en destinataire. Sinon 404 — on ne révèle pas
 *     l'existence d'un document qui ne le concerne pas.
 *
 * R2 (cas des PDF) : redirection presignée, avec Content-Type / Disposition
 * forcés en `application/pdf` inline pour l'aperçu en iframe, quel que soit le
 * content-type stocké. Cloudinary : stream, si jamais le document y vit.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSessionFromRequest(req);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { id } = await params;
  if (!id) return new NextResponse("Not found", { status: 404 });

  // ─── Garde : le document concerne ce membre ───────────────────────────
  const doc = await prisma.memberDocument.findFirst({
    where: {
      id,
      OR: [
        { audience: "ALL_MEMBERS" },
        {
          audience: "SPECIFIC",
          OR: [
            { recipients: { some: { userId } } },
            {
              groups: {
                some: { group: { memberships: { some: { userId } } } },
              },
            },
          ],
        },
      ],
    },
    select: {
      title: true,
      mediaAsset: {
        select: {
          publicId: true,
          fullPath: true,
          mimeType: true,
          displayName: true,
          originalFileName: true,
          format: true,
        },
      },
    },
  });

  if (!doc) return new NextResponse("Not found", { status: 404 });

  const asset = doc.mediaAsset;
  const contentType = asset.mimeType ?? "application/pdf";

  // ?download=1 → pièce jointe (nom humain) ; sinon aperçu inline.
  const download = req.nextUrl.searchParams.get("download") === "1";
  const baseName = doc.title ?? asset.displayName ?? asset.originalFileName;
  const ext = asset.format ?? "pdf";
  const fileName = /\.[^.]+$/.test(baseName) ? baseName : `${baseName}.${ext}`;
  const disposition = download
    ? `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    : "inline";

  // ─── Cloudinary (rare pour un document) : stream ──────────────────────
  if (asset.publicId) {
    try {
      const res = await fetchAuthenticatedAsset(asset.publicId, "original");
      if (!res || !res.ok || !res.body) {
        return new NextResponse("Not found", { status: 404 });
      }
      return new Response(res.body, {
        status: 200,
        headers: {
          "Content-Type": res.headers.get("content-type") ?? contentType,
          "Content-Disposition": disposition,
          "Cache-Control": "private, no-store",
        },
      });
    } catch (err) {
      console.error("[member-document] cloudinary error", id, err);
      return new NextResponse("Internal server error", { status: 500 });
    }
  }

  // ─── R2 (PDF) : stream MÊME ORIGINE (gated) ───────────────────────────
  // On streame plutôt que de rediriger vers une URL presignée : pdf.js fetche
  // les octets en JS et se heurterait au CORS d'une redirection cross-origin.
  // En prime, les octets restent gatés à chaque requête (pas d'URL signée
  // partageable).
  try {
    const s3 = getR2Client();
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: asset.fullPath }),
    );
    if (!obj.Body) {
      return new NextResponse("Not found", { status: 404 });
    }
    return new Response(obj.Body.transformToWebStream(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        ...(obj.ContentLength
          ? { "Content-Length": String(obj.ContentLength) }
          : {}),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[member-document] r2 stream error", id, err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
