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
  publicId: string;
  url: string;
};

// ─────────────────────────────
// 🧪 Folder virtuel (UX only)
// ─────────────────────────────
export type VirtualFolderNode = BaseNode & {
  type: 'virtual-folder';
  kind: 'pending' | 'published' | 'bin';
  children: TreeNode[];
};

// ─────────────────────────────
// 🖼️ File
// ─────────────────────────────
export type FolderNode = BaseNode & {
  type: 'folder';
  path: string;
  children: TreeNode[];
};

// ─────────────────────────────
// 🌳 Union stricte
// ─────────────────────────────
export type TreeNode = FileNode | FolderNode | VirtualFolderNode;
