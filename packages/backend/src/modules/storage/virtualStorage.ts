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

  constructor(deps: StorageAdapterDeps) {
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

    return c ?? r ?? null;
  }

  async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
    // Pour les metadata d'un fichier, un seul backend héberge réellement
    // l'asset. On essaie selon `pickBackendByExtension`. Si ce backend
    // est en panne, on tente l'autre par sécurité — l'asset existe forcément
    // chez l'un des deux puisque l'utilisateur le voit dans le finder.
    const primary = inferProviderForPath(path);
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
  /*  Écriture                                                              */
  /* ====================================================================== */

  async move(operation: StorageMoveOperation): Promise<void> {
    if (operation.source.type === "file") {
      // Pour un file, le backend qui le détient est déterminé par
      // l'extension via `pickBackendByExtension`.
      const provider = inferProviderForPath(operation.source.path);
      const adapter = provider === "cloudinary" ? this.cloudinary : this.r2;
      if (!adapter.move) {
        throw new Error(`move(file) non supporté sur le provider "${provider}"`);
      }
      return adapter.move(operation);
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
      const provider = inferProviderForPath(path);
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
 * Déduit le provider qui héberge probablement un path donné.
 *
 * Pour un file : basé sur l'extension via `pickBackendByExtension`.
 * Pour un folder (pas d'extension) : impossible à savoir sans interrogation,
 * donc on retombe sur le défaut R2 — mais la plupart des appels sur des
 * folders passent par la voie "broadcast aux deux" plus haut, donc cette
 * branche n'est utilisée que pour des cas sans extension qu'on doit
 * traiter quand même.
 */
function inferProviderForPath(path: StoragePath): StorageProvider {
  return pickBackendByExtension(path);
}
