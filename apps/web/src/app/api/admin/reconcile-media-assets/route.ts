/**
 * 🛠 Route admin — réconciliation MediaAsset ↔ binaires Cloudinary.
 *
 * Énumère les binaires sous APP_ROOT et reconstruit les lignes `MediaAsset`
 * manquantes (orphelins) via `restoreMediaAssetsByPath` — métadonnées Cloudinary
 * natives, catégorie/discipline nulles si hors `cours/<cat>/<disc>` (sans
 * conséquence d'affichage). Idempotent.
 *
 * Réservée ADMIN, active en prod. Dry-run par défaut ; `?apply=1` pour écrire.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createTRPCContext } from "@backend/trpc";
import { APP_ROOT } from "@config/app";
import { listAuthenticatedResources } from "@backend/modules/cloudinary/services/cloudinary.service";
import { restoreMediaAssetsByPath } from "@backend/modules/storage/services/restoreMediaAssetsByPath.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const ctx = await createTRPCContext({ req });

  const userId = ctx.sessionClient?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const admin = await ctx.prisma.memberGroupMembership.findFirst({
    where: { userId, group: { isAdminGroup: true } },
    select: { id: true },
  });
  if (!admin) {
    return NextResponse.json(
      { error: "Réservé aux administrateurs." },
      { status: 403 },
    );
  }

  const apply = req.nextUrl.searchParams.get("apply") === "1";

  try {
    const resources = await listAuthenticatedResources(APP_ROOT);
    const fullPaths = resources.map((r) =>
      r.format ? `${r.publicId}.${r.format}` : r.publicId,
    );
    const report = await restoreMediaAssetsByPath(
      ctx.prisma,
      APP_ROOT,
      fullPaths,
      { dryRun: !apply },
    );
    return NextResponse.json({
      ok: true,
      apply,
      scanned: resources.length,
      report,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
