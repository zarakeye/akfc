import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import {
  getR2Bucket,
  getR2Client,
} from "@backend/modules/storage/adapters/r2/client";
import { SITE_LOGO_KEY } from "@backend/modules/siteSettings/services/siteLogo.service";

/**
 * Route publique du logo du site. Le logo vit dans une clé R2 réservée
 * (system/logo.svg), hors arborescence finder et sans MediaAsset.
 *
 * Servi par la MÊME ORIGINE, et non par une redirection vers une URL R2 signée :
 * une redirection mise en cache par le navigateur survivait à sa signature (30 min),
 * et le logo pouvait disparaître du header. Le fichier est petit (512 Ko au plus) et
 * l'URL porte `?v=updatedAt`, qui change à chaque nouveau logo : la réponse est donc
 * mise en cache sans limite (`immutable`), et le serveur n'est sollicité qu'une fois
 * par navigateur et par version.
 *
 * Un SVG peut contenir du script. Dans une balise <img>, le navigateur ne l'exécute
 * jamais ; ouvert directement, la politique `sandbox` et `nosniff` l'en empêchent.
 * `?raw=1` (aperçu des réglages, qui mesure ses couleurs dans un canvas) reçoit la
 * même réponse.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const object = await getR2Client().send(
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: SITE_LOGO_KEY }),
    );
    const svg = await object.Body?.transformToString();
    if (!svg) return new NextResponse("Not found", { status: 404 });

    // Sans `?v=`, l'URL ne change pas avec le logo : cache court.
    const versioned = req.nextUrl.searchParams.has("v");
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": versioned
          ? "public, max-age=31536000, immutable"
          : "public, max-age=300",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[api/media/site-logo] lecture impossible", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
