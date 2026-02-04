import { FolderStatus } from "@/core/cloudinary/folder.types";
import { FolderNode, StatusRootNode } from "@/components/cloudinary-finder/types";

const STATUSES: FolderStatus[] = ["pending", "published", "bin"];

export function injectStatusRoots(
  root: FolderNode
): StatusRootNode[] {
  return STATUSES.map((status) => {

    const realFolder =
      root.children.find(
        (child): child is FolderNode =>
          child.type === "folder" &&
          child.name === status
      ) ?? null;

      return {
        type: 'virtual-folder',
        name: status,
        status,
        node: realFolder,
      };
  });
}