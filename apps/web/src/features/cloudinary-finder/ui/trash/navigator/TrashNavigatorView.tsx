// src/components/cloudinary-finder/SelectedFolderContent/TrashNavigatorView.tsx
'use client';

import { JSX, useState } from 'react';

import TrashFolderView from '@features/cloudinary-finder/ui/trash/navigator/TrashFolderView';
import TrashFileView from '@features/cloudinary-finder/ui/trash/navigator/TrashFileView';

type Props = {
  appRoot: string;
  trashId: string; // root trash folder id

  /**
   * Optionnel : titre UI si tu veux l’afficher au-dessus
   */
  displayName?: string;

  /**
   * Si tu as un bouton global pour “quitter la navigation trash-folder”
   */
  onExit?: () => void;
};

export default function TrashNavigatorView({ appRoot, trashId, displayName, onExit }: Props): JSX.Element {
  const [relativePath, setRelativePath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; previousPath: string } | null>(null);

  const canGoUp = Boolean(relativePath);

  function goUpOneLevel() {
    if (!relativePath) return;
    const parts = relativePath.split('/').filter(Boolean);
    parts.pop();
    setRelativePath(parts.join('/'));
  }

  return (
    <div className="space-y-4">
      {/* Header (optionnel mais utile) */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="font-medium truncate">{displayName ?? 'Corbeille'}</div>
          <div className="text-xs text-gray-500 truncate">{relativePath ? `/${relativePath}` : '/'}</div>
        </div>

        <div className="flex items-center gap-2">
          {selectedFile ? (
            <button
              onClick={() => setSelectedFile(null)}
              className="px-3 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
            >
              ← Retour dossier
            </button>
          ) : canGoUp ? (
            <button
              onClick={goUpOneLevel}
              className="px-3 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
            >
              ↑ Niveau parent
            </button>
          ) : null}

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
            >
              ✕ Fermer
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {selectedFile ? (
        <TrashFileView file={selectedFile} onBack={() => setSelectedFile(null)} />
      ) : (
        <TrashFolderView
          appRoot={appRoot}
          trashId={trashId}
          relativePath={relativePath}
          onOpenRelativeFolder={(next) => setRelativePath(next)}
          onSelectTrashFile={(file) => setSelectedFile(file)}
        />
      )}
    </div>
  );
}