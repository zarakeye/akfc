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
 * depuis la sortie de Cloudinary), et ajoute ce que l'adapter ne fait pas :
 * réaligner la ligne `MediaAsset` après le déplacement d'un fichier.
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
    await this.r2.move(operation);
    if (operation.source.type === "file") {
      // Le déplacement physique a réussi : on aligne la DB sur le nouvel
      // emplacement, sinon resolveByPaths, l'enrichissement et les filtres
      // par status restent sur l'ancien path. La clé R2 EST le path.
      const { prisma, appRoot } = this.deps;
      await prisma.mediaAsset.updateMany({
        where: { appRoot, fullPath: operation.source.path },
        data: { fullPath: operation.target.path },
      });
    }
  }

  async delete(path: StoragePath): Promise<void> {
    if (!this.r2.delete) throw new Error("delete non supporté par le stockage");
    return this.r2.delete(path);
  }
}
