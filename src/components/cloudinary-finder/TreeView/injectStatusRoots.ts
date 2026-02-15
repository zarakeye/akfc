import { FolderStatus } from "@/core/cloudinary/folder.types";
import { FolderNode, VirtualFolderNode, RootNode } from "@/components/cloudinary-finder/types";

const STATUSES: FolderStatus[] = ["pending", "published", "bin"];
const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'my-app';

/**
 * Inject virtual folders for missing statuses into the tree.
 *
 * @param {FolderNode} tree - The tree to inject into.
 * @returns {RootNode[]} - The injected tree.
 */
export function injectStatusRoots(
  tree: FolderNode
): RootNode[] {
  const roots: RootNode[] = [];

  for (const status of STATUSES) {
    const existing = tree.children.find(
      (child): child is FolderNode =>
        child.type === "folder" && child.name === status
    );

    if (existing) {
      // Dossier réel existant
      roots.push(existing);
    } else {
      // Dossier virtuel
      const virtualNode: VirtualFolderNode = {
        type: "virtual-folder",
        name: status,
        fullPath: `${APP_SHORT_NAME}/${status}`,
        status,
      };
      
      roots.push(virtualNode);
    }
  }

  return roots;
}