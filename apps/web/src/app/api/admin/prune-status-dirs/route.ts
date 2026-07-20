/**
 * 🧹 Nettoyage des dossiers de statut résiduels (vague B).
 *
 *   GET (défaut)  → DRY-RUN : compte les assets sous AKFC/pending et
 *                   AKFC/published, liste leurs sous-dossiers. Ne supprime rien.
 *   GET ?run=1    → détruit récursivement les deux préfixes (deleteByPrefix).
 *
 * Gardes : ne cible QUE les préfixes de statut ; refuse si un MediaAsset vit
 * encore dessous (migration incomplète). Désactivée en production.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { APP_ROOT } from '@config/app';
import { prisma } from '@backend/prisma';
import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';
import { deleteByPrefix } from '@backend/modules/cloudinary/services/cloudinary.service';

const STATUS_PREFIXES = [`${APP_ROOT}/pending`, `${APP_ROOT}/published`];

async function countAssetsUnder(prefix: string): Promise<number> {
  let total = 0;
  for (const resource_type of ['image', 'video', 'raw'] as const) {
    try {
      const res = await cloudinary.api.resources({
        type: 'authenticated',
        resource_type,
        prefix,
        max_results: 500,
      });
      total += (res.resources ?? []).length;
    } catch {
      // prefix inexistant pour ce type → 0
    }
  }
  return total;
}

async function subFolders(path: string): Promise<string[]> {
  try {
    const res = await cloudinary.api.sub_folders(path);
    return ((res.folders ?? []) as Array<{ path: string }>).map((f) => f.path);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in prod' }, { status: 403 });
  }
  const run = request.nextUrl.searchParams.get('run') === '1';

  // Garde DB : aucun MediaAsset ne doit vivre sous une strate.
  const stillUnderStrata = await prisma.mediaAsset.count({
    where: {
      appRoot: APP_ROOT,
      OR: STATUS_PREFIXES.map((p) => ({ fullPath: { startsWith: `${p}/` } })),
    },
  });
  if (stillUnderStrata > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `${stillUnderStrata} MediaAsset vivent encore sous une strate — migration incomplète, refus de détruire.`,
      },
      { status: 409 },
    );
  }

  const inventory: Record<string, { assetCount: number; subFolders: string[] }> =
    {};
  for (const prefix of STATUS_PREFIXES) {
    inventory[prefix] = {
      assetCount: await countAssetsUnder(prefix),
      subFolders: await subFolders(prefix),
    };
  }

  if (!run) {
    return NextResponse.json({
      ok: true,
      report: {
        dryRun: true,
        inventory,
        note: 'Aucune suppression. Relancer avec ?run=1 pour détruire.',
      },
    });
  }

  const deleted: string[] = [];
  for (const prefix of STATUS_PREFIXES) {
    // Garde de forme : on ne détruit QUE des préfixes de statut.
    if (!/\/(pending|published)$/.test(prefix)) continue;
    await deleteByPrefix(prefix);
    deleted.push(prefix);
  }

  return NextResponse.json({
    ok: true,
    report: { dryRun: false, deleted, inventoryBeforeDelete: inventory },
  });
}
