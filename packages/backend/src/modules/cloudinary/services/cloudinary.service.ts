import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import type { TransformationOptions } from "cloudinary";
import {
  getCached,
  setCached,
  invalidate as invalidateResourcesCache,
} from "@backend/modules/cloudinary/cache/resourcesCache";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type ResourceType = "image" | "video" | "raw";
export type Variant = "thumb" | "small" | "medium" | "large" | "original";

export interface ListAuthenticatedResourcesResult {
  publicId: string;
  url: string;
  /**
   * Format technique de l'asset (`jpg`, `png`, `mp4`, ...).
   *
   * L'API Cloudinary `resources` retourne ce champ pour chaque asset ;
   * on le préserve ici pour qu'il puisse remonter jusqu'au `FileNode`
   * du tree et au front (qui s'en sert pour calculer `kind` = image/video/document).
   */
  format?: string;
}

interface GetAssetInfoResult {
  resource_type: ResourceType;
  bytes?: number;
  created_at?: string;
  asset_id?: string;
  format?: string;
}

/* -------------------------------------------------------------------------- */
/*                              CONFIG TRANSFO                                */
/* -------------------------------------------------------------------------- */

const transformations: Record<Variant, TransformationOptions> = {
  thumb: { width: 150, height: 150, crop: "fill" },
  small: { width: 300, crop: "scale" },
  medium: { width: 600, crop: "scale" },
  large: { width: 1200, crop: "scale" },
  original: {},
};

/* -------------------------------------------------------------------------- */
/*                             CORE CLOUDINARY                                */
/* -------------------------------------------------------------------------- */

/**
 * Génère une URL signée pour un asset Cloudinary authenticated.
 */
export function buildAuthenticatedUrl(
  publicId: string,
  variant: Variant,
  resourceType: ResourceType = "image",
  version?: number,
  format?: string,
): string {
  // Cloudinary REFUSE les transformations sur les ressources `raw` (pdf, md,
  // zip…) : l'URL signée avec transformation retourne 404, et l'appelant
  // tombe alors sur l'image de fallback. On ne transforme donc que les
  // resource_types qui le supportent (image / video).
  const transformation =
    resourceType === "raw" ? {} : (transformations[variant] ?? {});

  // ─── Pourquoi transmettre le format ? ──────────────────────────────────
  //
  // Une URL de livraison Cloudinary s'écrit `<public_id>.<format>`. Le
  // serveur coupe donc le dernier segment au DERNIER point. Sans extension
  // explicite, un public_id qui contient un point ailleurs qu'en fin de nom
  // est tronqué : « …/CNI recto PORQUET (ep. BAZZE) Yvonne » est lu comme le
  // public_id « …/CNI recto PORQUET (ep » assorti du format « BAZZE) Yvonne ».
  // Résultat : 404 sur les trois resource_types, puis image de secours.
  //
  // On ne DEVINE pas ce format — l'appelant le fournit (meta.format côté
  // client, autoritaire). Deux abstentions : sur `raw`, dont le public_id
  // porte déjà son extension ; et quand le public_id se termine déjà par
  // `.<format>` (cas des URLs bâties depuis MediaAsset.publicId).
  const appendFormat =
    format !== undefined &&
    resourceType !== "raw" &&
    !publicId.toLowerCase().endsWith(`.${format.toLowerCase()}`);

  return cloudinary.url(publicId, {
    transformation,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    secure: true,
    ...(appendFormat ? { format } : {}),
    // Version Cloudinary (numéro du binaire) : produit une URL `.../v<n>/...`
    // que le CDN traite comme unique. Sans elle, un asset écrasé (publicId
    // fixe, ex. avatar) sert l'ANCIEN binaire encore en cache CDN.
    ...(version ? { version } : {}),
  });
}

/**
 * Récupère un asset Cloudinary authenticated.
 * Retourne le Response natif (streamable).
 */
