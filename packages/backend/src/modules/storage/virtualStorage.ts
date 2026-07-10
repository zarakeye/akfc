import type {
  StorageAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
  StorageMoveOperation,
  StoragePath,
  StorageProvider,
} from "@contracts/storage";
import { pickBackendByExtension } from "@contracts/storage";

import {
  getAdapter,
  type StorageAdapterDeps,
  type AdapterFor,
} from "@backend/modules/storage/providerRegistry";
import { getAssetInfo } from "../cloudinary/services/cloudinary.service";

const STATUS_SEGMENTS = ['pending', 'published', 'bin'] as const;
type LifecycleStatus = (typeof STATUS_SEGMENTS)[number];

/**
 * Statut applicatif dérivé d'un path : le segment juste après l'appRoot.
 * `AKFC/published/cours/x/trotinette` → 'published'. Renvoie null si le
 * segment n'est pas un statut connu. Convention identique au front
 * (statusFromPath) et à resolveMoveIntent, dupliquée ici pour ne pas créer
 * de dépendance backend → features front.
 */
function statusFromPath(path: string, appRoot: string): LifecycleStatus | null {
  const parts = path.split('/').filter(Boolean);
  const rootParts = appRoot.split('/').filter(Boolean);
  const seg = parts[rootParts.length];
  return (STATUS_SEGMENTS as readonly string[]).includes(seg)
    ? (seg as LifecycleStatus)
    : null;
}

/**
 * VirtualStorage — façade multi-backend
 *
 * Cette façade implémente `StorageAdapter` mais ne stocke rien elle-même.
 * Elle orchestre les sous-adapters (Cloudinary, R2…) pour offrir à ses
 * consommateurs une **vue unifiée** où le provider sous-jacent est
 * transparent.
 *
 * ─── Ce qu'elle apporte vs. les adapters directs ─────────────────────────
 *
 * Avant la façade : le client devait dire "provider: cloudinary" à chaque
 * appel, et était responsable de combiner les résultats si jamais il
 * voulait voir les deux backends. C'était une fuite d'abstraction.
 *
 * Avec la façade : le client appelle `list("AKFC/pending/Cours")` et reçoit
 * un mix des items des deux providers, dédupliqués si nécessaire. Le client
 * ignore qu'il y a plusieurs backends.
 *
 * ─── Stratégies par opération ────────────────────────────────────────────
 *
 * **Lecture (list, getTree, getNode, getMetadata)** : interroge les deux
 * providers en parallèle, fusionne les résultats. Les dossiers présents
 * dans les deux backends sont dédupliqués par path (un dossier logique
 * unique côté UI, peu importe sa présence dans 1 ou 2 backends).
 *
 * **Écriture (move, delete)** : nécessite de savoir QUI héberge l'item.
 * Pour les fichiers, on déduit du `pickBackendByExtension`. Pour les
 * dossiers, on doit potentiellement appliquer aux deux backends (un
 * dossier peut contenir des items des deux). Stratégie actuelle :
 *   - Sur un FILE → on dispatch via `pickBackendByExtension`
 *   - Sur un FOLDER → on applique aux DEUX backends, en tolérant les
 *     échecs de "n'existe pas chez ce provider"
 *
 * **Upload** : pas dans cette façade. Voir la procédure tRPC
 * `storage.createUploadAuthorization` qui dispatche elle-même selon le
 * MIME type via `pickBackend()`.
 *
 * ─── Limites actuelles connues (sous-chantier 3.B) ───────────────────────
 *
 *   - Pas de pagination cursor-based pour les `list` combinés. La façade
 *     concatène les pages des deux providers. Pour de gros volumes, ça
 *     deviendra un sujet — à ce moment-là, on introduira un curseur
 *     composé `{c?: string; r?: string}` encodé en base64.
 *
 *   - `getTree(depth > 1)` combine récursivement, ce qui peut faire
 *     beaucoup d'appels en profondeur. Acceptable pour `depth ≤ 2`,
 *     usage typique de la TreeView du finder.
 *
 *   - R2 est en stub (sous-chantier 3.B). La façade interroge R2 mais
 *     reçoit toujours des listes vides — comportement attendu jusqu'au
 *     sous-chantier 6.A.
 */
