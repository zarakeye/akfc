import { FolderNode, VirtualFolderNode } from "@components/cloudinary-finder/types";

const VIRTUAL_KINDS = ["pending", "published", "bin"] as const;

export function injectVirtualFolders(
  root: FolderNode
): FolderNode {

  const existingFolderNames = new Set(
    root.children
      .filter((child) => child.type === "folder")
      .map((child) => child.name)
  );

  const virtuals: VirtualFolderNode[] = VIRTUAL_KINDS
    .filter((kind) => !existingFolderNames.has(kind))
    .map((kind) => ({
      type: "virtual-folder",
      name: kind,
      kind,
      children: [],
    }));

  return {
    ...root,
    children: [...virtuals, ...root.children],
  };
}