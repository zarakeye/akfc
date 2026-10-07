import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

import {
  getR2Bucket,
  getR2Client,
} from "@backend/modules/storage/adapters/r2/client";
import { SITE_LOGO_KEY } from "@backend/modules/siteSettings/services/siteLogo.service";

/**
 * Route publique du logo du site. Le logo vit dans une clé R2 réservée
 * (system/logo.svg), hors arborescence finder et sans MediaAsset. On presign
 * un GET (comme la route publique R2) et on redirige en 302 (zero-egress).
 * L'invalidation de cache se fait par le `?v=` ajouté par siteSettings.get.
 */
const EXPIRY_SECONDS = 30 * 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: SITE_LOGO_KEY,
    });

    // ?raw=1 : le SVG lui-même, servi par la même origine (aperçu des réglages, qui mesure ses
    // couleurs dans un canvas). Sandbox + nosniff : ouvert directement, il ne peut rien exécuter.
    if (req.nextUrl.searchParams.get("raw") === "1") {
      const object = await s3.send(command);
      const svg = await object.Body?.transformToString();
      if (!svg) return new NextResponse("Not found", { status: 404 });
      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: EXPIRY_SECONDS,
    });
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        // Le SVG change rarement et l'URL porte ?v=updatedAt (busting au
        // changement) → cache long : instantané après la 1re visite.
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[api/media/site-logo] presign failed", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
