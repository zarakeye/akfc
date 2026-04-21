import type { FolderStatus } from "./folder.types";

// 🔒 Type discriminant commun
export type BaseNode = {
  name: string;
  type: "file" | "folder" | "virtual-folder";
  fullPath: string;
};

// ─────────────────────────────
// 🖼️ File
// ─────────────────────────────
export type FileNode = BaseNode & {
  type: "file";
  publicId: string;
  mediaAssetId?: string;
};

// ─────────────────────────────
// 📁 Folder
// ─────────────────────────────
export type FolderNode = BaseNode & {
  type: "folder";
  children: TreeNode[];
};

// ─────────────────────────────
// 🧪 Folder virtuel (UX only)
// Root logique d’un status
// ─────────────────────────────
export type VirtualFolderNode = BaseNode & {
  type: "virtual-folder";
  status: FolderStatus;
};

// ─────────────────────────────
// 🌳 Union stricte (structure réelle)
// ─────────────────────────────
export type TreeNode = FileNode | FolderNode;

// ─────────────────────────────
// 🌳 Union flexible
// ─────────────────────────────
export type RootNode = FolderNode | VirtualFolderNode;