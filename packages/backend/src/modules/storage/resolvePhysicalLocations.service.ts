import type { PrismaClient } from "@prisma/client";

import {
  physicalCandidates,
  stratumSegmentOf,
} from "@backend/modules/storage/logicalPath";

/**
 * resolvePhysicalLocations — où vit réellement ce chemin ?
 *
 * ─── Pourquoi ce module existe ────────────────────────────────────────────
 *
 * Le pliage de la strate de statut fait qu'un chemin LOGIQUE de dossier
 * correspond à 1..N emplacements physiques (`AKFC/cours/x` peut vivre sous
 * `pending`, sous `published`, ou sous les deux). Toute opération d'écriture
 * qui reçoit un chemin du finder doit donc savoir lesquels sont occupés.
 *
 * Deux appelants le demandent, pour des raisons différentes :
 *   - `toPhysicalMoveIntents` — pour émettre une intention par strate ;
 *   - la projection des sources de `trash.trashToBin` — pour jeter les deux
 *     copies d'un dossier logique.
 *
 * D'où l'extraction : la question « où vit ce chemin » est une, la réponse
 * doit l'être aussi.
 *
 * ─── On demande, on ne devine pas ─────────────────────────────────────────
 *
 * La tentation serait de fanner sur les deux strates et de tolérer l'échec
 * de celle qui n'existe pas. Mauvaise idée : cette tolérance finit toujours
 * par avaler autre chose que ce pour quoi elle a été écrite — une panne
 * réelle, ou pire, une garde métier.
 *
 * L'oracle existe déjà, et il est fiable :
 *   - `Folder`     : le registre des dossiers logiques. `upsertFolders` y
 *                    inscrit tout dossier rencontré — c'est précisément ce
 *                    qui fait exister les dossiers VIDES. Un dossier vide
 *                    doit continuer de se déplacer et de se jeter.
 *   - `MediaAsset` : les fichiers. Filet pour un chemin de fichier logique
 *                    (cache client périmé, lien mis en favori).
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire, comme le reste du pliage. À l'étape 5 du chantier, chaque
 * chemin n'a plus qu'un emplacement — celui qu'il désigne. Ce module se
 * supprime avec `logicalPath.ts`.
 */

export type ResolvePhysicalLocationsParams = {
  prisma: PrismaClient;
  appRoot: string;
  /** Chemins tels que reçus de l'UI — logiques ou physiques, indifféremment. */
  paths: readonly string[];
};

/**
 * Pour chaque chemin donné, la liste de ses emplacements physiques réels.
 *
 * Deux régimes :
 *
 *   - Le chemin porte DÉJÀ une strate (`AKFC/pending/…`, `AKFC/bin/…`) :
 *     l'appelant nous dit où vit l'item, on le croit. C'est le cas dominant
 *     après la bascule — `FinderNode.id` porte le `storagePath` d'un
 *     fichier. Aucune requête. Si le chemin est faux, le provider échouera
 *     de lui-même, bruyamment, ce qui est le bon comportement.
 *
 *   - Le chemin est logique (typiquement un DOSSIER, dont l'identité UI est
 *     son chemin logique faute d'emplacement unique) : on interroge.
 *
 * Les requêtes sont groupées sur l'ensemble des candidats de tous les
 * chemins logiques : **deux allers-retours DB au total**, quel que soit le
 * nombre d'items sélectionnés.
 *
 * @throws si un chemin ne correspond à AUCUN emplacement connu. Une écriture
 *   demandée sur un item que ni `Folder` ni `MediaAsset` ne connaissent
 *   signale une incohérence entre ce que le finder affiche et ce que la DB
 *   sait — mieux vaut échouer fort que ne rien faire en silence.
 */
export async function resolvePhysicalLocations(
  params: ResolvePhysicalLocationsParams,
): Promise<Map<string, string[]>> {
  const { prisma, appRoot, paths } = params;

  const resolved = new Map<string, string[]>();
  const candidatesByPath = new Map<string, string[]>();

  for (const path of paths) {
    if (stratumSegmentOf(path, appRoot) !== null) {
      resolved.set(path, [path]);
      continue;
    }
    candidatesByPath.set(path, physicalCandidates(path, appRoot));
  }

  if (candidatesByPath.size === 0) return resolved;

  const allCandidates = [...new Set([...candidatesByPath.values()].flat())];

  const [folders, assets] = await Promise.all([
    prisma.folder.findMany({
      where: { appRoot, fullPath: { in: allCandidates } },
      select: { fullPath: true },
    }),
    prisma.mediaAsset.findMany({
      where: { appRoot, fullPath: { in: allCandidates } },
      select: { fullPath: true },
    }),
  ]);

  const existing = new Set<string>([
    ...folders.map((row) => row.fullPath),
    ...assets.map((row) => row.fullPath),
  ]);

  for (const [path, candidates] of candidatesByPath) {
    const found = candidates.filter((candidate) => existing.has(candidate));
    if (found.length === 0) {
      throw new Error(
        `[resolvePhysicalLocations] Aucun emplacement connu pour "${path}". ` +
          `Ni le registre Folder ni MediaAsset ne connaissent aucun de : ` +
          `${candidates.join(", ")}. Le finder affiche un item que la DB ignore.`,
      );
    }
    resolved.set(path, found);
  }

  return resolved;
}