export async function fetchAuthenticatedAsset(
  publicId: string,
  variant: Variant,
  version?: number,
  format?: string,
): Promise<Response | null> {
  // [DIAG TEMPORAIRE] Muet sauf si AKFC_DIAG_MATCH est défini et que le
  // publicId le contient. JSON.stringify pour rendre lisibles les caractères
  // invisibles (espace final, U+00A0, tiret long…).
  const diagMatch = process.env.AKFC_DIAG_MATCH;
  const diagOn = Boolean(diagMatch) && publicId.includes(diagMatch as string);
  if (diagOn) {
    console.log("[diag] publicId =", JSON.stringify(publicId));
  }

  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const url = buildAuthenticatedUrl(publicId, variant, rt, version, format);

      const res = await fetch(url, {
        cache: "no-store",
      });

      // [DIAG TEMPORAIRE] `x-cld-error` porte le motif du refus en clair.
      if (diagOn) {
        console.log(
          `[diag] ${rt} → ${res.status}`,
          res.headers.get("x-cld-error") ?? "(pas d'en-tête x-cld-error)",
          url,
        );
      }

      if (!res.ok) continue;

      return res; // ✅ on retourne le Response natif
    } catch {
      // on tente le prochain resource_type
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              METADATA / CHECK                              */
/* -------------------------------------------------------------------------- */

/**
 * Récupère les métadonnées d'un asset (multi resource_type).
 */
export async function getAssetInfo(
  publicId: string,
): Promise<GetAssetInfoResult> {
  const withoutExtension = publicId.replace(/\.[^/.]+$/, "");
  const candidates = withoutExtension !== publicId ? [publicId, withoutExtension] : [publicId];
  for (const candidate of candidates) for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(candidate, {
        type: "authenticated",
        resource_type: rt,
      });
      console.log("[asset_id check]", res?.asset_id, res?.public_id);

      if (res?.public_id) {
        return {
          resource_type: rt,
          bytes: typeof res.bytes === "number" ? res.bytes : undefined,
          created_at: res.created_at ? String(res.created_at) : undefined,
          asset_id: typeof res.asset_id === "string" ? res.asset_id : undefined,
          format: typeof res.format === "string" ? res.format : undefined,
        };
      }
    } catch {
      // try next
    }
  }

  throw new Error(`Asset not found (any resource_type): ${publicId}`);
}

/**
 * Vérifie l'existence d'un asset (sans throw).
 */
export async function fileExists(publicId: string): Promise<boolean> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const res = await cloudinary.api.resource(publicId, {
        type: "authenticated",
        resource_type: rt,
      });

      if (res?.public_id) return true;
    } catch {
      // continue
    }
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

/**
 * Supprime tous les assets ET tous les dossiers sous un prefix.
 *
 * ─── Pourquoi 2 étapes ? ─────────────────────────────────────────────────
 *
 * Cloudinary distingue deux concepts indépendants :
 *
 *   1. **Assets** : les fichiers (images, vidéos, raw). Listés par
 *      `api.resources`, supprimés par `api.delete_resources_by_prefix`.
 *
 *   2. **Folders** : les "dossiers" qui peuvent exister indépendamment
 *      des assets — soit créés explicitement via `api.create_folder`,
 *      soit créés implicitement quand un asset y est uploadé. Listés
 *      par `api.sub_folders`, supprimés par `api.delete_folder` (qui
 *      n'accepte QUE les dossiers vides).
 *
 * `delete_resources_by_prefix` ne touche pas aux dossiers. Donc après
 * suppression des assets, des dossiers vides peuvent subsister sous le
 * prefix → ils restent visibles dans la TreeView du finder (qui consomme
 * `api.sub_folders` pour bâtir l'arbo), perçus comme des "vestiges".
 *
 * Cette fonction règle le problème en complétant la suppression des
 * assets par une suppression récursive des sous-dossiers (depth-first,
 * pour que les enfants soient vides avant qu'on supprime leur parent).
 *
 * Invalide le cache des resources à la fin — les entrées cachées sont
 * stale dès qu'on a muté la structure.
 */
export async function deleteByPrefix(
  prefix: string,
): Promise<{ success: boolean }> {
  // ─── Étape 1 : supprimer tous les assets sous le prefix ─────────────────
  for (const resourceType of ["image", "video", "raw"] as const) {
    await cloudinary.api.delete_resources_by_prefix(prefix, {
      type: "authenticated",
      resource_type: resourceType,
    });
  }

  // ─── Étape 2 : supprimer récursivement les sous-dossiers vides ──────────
  //
  // Une fois les assets supprimés, on peut tenter de supprimer le dossier
  // racine `prefix` lui-même via `deleteCloudinaryFolderRecursive`. Cette
  // helper descend en profondeur (DFS) pour vider les enfants avant le
  // parent — sinon `delete_folder` échoue avec "folder not empty".
  //
  // On tolère silencieusement les erreurs : si le dossier n'existe pas
  // (cas typique d'un `prefix` sans aucun asset historique), pas grave.
  await deleteCloudinaryFolderRecursive(prefix);

  invalidateResourcesCache();

  return { success: true };
}

