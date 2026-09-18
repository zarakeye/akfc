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

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: SITE_LOGO_KEY,
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: EXPIRY_SECONDS,
    });
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    });
  } catch (err) {
    console.error("[api/media/site-logo] presign failed", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