export class VirtualStorage implements StorageAdapter {
  private readonly cloudinary: AdapterFor<"cloudinary">;
  private readonly r2: AdapterFor<"r2">;
  private readonly deps: StorageAdapterDeps;

  constructor(deps: StorageAdapterDeps) {
    this.deps = deps;
    this.cloudinary = getAdapter("cloudinary", deps);
    this.r2 = getAdapter("r2", deps);
  }

  /* ====================================================================== */
  /*  Lecture                                                               */
  /* ====================================================================== */

  async list(options: ListOptions): Promise<ListResult> {
    const results = await Promise.allSettled([
      this.cloudinary.list(options),
      this.r2.list(options),
    ]);

    const cloudinary = pickFulfilled(results[0], "cloudinary.list");
    const r2 = pickFulfilled(results[1], "r2.list");

    if (!cloudinary && !r2) {
      // Les deux providers en panne — on propage la première erreur.
      throw (results[0] as PromiseRejectedResult).reason;
    }

    return {
      folders: dedupeFoldersByPath([
        ...(cloudinary?.folders ?? []),
        ...(r2?.folders ?? []),
      ]),
      files: [...(cloudinary?.files ?? []), ...(r2?.files ?? [])],
      nextCursor: null,
    };
  }

  async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
    const results = await Promise.allSettled([
      this.cloudinary.getTree(options),
      this.r2.getTree(options),
    ]);

    const cloudinary = pickFulfilled(results[0], "cloudinary.getTree");
    const r2 = pickFulfilled(results[1], "r2.getTree");

    if (!cloudinary && !r2) {
      throw (results[0] as PromiseRejectedResult).reason;
    }

