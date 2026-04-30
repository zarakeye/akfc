export type NodeType = 'folder' | 'file';

export interface finderNode {
  id: string;             // unique (peut être path ou uuid selon adapter)
  name: string;
  path: string;           // chemin logique (source of truth)
  type: NodeType;
  
  hasChildren?: boolean;  // utile pour lazy loading
  size?: number;          // optionnel (files)
  mimeType?: string;      // optionnel

  // extensible sans casser le core
  meta?: Record<string, unknown>;
}