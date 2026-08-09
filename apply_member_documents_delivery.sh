#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 3/6 : route de livraison gatée membre.
#
# Crée /api/media/member-document/[id] — l'analogue MEMBRE de la garde publique :
#   - session authentifiée requise (401 sinon) ;
#   - le MemberDocument doit CONCERNER le membre (ALL_MEMBERS, ou SPECIFIC avec
#     ce membre en destinataire) — 404 sinon, on ne révèle pas son existence ;
#   - sert le binaire : R2 (PDF) en redirection presignée avec Content-Type
#     `application/pdf` + `inline` forcés (aperçu iframe) ; Cloudinary streamé
#     si jamais un document y vit.
#
# Nécessite l'increment 1 appliqué (modèles + prisma generate).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-delivery.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-delivery.sh
#
set -euo pipefail

ROUTE="apps/web/src/app/api/media/member-document/[id]/route.ts"

if [ ! -f "package.json" ] || [ ! -d "apps/web/src/app/api/media" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC (apps/web/src/app/api/media attendu)." >&2
  exit 1
fi

if [ -f "$ROUTE" ]; then
  echo "route déjà présente — laissée telle quelle"
else
  mkdir -p "$(dirname "$ROUTE")"
  cat > "$ROUTE" <<'ROUTE_EOF'
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const PRESIGNED_URL_EXPIRY_SECONDS = 30 * 60;

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
        { audience: "SPECIFIC", recipients: { some: { userId } } },
      ],
    },
    select: {
      mediaAsset: {
        select: { publicId: true, fullPath: true, mimeType: true },
      },
    },
  });

  if (!doc) return new NextResponse("Not found", { status: 404 });

  const asset = doc.mediaAsset;
  const contentType = asset.mimeType ?? "application/pdf";

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
          "Content-Disposition": "inline",
          "Cache-Control": "private, no-store",
        },
      });
    } catch (err) {
      console.error("[member-document] cloudinary error", id, err);
      return new NextResponse("Internal server error", { status: 500 });
    }
  }

  // ─── R2 (PDF) : redirection presignée, inline forcé ───────────────────
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: asset.fullPath,
      ResponseContentType: contentType,
      ResponseContentDisposition: "inline",
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (err) {
    console.error("[member-document] r2 sign error", id, err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
ROUTE_EOF
  echo "route member-document créée"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): route de livraison gatée membre /api/media/member-document/[id]" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi