#!/bin/bash
# Fix dossier fantome : pruneEmptyFolders supprime aussi l'ENTITE dossier
# Cloudinary (api.delete_folder) — le finder batit l'arbre sur sub_folders.
# À lancer depuis la RACINE du monorepo : bash fix_prune_ghost.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }
echo "-> packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts"
cat > 'packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts' << 'FILE_EOF'
import type { PrismaClient } from "@prisma/client";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

/**
 * pruneEmptyFolders.service.ts
 *
 * Supprime du registre DB (`Folder`) les dossiers source devenus vides
 * après un move Cloudinary.
 *
 * ─── Pourquoi c'est nécessaire ─────────────────────────────────────────────
 *
 * Les dossiers Cloudinary d'AKFC n'existent pas comme entités propres : ils
 * sont dérivés des préfixes de public_id, et `getCloudinaryFolderTree` les
 * persiste dans la table `Folder` (placeholders) pour pouvoir afficher les
 * dossiers vides. `move.service` renomme les ASSETS mais ne touche jamais
 * cette table. Quand on déplace tout le contenu d'un dossier (typiquement un
 * changement de statut), ses assets partent ailleurs mais sa ligne `Folder`
 * reste — d'où le "dossier fantôme" qui survit dans la vue source.
 *
 * Ce service prune ces lignes orphelines : en partant du dossier le plus
 * profond touché par le move, il remonte tant que le préfixe ne contient
 * plus AUCUN asset Cloudinary, et s'arrête au dossier-statut (jamais supprimé).
 *
 * ─── Pourquoi vérifier Cloudinary et pas la DB ─────────────────────────────
 *
 * L'autorité sur "reste-t-il un asset ici ?" est Cloudinary lui-même (les
 * assets viennent d'y être renommés). `move.service` a déjà invalidé le cache
 * resources, donc `api.resources({ prefix })` reflète l'état réel.
 *
 * Strictement Cloudinary : R2 n'utilise pas la table `Folder`. Appelé
 * uniquement depuis le `move` de l'adapter Cloudinary.
 */

const RESOURCE_TYPES = ["image", "video", "raw"] as const;

/** Reste-t-il au moins un asset Cloudinary STRICTEMENT sous ce dossier ? */
async function folderHasAssets(folderPath: string): Promise<boolean> {
  // Slash final : évite qu'un sibling `cours-avance` fasse croire que
  // `cours` est non-vide (Cloudinary matche par préfixe de chaîne).
  const prefix = `${folderPath}/`;
  for (const rt of RESOURCE_TYPES) {
    const res = await cloudinary.api.resources({
      type: "authenticated",
      resource_type: rt,
      prefix,
      max_results: 1,
    });
    if (res.resources.length > 0) return true;
  }
  return false;
}

export type PruneEmptyFoldersParams = {
  prisma: PrismaClient;
  appRoot: string;
  /**
   * Dossier le plus profond potentiellement vidé par le move. Pour une
   * source `file`, c'est le dossier PARENT du fichier ; pour une source
   * `folder`, c'est le dossier lui-même.
   */
  startFolderPath: string;
};

export async function pruneEmptyFolders(
  params: PruneEmptyFoldersParams
): Promise<void> {
  const { prisma, appRoot, startFolderPath } = params;

  // Borne basse : on ne supprime jamais le dossier-statut `${appRoot}/<status>`
  // ni au-dessus. Le statut est le segment juste après l'appRoot, donc on
  // s'arrête dès que le path n'est pas STRICTEMENT plus profond que lui.
  const minDepth = appRoot.split("/").length + 1;

  let folderPath = startFolderPath;

  while (folderPath.split("/").length > minDepth) {
    // Un asset encore présent (ici ou dans un sous-dossier voisin non vidé)
    // ⇒ ni ce dossier ni ses ancêtres ne sont vides. On arrête.
    if (await folderHasAssets(folderPath)) break;

    await prisma.folder.deleteMany({
      where: { appRoot, fullPath: folderPath },
    });

    // L'entité DOSSIER Cloudinary, elle, survit au départ de ses assets
    // (les folders sont des objets à part — cf. doc de
    // cloudinary.service.ts) et le finder bâtit son arbre sur
    // `api.sub_folders` : sans cette suppression, un dossier fantôme
    // vide persiste côté source après un move (bug du 2026-07-03).
    // `delete_folder` n'accepte QUE les dossiers vides — précisément
    // l'état que `folderHasAssets` vient de certifier. Best-effort : un
    // dossier jamais matérialisé côté Cloudinary fait échouer l'appel,
    // on avale (il n'y a rien à supprimer).
    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch {
      // dossier inexistant côté Cloudinary — rien à faire
    }

    folderPath = folderPath.split("/").slice(0, -1).join("/");
  }
}
FILE_EOF
pnpm --filter backend typecheck