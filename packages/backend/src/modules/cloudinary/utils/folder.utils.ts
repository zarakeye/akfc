import type { PrismaClient } from "@prisma/client";

/**
 * Utilitaires de manipulation de paths et folders Cloudinary.
 *
 * Ces helpers étaient inline dans `cloudinary/router.ts`. Ils ont été
 * extraits ici pour être réutilisables par les services et adapters
 * (notamment `getCloudinaryFolderTree.service.ts` et
 * `cloudinaryStorageAdapter`).
 *
 * Aucun changement de logique par rapport à la version inline du router.
 */

function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Liste tous les dossiers ancêtres d'un publicId Cloudinary.
 *
 * Exemple :
 *   "AKFC/pending/cours/12/photo.jpg"
 *   → ["AKFC", "AKFC/pending", "AKFC/pending/cours", "AKFC/pending/cours/12"]
 *
 * Le publicId lui-même n'est pas inclus (c'est un fichier, pas un dossier).
 */
export function folderAncestorsOfPublicId(publicId: string): string[] {
  const parts = normalizePath(publicId).split("/").filter(Boolean);
  if (parts.length < 2) return [];

  const folders = parts.slice(0, -1);
  const out: string[] = [];

  for (let i = 1; i <= folders.length; i++) {
    out.push(folders.slice(0, i).join("/"));
  }

  return out;
}

/**
 * Liste tous les dossiers ancêtres d'un path de dossier (incluant le dossier
 * lui-même).
 *
 * Exemple :
 *   "AKFC/pending/cours/12"
 *   → ["AKFC", "AKFC/pending", "AKFC/pending/cours", "AKFC/pending/cours/12"]
 */
export function folderAncestorsOfFolderPath(folderPath: string): string[] {
  const parts = normalizePath(folderPath).split("/").filter(Boolean);
  const out: string[] = [];

  for (let i = 1; i <= parts.length; i++) {
    out.push(parts.slice(0, i).join("/"));
  }

  return out;
}

/**
 * Déduit le statut applicatif (pending/published/bin) à partir du path.
 *
 * Convention de path : `<appRoot>/<status>/...`. Le segment d'index 1 est
 * le statut. Si non reconnu, on retourne "pending" par défaut (cas qui ne
 * devrait pas arriver dans des paths normalisés mais on reste défensif).
 */
export function statusFromPath(path: string): "pending" | "published" | "bin" {
  const parts = normalizePath(path).split("/").filter(Boolean);
  const status = parts[1];

  if (status === "published") return "published";
  if (status === "bin") return "bin";
  return "pending";
}

/**
 * Upsert dans la table `folder` un ensemble de paths.
 *
 * Cloudinary n'a pas de dossiers physiques — ce registre DB matérialise
 * les dossiers logiques pour qu'ils existent même vides (utile pour le
 * Finder qui doit pouvoir afficher des dossiers en attente d'upload).
 *
 * `appRoot` est explicite (pas lu d'une variable globale) pour que ce
 * helper soit réutilisable par n'importe quel service ou adapter qui
 * connaît son contexte tRPC.
 */
export async function upsertFolders(
  db: PrismaClient,
  paths: string[],
  appRoot: string
): Promise<void> {
  const unique = Array.from(new Set(paths)).filter(Boolean);
  if (unique.length === 0) return;

  // 🚀 Stratégie bulk : findMany + createMany(skipDuplicates) au lieu de N upserts en série.
  //
  // Avant : pour 10 dossiers ancêtres, on faisait 10 round-trips DB séquentiels
  // dans une transaction, soit ~2-9 secondes selon la latence — alors que la
  // grande majorité des dossiers existent déjà depuis longtemps.
  //
  // Maintenant : on lit en une seule round-trip quels paths existent déjà,
  // on filtre les nouveaux, et on les insère en bulk avec `skipDuplicates`
  // (filet de sécurité contre les races avec d'autres requêtes concurrentes).
  //
  // Sémantique : la version `upsert` précédente avait un `update: { status }`
  // qui ne servait à rien — `statusFromPath` est pure (dérive du path),
  // et le path est la PK donc immuable. L'update est donc un noop, on peut
  // s'en passer sans changement de comportement.

  // 1) Lecture en bulk des paths existants.
  const existing = await db.folder.findMany({
    where: {
      appRoot,
      fullPath: { in: unique },
    },
    select: { fullPath: true },
  });
  const existingSet = new Set(existing.map((e) => e.fullPath));

  // 2) Filtrage : on ne crée que les nouveaux.
  const newOnes = unique.filter((p) => !existingSet.has(p));
  if (newOnes.length === 0) return;

  // 3) Création en bulk. `skipDuplicates` protège contre les races
  //    (deux requêtes parallèles qui voudraient créer le même path).
  await db.folder.createMany({
    data: newOnes.map((fullPath) => ({
      appRoot,
      fullPath,
      status: statusFromPath(fullPath),
    })),
    skipDuplicates: true,
  });
}