    // Si l'un des deux a répondu, on l'utilise comme base et on merge l'autre
    // s'il a répondu aussi. Sinon on retourne juste celui qui a répondu.
    if (cloudinary && r2) {
      return { root: mergeFolderTrees(cloudinary.root, r2.root) };
    }
    return { root: (cloudinary ?? r2)!.root };
  }

  async getNode(path: StoragePath): Promise<StorageNode | null> {
    const results = await Promise.allSettled([
      this.cloudinary.getNode
        ? this.cloudinary.getNode(path)
        : Promise.resolve(null),
      this.r2.getNode ? this.r2.getNode(path) : Promise.resolve(null),
    ]);

    const c = pickFulfilled(results[0], "cloudinary.getNode");
    const r = pickFulfilled(results[1], "r2.getNode");

    if (
      results[0].status === "rejected" &&
      results[1].status === "rejected"
    ) {
      throw (results[0] as PromiseRejectedResult).reason;
    }

    // ⚠️ On PRÉFÈRE une réponse `file` concrète à une réponse `folder`.
    //
    // Un fichier à un path donné est non-ambigu ; une réponse `folder` est
    // souvent un provider qui rapporte un préfixe de façon optimiste — cas
    // typique : Cloudinary répond "folder" pour le path d'un fichier qui vit
    // en réalité sur R2. Avec un simple `c ?? r`, ce folder Cloudinary
    // masquait le `file` de R2 → resolveMoveIntent traitait le fichier R2
    // comme un dossier, `getTree` dessus ne ramassait rien, et l'item était
    // ignoré en silence lors d'un move multi-sélection. Préférer le `file`
    // corrige ça à la racine.
    const candidates = [c, r].filter(
      (n): n is StorageNode => n != null,
    );
    const file = candidates.find((n) => n.type === "file");
    return file ?? candidates[0] ?? null;
  }

  async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
    // On ne peut pas deviner le provider d'un path sans interroger la DB. On ne peut pas non plus se fier à l'extension (Cloudinary est extensionless). On doit donc interroger la DB pour savoir qui héberge le fichier, puis interroger le provider correspondant.
    const primary = await this.resolveProvider(path);
    const primaryAdapter = primary === "cloudinary" ? this.cloudinary : this.r2;
    const fallbackAdapter = primary === "cloudinary" ? this.r2 : this.cloudinary;

    try {
      if (primaryAdapter.getMetadata) {
        return await primaryAdapter.getMetadata(path);
      }
    } catch (err) {
      console.warn(
        `[VirtualStorage] primary getMetadata (${primary}) failed for "${path}", trying fallback. Error:`,
        err
      );
    }

    if (fallbackAdapter.getMetadata) {
      return fallbackAdapter.getMetadata(path);
    }
    return null;
  }

  /* ====================================================================== */
  /*  Dispatch de provider — autoritaire via la DB                          */
  /* ====================================================================== */

  /**
   * Détermine quel provider héberge le file à ce virtual path, en lisant le
   * discriminant DB plutôt qu'en devinant par l'extension.
   *
   * ─── Pourquoi pas l'extension ───────────────────────────────────────────
   *
   * Dans l'espace des virtual paths, un asset Cloudinary est EXTENSIONLESS
   * (c'est son public_id), un asset R2 porte son extension (vraie clé de
   * fichier). `pickBackendByExtension` faisait donc tomber tout public_id
   * Cloudinary (`…/trotinette`) sur le défaut R2 → `NoSuchKey` au move. Et un
   * public_id contenant un point (`…/taolu-v2.1`) piégerait n'importe quelle
   * heuristique. La source de vérité est la ligne `MediaAsset` : `publicId`
   * non-null ⇒ Cloudinary, `publicId` null ⇒ R2.
   *
   * ─── Matching tolérant (identique au media router) ──────────────────────
   *
   * Le `fullPath` stocké porte l'extension. Pour R2 le virtual path la porte
   * aussi → égalité stricte. Pour Cloudinary le virtual path est le public_id
   * extensionless → on matche `fullPath` commençant par `path + '.'`.
   *
   * Repli si la DB ne connaît pas le path (orphelin non enregistré, ou DB
   * indisponible) : heuristique améliorée `fallbackProviderForPath`.
   */
  private async resolveProvider(path: StoragePath): Promise<StorageProvider> {
    const { prisma, appRoot } = this.deps;
    try {
      const asset = await prisma.mediaAsset.findFirst({
        where: {
          appRoot,
          OR: [
            { fullPath: path },                       // R2 : clé exacte (avec extension)
            { fullPath: { startsWith: `${path}.` } }, // Cloudinary : public_id + extension
          ],
        },
        select: { publicId: true },
      });
      if (asset) return asset.publicId == null ? "r2" : "cloudinary";
    } catch (err) {
      console.warn(
        `[VirtualStorage] resolveProvider: lookup DB échoué pour "${path}", repli heuristique. Error:`,
        err
      );
    }
    return fallbackProviderForPath(path);
  }

  /**
   * Réconcilie la DB après un move physique réussi. Le move physique a déplacé
   * le fichier sur le provider, mais la DB n'est pas encore alignée sur le
   * nouvel emplacement (fullPath / publicId / status). Cette méthode met à
   * jour la ligne MediaAsset correspondante pour que la façade continue à
   * fonctionner correctement.
   * 
   * @param oldPath 
   * @param newPath 
   * @returns 
   */
  private async reconcileMovedAsset(
    oldPath: StoragePath,
    newPath: StoragePath,
  ): Promise<void> {
    const { prisma, appRoot } = this.deps;

    // Le provider est déterminé AVANT le move (la ligne existe encore à
    // l'ancien path). On le repasse pour éviter une 2e lecture DB.
    const provider = await this.resolveProvider(newPath).catch(() => null);

    // R2 : pas d'asset_id Cloudinary. On réconcilie par fullPath (clé S3
    // exacte, qui EST le path — pas de fragilité d'historique côté R2 car la
    // clé R2 = le path, et le move R2 déplace réellement la clé).
    if (provider === "r2") {
      await prisma.mediaAsset.updateMany({
        where: { appRoot, fullPath: oldPath },
        data: {
          fullPath: newPath,
          ...(statusFromPath(newPath, appRoot)
            ? { status: statusFromPath(newPath, appRoot)! }
            : {}),
        },
      });
      return;
    }

    // Cloudinary : on relit l'asset au NOUVEAU path pour son asset_id
    // immuable, puis on réancre la ligne par cet id — robuste quel que soit
    // l'historique des moves (contrairement au matching par ancien path).
    let info: { asset_id?: string; format?: string } | null = null;
    try {
      info = await getAssetInfo(newPath);
    } catch (err) {
      console.warn(
        `[VirtualStorage] reconcileMovedAsset: getAssetInfo("${newPath}") a échoué, réconciliation ignorée.`,
        err,
      );
      return;
    }

    const assetId = info?.asset_id;
    if (!assetId) {
      console.warn(
        `[VirtualStorage] reconcileMovedAsset: pas d'asset_id pour "${newPath}", réconciliation ignorée.`,
      );
      return;
    }

    const nextStatus = statusFromPath(newPath, appRoot);
    const nextFullPath = `${newPath}${info?.format ? "." + info.format : ""}`;

    await prisma.mediaAsset.updateMany({
      where: { appRoot, cloudinaryAssetId: assetId },
      data: {
        fullPath: nextFullPath,
        publicId: newPath,
        ...(nextStatus ? { status: nextStatus } : {}),
      },
    });
  }

  /* ====================================================================== */
  /*  Écriture                                                              */
  /* ====================================================================== */

  async move(operation: StorageMoveOperation): Promise<void> {
    if (operation.source.type === "file") {
      const provider = await this.resolveProvider(operation.source.path);
      const adapter = provider === "cloudinary" ? this.cloudinary : this.r2;
      if (!adapter.move) {
        throw new Error(`move(file) non supporté sur le provider "${provider}"`);
      }
      await adapter.move(operation);
      // Le déplacement physique a réussi : on aligne la DB sur le nouvel
      // emplacement (fullPath / publicId / status), sinon resolveByPaths,
      // l'enrichissement et les filtres par status restent sur l'ancien path.
      await this.reconcileMovedAsset(operation.source.path, operation.target.path);
      return;
    }

    // Folder → on applique aux backends qui SUPPORTENT move. Un dossier
    // "logique" peut contenir des items des deux. Les "n'existe pas" sont
    // tolérés silencieusement (au moins un des deux doit réussir).
    const promises: Promise<void>[] = [];
    if (this.cloudinary.move) promises.push(this.cloudinary.move(operation));
    if (this.r2.move) promises.push(this.r2.move(operation));

    if (promises.length === 0) {
      throw new Error("move(folder) : aucun provider n'implémente move");
    }

    const results = await Promise.allSettled(promises);
    const failures = results.filter((r) => r.status === "rejected");
    // Si TOUS échouent, on remonte la première erreur.
    if (failures.length === promises.length) {
      throw (failures[0] as PromiseRejectedResult).reason;
    }
  }

  async delete(path: StoragePath): Promise<void> {
    // Même logique que move : file → dispatch ; folder → broadcast tolérant.
    // On ne peut pas savoir sans interroger si le path est un file ou un
    // folder. Stratégie pragmatique : on tente d'abord en mode file
    // (dispatch par extension). Si l'extension ne donne pas de signal
    // clair (pas d'extension), on broadcast aux deux.

    const hasExtension = /\.[^/]+$/.test(path);
    if (hasExtension) {
      const provider = await this.resolveProvider(path);
      const adapter = provider === "cloudinary" ? this.cloudinary : this.r2;
      if (!adapter.delete) {
        throw new Error(`delete non supporté sur le provider "${provider}"`);
      }
      return adapter.delete(path);
    }

    const promises: Promise<void>[] = [];
    if (this.cloudinary.delete) promises.push(this.cloudinary.delete(path));
    if (this.r2.delete) promises.push(this.r2.delete(path));

    if (promises.length === 0) {
      throw new Error("delete(folder) : aucun provider n'implémente delete");
    }

    const results = await Promise.allSettled(promises);
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length === promises.length) {
      throw (failures[0] as PromiseRejectedResult).reason;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers internes — tolérance aux pannes                                   */
/* -------------------------------------------------------------------------- */

/**
 * Extrait la valeur d'une promesse settled, en loggant l'erreur si elle est
 * rejetée. Retourne `null` en cas d'erreur — le caller décide quoi faire
 * (typiquement : utiliser l'autre backend ou propager si les deux ont échoué).
 *
 * Cette discipline transforme la façade en système robuste : un provider en
 * panne ne fait pas tomber tout le finder, il est juste invisible le temps
 * de la panne, avec un log côté serveur pour diagnostic.
 */
function pickFulfilled<T>(
  result: PromiseSettledResult<T>,
  context: string
): T | null {
  if (result.status === "fulfilled") return result.value;
  console.warn(
    `[VirtualStorage] ${context} failed — provider ignored for this call. Error:`,
    result.reason
  );
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers internes — déduplication                                          */
/* -------------------------------------------------------------------------- */

/**
 * Déduplique une liste de folders par leur `path`.
 *
 * Quand un dossier "logique" existe dans les deux backends (parce qu'il
 * a été créé par des items Cloudinary ET R2 sous-jacents), la façade le
 * voit deux fois. On garde la première occurrence — leur structure
 * surface (name, path) est censée être identique de toute façon.
 *
 * Si l'un des deux porte des `children` chargés et l'autre non, on
 * privilégie celui qui en a (logique "plus d'info gagne").
 */
function dedupeFoldersByPath(
  folders: ReadonlyArray<StorageFolderNode>
): StorageFolderNode[] {
  const map = new Map<string, StorageFolderNode>();
  for (const f of folders) {
    const existing = map.get(f.path);
    if (!existing) {
      map.set(f.path, f);
      continue;
    }
    // Conflit : l'un des deux a peut-être plus d'info. On garde celui qui
    // a `children` chargé, sinon le premier.
    if (existing.children === undefined && f.children !== undefined) {
      map.set(f.path, f);
    }
  }
  return Array.from(map.values());
}

/**
 * Fusionne deux folder trees (racines partagées) en un seul arbre logique.
 *
 * Algo récursif : pour chaque sous-folder, on cherche les occurrences
 * dans les deux côtés et on les merge récursivement. Les files sont
 * concaténés (chaque file appartient à un seul backend).
 */
function mergeFolderTrees(
  a: StorageFolderNode,
  b: StorageFolderNode
): StorageFolderNode {
  const childrenA = a.children ?? [];
  const childrenB = b.children ?? [];

  // Map des sous-folders pour merge par nom
  const aFolders = new Map<string, StorageFolderNode>();
  const aFiles: StorageFileNode[] = [];
  for (const c of childrenA) {
    if (c.type === "folder") aFolders.set(c.path, c);
    else aFiles.push(c);
  }
  const bFolders = new Map<string, StorageFolderNode>();
  const bFiles: StorageFileNode[] = [];
  for (const c of childrenB) {
    if (c.type === "folder") bFolders.set(c.path, c);
    else bFiles.push(c);
  }

  const mergedFolders: StorageFolderNode[] = [];
  for (const [path, fa] of aFolders) {
    const fb = bFolders.get(path);
    mergedFolders.push(fb ? mergeFolderTrees(fa, fb) : fa);
    bFolders.delete(path);
  }
  // Folders uniques à B
  for (const fb of bFolders.values()) {
    mergedFolders.push(fb);
  }

  return {
    type: "folder",
    name: a.name,
    path: a.path,
    children: [...mergedFolders, ...aFiles, ...bFiles],
    hasChildren: mergedFolders.length + aFiles.length + bFiles.length > 0,
  };
}

/**
 * Repli de dispatch quand la DB ne connaît pas le path (orphelin non
 * enregistré, ou DB indisponible). Utilisé uniquement par `resolveProvider`.
 *
 * Invariant : un virtual path Cloudinary est extensionless (public_id), un
 * virtual path R2 porte son extension. Un segment final SANS extension ne
 * peut donc être qu'un public_id Cloudinary — plus fiable que le
 * `pickBackendByExtension` brut, qui routait l'extensionless vers R2.
 */
function fallbackProviderForPath(path: StoragePath): StorageProvider {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  const hasRealExtension = dot > 0 && dot < name.length - 1;
  return hasRealExtension ? pickBackendByExtension(path) : "cloudinary";
}
