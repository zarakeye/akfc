import type { PrismaClient } from "@prisma/client";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

/**
 * backfillCloudinaryAssetIds.service.ts
 *
 * Répare l'historique : avant l'ajout de `cloudinaryAssetId`, les moves
 * laissaient des lignes MediaAsset figées sur d'anciens emplacements (le
 * matching par path ne les retrouvait pas). Ce backfill réancre chaque ligne
 * Cloudinary sur son asset RÉEL via l'asset_id immuable, réaligne
 * fullPath/publicId/status, ET corrige resourceType depuis le bucket Cloudinary
 * réel (un .mp4 uploadé par erreur en "image" / "image/mp4" est remis en
 * "video"). Identifie aussi les vestiges (lignes dont le publicId ne pointe
 * sur aucun asset Cloudinary).
 *
 * `apply: false` (défaut) = dry-run : logue sans rien modifier.
 */

const RESOURCE_TYPES = ["image", "video", "raw"] as const;
type CloudinaryResourceType = (typeof RESOURCE_TYPES)[number];

type RealAsset = {
  assetId: string;
  publicId: string;
  format?: string;
  resourceType: CloudinaryResourceType;
};

async function listAllRealAssets(appRoot: string): Promise<RealAsset[]> {
  const out: RealAsset[] = [];
  for (const rt of RESOURCE_TYPES) {
    let cursor: string | undefined;
    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type: rt,
        prefix: `${appRoot}/`,
        max_results: 500,
        next_cursor: cursor,
      });
      for (const a of res.resources) {
        out.push({
          assetId: a.asset_id as string,
          publicId: a.public_id as string,
          format: a.format as string | undefined,
          resourceType: rt, // bucket Cloudinary réel : image | video | raw
        });
      }
      cursor = res.next_cursor;
    } while (cursor);
  }
  return out;
}

function statusOf(path: string, appRoot: string): string | null {
  const parts = path.split("/").filter(Boolean);
  const seg = parts[appRoot.split("/").filter(Boolean).length];
  return ["pending", "published", "bin"].includes(seg) ? seg : null;
}

export async function backfillCloudinaryAssetIds(params: {
  prisma: PrismaClient;
  appRoot: string;
  apply?: boolean;
}): Promise<void> {
  const { prisma, appRoot, apply = false } = params;

  const real = await listAllRealAssets(appRoot);
  const byPublicId = new Map(real.map((a) => [a.publicId, a]));

  const rows = await prisma.mediaAsset.findMany({
    where: { appRoot, publicId: { not: null } }, // lignes Cloudinary
    select: { id: true, publicId: true, fullPath: true, status: true, resourceType: true },
  });

  let reanchored = 0;
  const vestiges: string[] = [];

  for (const row of rows) {
    const match = row.publicId ? byPublicId.get(row.publicId) : undefined;

    if (!match) {
      // publicId ne pointe sur aucun asset réel → vestige.
      vestiges.push(`${row.id} (${row.publicId})`);
      continue;
    }

    const nextFullPath = `${match.publicId}${match.format ? "." + match.format : ""}`;
    const nextStatus = statusOf(match.publicId, appRoot);
    const nextResourceType = match.resourceType; // vérité Cloudinary

    console.log(
      `[backfill] réancre ${row.id}: assetId=${match.assetId} fullPath=${nextFullPath} status=${nextStatus} resourceType=${nextResourceType}` +
        (row.resourceType !== nextResourceType
          ? ` (resourceType corrigé: ${row.resourceType} → ${nextResourceType})`
          : ""),
    );
    reanchored++;

    if (apply) {
      await prisma.mediaAsset.update({
        where: { id: row.id },
        data: {
          cloudinaryAssetId: match.assetId,
          fullPath: nextFullPath,
          publicId: match.publicId,
          resourceType: nextResourceType,
          ...(nextStatus ? { status: nextStatus } : {}),
        },
      });
    }
  }

  console.log(
    `[backfill] ${apply ? "APPLIQUÉ" : "DRY-RUN"} — ${reanchored} ligne(s) réancrée(s), ${vestiges.length} vestige(s) détecté(s):`,
    vestiges,
  );
  console.log(
    "[backfill] Les vestiges ne sont PAS supprimés automatiquement. Vérifie la liste, puis supprime-les à la main si elle est correcte.",
  );
}