/**
 * Helper interne — supprime récursivement un dossier Cloudinary et tous
 * ses sous-dossiers, depth-first. À appeler APRÈS avoir supprimé les
 * assets sous ce dossier (sinon `delete_folder` échoue).
 *
 * Tolère :
 *   - Le dossier qui n'existe pas (ex: prefix orphelin) → no-op silencieux.
 *   - Erreurs de listage d'un sous-dossier → log et continue (on supprime
 *     ce qu'on peut, on ne bloque pas tout le batch sur un cas particulier).
 */
export async function deleteCloudinaryFolderRecursive(
  folderPath: string,
): Promise<void> {
  // Liste les sous-dossiers directs.
  let subFolders: Array<{ name: string; path: string }> = [];
  try {
    const result = await cloudinary.api.sub_folders(folderPath);
    subFolders = (result.folders ?? []) as Array<{
      name: string;
      path: string;
    }>;
  } catch (err) {
    const desc = describeCloudinaryError(err);
    // Le dossier n'existe pas → nothing to do, on retourne silencieusement.
    // Cloudinary répond typiquement avec "Folder not found" ou HTTP 404.
    if (
      desc.message.toLowerCase().includes("not found") ||
      desc.http_code === 404
    ) {
      return;
    }
    // Autre erreur : on log et on continue (on ne propage pas — la fonction
    // est utilisée dans des batches où une erreur partielle ne doit pas
    // bloquer le reste).
    console.warn(
      `[deleteCloudinaryFolderRecursive] sub_folders failed for '${folderPath}':`,
      desc,
    );
    return;
  }

  // DFS : on vide d'abord les enfants pour pouvoir supprimer le parent.
  for (const sub of subFolders) {
    await deleteCloudinaryFolderRecursive(sub.path);
  }

  // Maintenant le dossier `folderPath` ne devrait plus avoir de sous-dossiers.
  // On tente de le supprimer. Encore tolérant — si le dossier contient
  // encore des assets cachés (par exemple resource_type pas couvert ailleurs),
  // l'API renverra une erreur qu'on log mais sans bloquer.
  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch (err) {
    const desc = describeCloudinaryError(err);
    if (
      desc.message.toLowerCase().includes("not found") ||
      desc.http_code === 404
    ) {
      // Pas un échec — le dossier n'existait déjà plus.
      return;
    }
    console.warn(
      `[deleteCloudinaryFolderRecursive] delete_folder failed for '${folderPath}':`,
      desc,
    );
  }
}

/**
 * Helper pour extraire un message + http_code lisible depuis une erreur
 * Cloudinary. L'API admin renvoie typiquement
 *   { error: { message, http_code }, http_code, name, ... }
 * — quand on fait `String(err)` ou `err.message` directement, on obtient
 * `[object Object]` ou `undefined`. Ce helper sait dénormaliser.
 */
function describeCloudinaryError(err: unknown): {
  message: string;
  http_code?: number;
} {
  if (err instanceof Error) {
    return { message: err.message };
  }
  if (typeof err === "string") {
    return { message: err };
  }
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    const inner =
      obj.error && typeof obj.error === "object"
        ? (obj.error as Record<string, unknown>)
        : null;
    const message = String(
      inner?.message ?? obj.message ?? JSON.stringify(err) ?? "<unknown>",
    );
    const http_code =
      typeof inner?.http_code === "number"
        ? inner.http_code
        : typeof obj.http_code === "number"
          ? obj.http_code
          : undefined;
    return { message, http_code };
  }
  return { message: String(err) };
}

/* -------------------------------------------------------------------------- */
/*                                   LIST                                     */
/* -------------------------------------------------------------------------- */

