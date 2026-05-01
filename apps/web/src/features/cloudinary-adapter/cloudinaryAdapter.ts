import type {
  FileAdapter,
  ListOptions,
  ListResult,
  FinderNode,
} from '@features/finder-core/types';
import { trpcClient } from '@/core/trpc/trpcClient';
import type { CloudinaryFolderTree } from '@features/cloudinary-adapter/types';

/**
 * 🔁 Helper : extraire enfants directs
 */
function extractChildren(tree: CloudinaryFolderTree): {
  folders: FinderNode[];
  files: FinderNode[];
} {
  if (!tree) return { folders: [], files: [] };

  const folders: FinderNode[] = [];
  const files: FinderNode[] = [];

  for (const child of tree.children ?? []) {
    if (child.type === 'folder') {
      folders.push({
        id: child.fullPath,
        name: child.name,
        path: child.fullPath,
        type: 'folder',
        hasChildren: child.children && child.children.length > 0,
      });
    }

    if (child.type === 'file') {
      files.push({
        id: child.publicId,
        name: child.name ?? child.publicId.split('/').pop(),
        path: child.publicId,
        type: 'file',
      });
    }
  }

  return { folders, files };
}

/**
 * Adapter pour intégrer Cloudinary à notre finder générique.
 * Seule la méthode `list` est implémentée pour l'instant, les autres sont optionnelles.
 */
export const cloudinaryAdapter: FileAdapter = {
  async list(options: ListOptions): Promise<ListResult> {
    const tree = await trpcClient.cloudinary.getFolderTree.query({
      path: options.path,
    });

    const { folders, files } = extractChildren(tree);

    return {
      folders,
      files,
      nextCursor: null,
    };
  },
};