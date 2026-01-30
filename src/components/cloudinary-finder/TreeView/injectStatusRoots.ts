import { FolderStatus } from "@/core/cloudinary/folder.types";
import { FolderNode, StatusRootNode } from "@components/cloudinary-finder/types";

const VIRTUAL_KINDS = ["pending", "published", "bin"] as const;
const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'my-app';
const STATUSES: FolderStatus[] = ["pending", "published", "bin"];

export function injectStatusRoots(
  root: FolderNode
): StatusRootNode[] {
  return STATUSES.map((status) => {
    const fullPath = `${APP_SHORT_NAME}/${status}`;

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