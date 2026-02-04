import type { FolderStatus } from "@/core/cloudinary/folder.types";

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
  type: 'virtual-folder';
  status: FolderStatus;
  node: FolderNode | null; // null => dossier virtuel non existant
};