import { FolderStatus } from "@/core/cloudinary/folder.types";

// 🔒 Type discriminant commun
export type BaseNode = {
  name: string;
  type: 'file' | 'folder' | 'virtual-folder';
};

// ─────────────────────────────
// 📁 Folder
// ─────────────────────────────
export type FileNode = BaseNode & {
  type: 'file';
  fullPath: string;
  url: string;
};

// ─────────────────────────────
// 🖼️ File
// ─────────────────────────────
export type FolderNode = BaseNode & {
  type: 'folder';
  name: string;
  fullPath: string;
  children: TreeNode[];
};

// ─────────────────────────────
// 🌳 Union stricte
// ─────────────────────────────
export type TreeNode = FileNode | FolderNode;

// ─────────────────────────────
// 🧪 Folder virtuel (UX only)
// Root logique d’un status
// node === null => virtual (dossier vide)
// ─────────────────────────────
export type StatusRootNode = BaseNode & {
  status: FolderStatus;
  node: FolderNode | null; // null => dossier virtuel non existant
};

export type ExplorerNode =
  | ExplorerFolderNode
  | ExplorerVirtualFolderNode;

export type ExplorerFolderNode = {
  kind: 'folder';
  name: string;
  fullPath: string;
  children: ExplorerNode[];
};

export type ExplorerVirtualFolderNode = {
  kind: 'virtual';
  status: FolderStatus; // 'pending' | 'published' | 'bin'
  name: string;
  virtualPath: string;
  children: ExplorerFolderNode[];
};
