import type {
  CloudinaryFolderNode,
} from "@server/contracts/cloudinary/tree.contract.v1";

interface FlatResource {
  publicId: string;
  url: string;
}

export function buildCloudinaryTree(resources: FlatResource[], rootPath: string): CloudinaryFolderNode {
  const root: CloudinaryFolderNode = {
    type: 'folder',
    name: rootPath.split('/').pop()!,
    path: rootPath,
    children: []
  };

  for (const resource of resources) {
    console.log('resource', resource);
    const relativePath = resource.publicId
      .replace(`${rootPath}/`, '');

    const parts = relativePath.split('/');
    console.log('parts', parts);
    let current = root;
    console.log('current', current);

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;

      if (isFile) {
        current.children.push({
          type: 'file',
          name: part,
          publicId: resource.publicId,
          url: resource.url
        });

        return;
      }

      let folder = current.children.find(
        (c): c is CloudinaryFolderNode =>
          c.type === 'folder' && c.name === part
      );

      if (!folder) {
        folder = {
          type: 'folder',
          name: part,
          path: `${current.path}/${part}`,
          children: []
        };

        current.children.push(folder);
      }

      current = folder;
    });
  }

  return root;
}