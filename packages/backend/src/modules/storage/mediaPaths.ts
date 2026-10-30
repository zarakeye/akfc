import type { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/**
 * mediaPaths.ts — la clé de stockage EST `MediaAsset.fullPath`.
 *
 * Quand des objets changent de clé (déplacement, mise à la corbeille, restauration), leurs lignes
 * doivent suivre : sinon une ligne pointe vers un objet qui n'est plus là, et l'objet n'a plus de
 * ligne (ni statut, ni nom d'origine, ni auteur). Une seule fonction fait cette réécriture, pour
 * que tous les gestes la fassent de la même façon.
 */

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Réécrit le chemin des lignes `MediaAsset` d'un fichier (`from` exact) ou d'un dossier (tout ce
 * qui est SOUS `from/`), vers `to`. Prisma n'offre pas de remplacement de sous-chaîne dans
 * `updateMany`, d'où le SQL brut, paramétré.
 *
 * Dans un LIKE, « _ » et « % » sont des jokers : un dossier « cours_2026 » correspondrait aussi à
 * « coursX2026 ». On les échappe (ainsi que l'échappement lui-même) ; seul le « % » final reste un
 * joker. Le « / » final évite que `cours` emporte `cours-avance`.
 */
export function rewriteAssetPaths(
  db: Db,
  appRoot: string,
  kind: "file" | "folder",
  from: string,
  to: string,
): Prisma.PrismaPromise<number> {
  if (kind === "file") {
    return db.$executeRaw`
      UPDATE "MediaAsset" SET "fullPath" = ${to}
      WHERE "appRoot" = ${appRoot} AND "fullPath" = ${from};
    `;
  }
  const cut = from.length + 1;
  const likeChildren = `${from}/`.replace(/[\\%_]/g, "\\$&") + "%";
  return db.$executeRaw`
    UPDATE "MediaAsset"
    SET "fullPath" = ${to} || SUBSTRING("fullPath" FROM ${cut}::int)
    WHERE "appRoot" = ${appRoot} AND "fullPath" LIKE ${likeChildren};
  `;
}

/** Préfixe de la corbeille. Les lignes d'un élément jeté y suivent leurs objets. */
export function binPrefix(appRoot: string): string {
  return `${appRoot}/bin/`;
}

/**
 * Filtre « hors corbeille » : un fichier jeté garde sa ligne (pour être restauré avec son statut,
 * son nom et sa description), mais il ne doit plus compter ni être choisi nulle part.
 */
export function outsideBin(appRoot: string): Prisma.MediaAssetWhereInput {
  return { NOT: { fullPath: { startsWith: binPrefix(appRoot) } } };
}

/* ─── Les avatars : hors de la bibliothèque ──────────────────────────────────────────────────── */

/**
 * Les avatars vivent sous `<racine>/avatars/<userId>/…`, mais ce ne sont pas des médias de la
 * bibliothèque : ni ligne MediaAsset, ni statut, ni rangement. Ils se consomment autrement — par
 * le profil de leur titulaire (`avatar.*`) et la route `/api/media/public/avatar/<userId>`.
 * `User.avatar` garde leur clé exacte : un déplacement, un renommage ou une corbeille depuis le
 * Finder la rendraient fausse, et l'avatar disparaîtrait sans explication.
 *
 * Le Finder ne liste donc pas ce dossier, et aucune opération de la bibliothèque n'y entre.
 */
export function avatarsPrefix(appRoot: string): string {
  return `${appRoot}/avatars`;
}

export function isAvatarPath(appRoot: string, path: string): boolean {
  const prefix = avatarsPrefix(appRoot);
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Refuse toute opération de la bibliothèque sur le dossier des avatars. Même réponse qu'un chemin inconnu. */
export function assertOutsideAvatars(appRoot: string, paths: readonly string[]): void {
  if (paths.some((p) => isAvatarPath(appRoot, p))) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Dossier introuvable." });
  }
}

