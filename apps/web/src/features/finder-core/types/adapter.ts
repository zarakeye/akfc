import type { FinderNode } from "@features/finder-core/types/node";

export interface ListOptions {
  path: string;
  cursor?: string | null;
  limit?: number;
}

export interface ListResult {
  folders: FinderNode[];
  files: FinderNode[];
  
  nextCursor: string | null;
}

export interface FileAdapter {
  /**
   * Liste le contenu d'un dossier donné par son chemin logique.
   * @param options
   */
  list(options: ListOptions): Promise<ListResult>;

  /**
   * (optionnel) Récupérer un node précis
   */
  getNode?(path: string): Promise<FinderNode | null>;

  /**
   * (optional) move
   * @param sourcePath 
   * @param targetPath 
   */
  move?(sourcePath: string, targetPath: string): Promise<void>;

  /**
   * (optionnel) delete
   * @param path
   */
  delete?(path: string): Promise<void>;
}

export interface PartSegment {
  name: string;
  path: string;
}
