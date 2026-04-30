import type { FileAdapter, ListOptions, ListResult, FinderNode } from "@features/finder-core/types";

type CloudinaryClient = {
  media: {
    list: (input: {
      path: string;
      cursor?: string | null;
      limit?: number;
    }) => Promise<{
      folders: { name: string; fullPath: string }[];
      assets: { publicId: string; format?: string }[];
      nextCursor?: string | null;
    }>;
  };
}; 

export function createCloudinaryAdapter(client: CloudinaryClient): FileAdapter {
  return {
    async list(options: ListOptions): Promise<ListResult> {
      const { path, cursor, limit } = options;

      const res = await client.media.list({
        path,
        cursor,
        limit
      });

      // 👉 mapping folders
      const folders: FinderNode[] = res.folders.map((f) => ({
        id: f.fullPath,
        name: f.name,
        path: f.fullPath,
        type: 'folder',
        hasChildren: true // Cloudinary folders sont lazy
      }));

      // 👉 mapping assets
      const files: FinderNode[] = res.assets.map((a) => ({
        id: a.publicId,
        name: a.publicId.split('/').pop() || a.publicId,
        path: a.publicId,
        type: 'file',
        meta: {
          format: a.format
        },
      }));

      return {
        folders,
        files,
        nextCursor: res.nextCursor ?? null,
      };
    }
  };
}
