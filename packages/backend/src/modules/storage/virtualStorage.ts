import type {
  StorageAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageMetadata,
  StorageMoveOperation,
  StoragePath,
} from "@contracts/storage";

import {
  getAdapter,
  type StorageAdapterDeps,
  type AdapterFor,
} from "@backend/modules/storage/providerRegistry";

/*
 * `statusFromPath` vivait ici — quatrième copie d'une même règle, avec sa
 * propre opinion sur le segment inconnu. Elle servait à redériver
 * `MediaAsset.status` du chemin d'arrivée après chaque move.
 *
 * Elle est supprimée, pas désactivée. `status` a maintenant une source, et
 * une seule : `media.setStatus`. Un move est redevenu ce qu'il aurait
 * toujours dû être — une réorganisation, qui ne dit rien du cycle de vie.
 */

/**
 * VirtualStorage — façade de stockage.
 *
 * Implémente `StorageAdapter` en déléguant à l'adapter R2 (seul stockage
 * depuis la sortie de Cloudinary). L'adapter réaligne lui-même les lignes
 * `MediaAsset` après un déplacement (fichier ou dossier) : la façade n'a
 * rien à ajouter, elle ne fait que désigner le stockage.
 *
 * Les consommateurs (router storage, services) ne parlent qu'à cette façade :
 * si un second stockage revenait un jour, c'est ici qu'il serait combiné.
 */
export class VirtualStorage implements StorageAdapter {
  private readonly r2: AdapterFor<"r2">;
  private readonly deps: StorageAdapterDeps;

  constructor(deps: StorageAdapterDeps) {
    this.deps = deps;
    this.r2 = getAdapter("r2", deps);
  }

  /* ====================================================================== */
  /*  Lecture                                                               */
  /* ====================================================================== */

  list(options: ListOptions): Promise<ListResult> {
    return this.r2.list(options);
  }

  getTree(options: GetTreeOptions): Promise<GetTreeResult> {
    return this.r2.getTree(options);
  }

  async getNode(path: StoragePath): Promise<StorageNode | null> {
    return this.r2.getNode ? this.r2.getNode(path) : null;
  }

  async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
    return this.r2.getMetadata ? this.r2.getMetadata(path) : null;
  }

  /* ====================================================================== */
  /*  Écriture                                                              */
  /* ====================================================================== */

  async move(operation: StorageMoveOperation): Promise<void> {
    if (!this.r2.move) throw new Error("move non supporté par le stockage");
    // L'adapter déplace l'objet ET la ligne MediaAsset (la clé R2 EST le chemin) : un second
    // `updateMany` ici ne trouverait plus rien à mettre à jour.
    await this.r2.move(operation);
  }

  async delete(path: StoragePath): Promise<void> {
    if (!this.r2.delete) throw new Error("delete non supporté par le stockage");
    return this.r2.delete(path);
  }
}