/**
 * Liste les assets authenticated sous un prefix.
 *
 * 🚀 Utilise un cache in-memory (`resourcesCache`) pour court-circuiter
 * les appels répétés sur le même prefix — l'API admin Cloudinary mettant
 * typiquement plusieurs secondes par appel, le cache rend la navigation
 * du finder fluide en dehors du tout premier appel.
 *
 * Le cache est invalidé automatiquement lors de toute mutation
 * (cf. `deleteByPrefix` ci-dessus, et les services move / register).
 *
 * ─── ⚠️ Subtilité Cloudinary : 3 resource_type distincts ─────────────────
 *
 * L'API `cloudinary.api.resources()` filtre **silencieusement** sur
 * `resource_type=image` par défaut. Sans spécifier, les vidéos et les
 * fichiers raw (PDF, ZIP, etc.) sont **ignorés** sans erreur.
 *
 * Cloudinary catégorise tous les assets en 3 buckets disjoints :
 *   - `image` : JPG, PNG, WebP, AVIF, GIF…
 *   - `video` : MP4, MOV, WebM, et — sans doute surprenant — les audios
 *               (MP3, WAV, M4A) que Cloudinary range avec les vidéos
 *   - `raw`   : PDF, ZIP, DOCX, TXT, tout le reste
 *
 * Pour avoir la liste complète, on doit faire **3 appels en parallèle**
 * (un par resource_type) et merger les résultats. Coût latence : 0
 * (parallélisé), coût quotas : 3 appels au lieu d'un.
 *
 * 💡 Dans notre archi AKFC :
 *   - Cloudinary stocke image + video (cf. `pickBackendByExtension`)
 *   - R2 stocke audio + raw (PDF, ZIP, MD, DOCX…)
 * Mais on garde l'appel `raw` ici par robustesse : si jamais un fichier
 * était poussé en raw sur Cloudinary historiquement (ou par un autre
 * outil), on ne le perd pas du finder.
 *
 * Si l'un des 3 appels échoue, on garde les résultats des autres
 * (Promise.allSettled) et on log l'erreur — un cas "tous les images
 * mais pas les vidéos" est moins pire que "rien du tout".
 */
export async function listAuthenticatedResources(
  prefix: string,
): Promise<ListAuthenticatedResourcesResult[]> {
  const cached = getCached(prefix);
  if (cached !== null) {
    return cached;
  }

  const baseArgs = {
    type: "authenticated" as const,
    prefix,
    max_results: 500,
  };

  const settled = await Promise.allSettled([
    cloudinary.api.resources({ ...baseArgs, resource_type: "image" }),
    cloudinary.api.resources({ ...baseArgs, resource_type: "video" }),
    cloudinary.api.resources({ ...baseArgs, resource_type: "raw" }),
  ]);

  const mapped: ListAuthenticatedResourcesResult[] = [];
  const labels = ["image", "video", "raw"] as const;

  // for (let i = 0; i < settled.length; i++) {
  //   const o = settled[i];
  // }

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === "rejected") {
      // On log mais on continue : mieux vaut une liste partielle qu'aucune.
      console.error(
        `[listAuthenticatedResources] resource_type=${labels[i]} failed for prefix '${prefix}':`,
        outcome.reason,
      );
      continue;
    }
    for (const r of outcome.value.resources) {
      mapped.push({
        publicId: r.public_id,
        url: r.secure_url,
        format: r.format,
      });
    }
  }

  setCached(prefix, mapped);

  return mapped;
}

/**
 * Construit une URL signée vers le POSTER (frame représentative) d'une vidéo
 * authenticated. Cloudinary génère l'image à la volée : resource_type vidéo +
 * format jpg + start_offset auto (frame non-noire choisie automatiquement).
 *
 * Distinct de buildAuthenticatedUrl, qui applique des transformations IMAGE
 * sur le resource_type détecté — inadapté pour extraire une frame d'une vidéo.
 */
export function buildVideoPosterUrl(
  publicId: string,
  variant: Variant = "large",
): string {
  const sizing = transformations[variant] ?? {};
  return cloudinary.url(publicId, {
    resource_type: "video",
    type: "authenticated",
    format: "jpg",
    sign_url: true,
    secure: true,
    transformation: [{ start_offset: "0" }, sizing],
  });
}

/**
 * Récupère le poster d'une vidéo authenticated. Retourne le Response natif (streamable).
 *
 * @param publicId
 * @param variant
 * @returns
 */
export async function fetchVideoPoster(
  publicId: string,
  variant: Variant,
): Promise<Response | null> {
  try {
    const url = buildVideoPosterUrl(publicId, variant);
    console.log("[poster] url=", url);
    const res = await fetch(url, { cache: "no-store" });
    console.log(
      "[poster] status=",
      res.status,
      "ct=",
      res.headers.get("content-type"),
    );
    if (!res.ok) return null;
    return res;
  } catch (e) {
    console.log("[poster] threw", e);
    return null;
  }
}
