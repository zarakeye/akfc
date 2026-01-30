'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@lib/trpcClient';

import { TreeView } from '@components/cloudinary-finder/TreeView/TreeView';
import { FolderContent } from '@components/cloudinary-finder/Finder/FolderContent';
import { FilePreviewSidebar } from '@components/cloudinary-finder/Finder/FilePreviewSidebar';
import { injectStatusRoots } from '@/components/cloudinary-finder/TreeView/injectStatusRoots';
import { FolderNode, FileNode } from '@components/cloudinary-finder/types';
import { buildFolderIndex } from '@components/cloudinary-finder/TreeView';

import { BreadCrumb } from '@components/cloudinary-finder/Finder/BreadCrumb';
import { MoveIntent } from '@server/cloudinary/schemas/move.schema';
import AppTreeWrapper from '../TreeView/AppTreeWrapper';

const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'my-app';
const INITIAL_PATH = `${APP_SHORT_NAME}/pending`;

/**
 * Recursively finds a folder node in a tree given its path.
 *
 * @param node - The current folder node to search in.
 * @param path - The path of the folder node to find.
 * @returns - The folder node if found, otherwise null.
 */
function findFolderByPath(
  node: FolderNode,
  path: string
): FolderNode | null {
  if (!node) return null;
  
  if (node.fullPath === path) return node;
  
    for (const child of node.children) {
      if (child.type === 'folder') {
        const found = findFolderByPath(child, path);
        if (found) return found;
      }
    }
  
  return null;
}

export function FinderLayout() {
  const [currentPath, setCurrentPath] = useState(INITIAL_PATH);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const { data: tree, isLoading, isError } =
    trpc.cloudinary.getFolderTree.useQuery({ path: APP_SHORT_NAME });

  const utils = trpc.useUtils();
  const move = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      utils.cloudinary.getFolderTree.invalidate();
    },
  });

  const folderIndex = useMemo(() => {
    if (!tree) return null;
    return buildFolderIndex(tree);
  }, [tree]);

  const statusRoots = useMemo(() => {
    if (!tree) return [];
    return injectStatusRoots(tree);
  }, [tree]);

  const isVirtualPath = currentPath.startsWith('__virtual__/');

  // ✅ hook TOUJOURS appelé
  const currentFolder = useMemo<FolderNode | null>(() => {
    if (isVirtualPath) return null;
    return findFolderByPath(tree!, currentPath);
  }, [currentPath, isVirtualPath, tree]);

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !tree) return <div>Erreur</div>;

  // const treeWithVirtuals = injectStatusRoots(tree);

  function handleMove(intent: MoveIntent) {
    move.mutate(intent);
    setSelectedFile(null);
  }


  return (
    <div className="flex h-full border rounded-lg overflow-hidden">
      {/* 🌳 Tree */}
      <aside className="w-72 border-r overflow-auto">
        <AppTreeWrapper appName={APP_SHORT_NAME}>
          <TreeView
            roots={statusRoots}
            currentPath={currentPath}
            onSelectFolder={(path) => {
              setCurrentPath(path);
              setSelectedFile(null);
            }}
            onMove={handleMove}
          />
        </AppTreeWrapper>
      </aside>

      {/* <div className="flex-1 w-full"> */}
        {/* 📁 Explorer */}
        <section className="flex-1 overflow-auto p-4">
          <BreadCrumb
            path={currentPath}
            onNavigate={(path) => {
              setCurrentPath(path);
              setSelectedFile(null);
            }}
          />
          {isVirtualPath ? (
            <div className='text-gray-500 italic'>Vide</div>
          ) : currentFolder ? (
            <FolderContent
              folder={currentFolder}
              onOpenFolder={path => {
                setCurrentPath(path);
                setSelectedFile(null);
              }}
              onSelectFile={setSelectedFile}
            />
          ) : (
           <div className='text-gray-500'>Dossier introuvable</div> 
          )}
        </section>

        {/* 🖼️ Sidebar Aperçu fichier */}
        {selectedFile && (
          <aside className="w-96 border-l bg-white">
            <FilePreviewSidebar
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
            />
          </aside>
        )}
      </div>
    // </div>
  );
}