/**
 * 🔍 Diagnostic LECTURE SEULE — dossiers physiques sous AKFC.
 *
 * GET → liste les sous-dossiers directs de AKFC/ chez Cloudinary. On cherche
 * les dossiers `pending` / `published` résiduels (vides après la migration
 * mais toujours présents comme entités Cloudinary). Ne supprime rien.
 */
import { NextResponse } from 'next/server';
import { APP_ROOT } from '@config/app';
import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';

async function subFolders(path: string): Promise<string[]> {
  try {
    const res = await cloudinary.api.sub_folders(path);
    return ((res.folders ?? []) as Array<{ path: string }>).map((f) => f.path);
  } catch {
    return [];
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in prod' }, { status: 403 });
  }

  const rootFolders = await subFolders(APP_ROOT);

  // Pour chaque dossier de statut résiduel, on regarde s'il a encore du contenu.
  const statusDirs = rootFolders.filter((p) =>
    /\/(pending|published)$/.test(p),
  );
  const statusDirContents: Record<string, string[]> = {};
  for (const dir of statusDirs) {
    statusDirContents[dir] = await subFolders(dir);
  }

  return NextResponse.json({
    ok: true,
    report: {
      rootFolders,
      residualStatusDirs: statusDirs,
      statusDirContents,
      verdict:
        statusDirs.length === 0
          ? 'aucun dossier de statut résiduel — le pliage peut être retiré sans nettoyage'
          : 'des dossiers pending/published subsistent — à vider/supprimer avant de retirer le pliage',
    },
  });
}
