import { TRPCError } from "@trpc/server";

import { isUnderAppRoot } from "@backend/modules/storage/logicalPath";

export function sanitizeBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const sanitized = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!sanitized) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid file name.",
    });
  }

  return sanitized;
}

/**
 * Contrôle de sûreté du chemin d'un asset téléversé.
 *
 * ─── Ce qu'elle ne vérifie PLUS ─────────────────────────────────────────
 *
 * Elle exigeait un chemin sous `${appRoot}/pending/`. Ce n'est plus vrai
 * depuis que le statut a quitté l'arborescence : un upload naît `pending`
 * parce que `registerUploadedAssets` écrit `status: "pending"` en base, pas
 * parce qu'il atterrit dans un dossier de ce nom. `resolvePendingUploadFolder`
 * ne produit plus aucun chemin de cette forme — la garde refusait donc TOUS
 * les téléversements.
 *
 * ─── Où est le vrai verrou ──────────────────────────────────────────────
 *
 * Dans `registerUploadedAssets`, juste après cet appel : `asset.folder` y est
 * comparé au dossier calculé PAR LE SERVEUR depuis la destination signée, et
 * toute divergence est refusée. Un client ne choisit donc pas son chemin.
 *
 * Cette fonction est une défense de profondeur : elle empêche qu'un chemin
 * sorte de l'arborescence de l'application ou vise la corbeille.
 */
export function assertSafeCloudinaryPath(path: string, appRoot: string): void {
  // Comparaison SEGMENT PAR SEGMENT et non par préfixe : une racine nommée
  // `AKFC-bis` ne doit pas passer pour être sous `AKFC`.
  if (!isUnderAppRoot(path, appRoot)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Upload path is outside the application root.",
    });
  }

  if (path.includes("..") || path.includes("/.trash/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid asset path.",
    });
  }
}