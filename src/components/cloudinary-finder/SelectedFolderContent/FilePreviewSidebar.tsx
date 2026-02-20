'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FileNode } from '@/components/cloudinary-finder/types';
import { trpc } from '@/lib/trpcClient';

type Props = {
  file: FileNode;
  onClose: () => void;
};

/**
 * Retourne true si path est:
 * - bin
 * - OU un descendant de bin
 *
 * Ex:
 * - my-app/bin               => true
 * - my-app/bin/sous-dossier  => true
 */
function isInBinTree(path: string): boolean {
  return path.endsWith('/bin') || path.includes('/bin/');
}

/**
 * Évite les noms invalides pour un segment de public_id Cloudinary:
 * - pas de slash
 * - trim
 * - optionnel: remplacer les espaces
 */
function sanitizeName(input: string): string {
  return input.trim().replace(/\//g, '').replace(/\s+/g, ' ');
}

/**
 * Remplace le dernier segment d'un public_id.
 * Ex: "a/b/c" + "new" => "a/b/new"
 */
function replaceLastSegment(fullPath: string, newLastSegment: string): string {
  const parts = fullPath.split('/');
  parts[parts.length - 1] = newLastSegment;
  return parts.join('/');
}

export function FilePreviewSidebar({ file, onClose }: Props): JSX.Element {
  const utils = trpc.useUtils();

  // ─────────────────────────────────────────────
  // UI state: mode rename
  // ─────────────────────────────────────────────
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(file.name);

  const inputRef = useRef<HTMLInputElement>(null);

  // Quand on ouvre le mode rename: focus auto
  useEffect(() => {
  if (!isRenaming) return;

  // Focus async pour être sûr que l'input est monté
  const id = setTimeout(() => inputRef.current?.focus(), 0);
  return () => clearTimeout(id);
}, [isRenaming]);

  // ─────────────────────────────────────────────
  // Mutations
  // ─────────────────────────────────────────────

  /**
   * ✅ Déplacement vers bin (corbeille) : utilise cloudinary.move
   */
  const moveToBin = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      onClose();
    },
    onError: (err) => console.error('[moveToBin] failed:', err),
  });

  /**
   * ✅ Suppression définitive : utilise cloudinary.deletePicture
   * (dans ton backend actuel, c'est "destroy" type authenticated)
   */
  const deleteForever = trpc.cloudinary.deletePicture.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      onClose();
    },
    onError: (err) => console.error('[deletePicture] failed:', err),
  });

  /**
   * ⚠️ Renommer : nécessite une mutation backend.
   * 👉 À ajouter dans cloudinary.router.ts (ex: cloudinary.renamePicture)
   *
   * Expected input:
   * { fromPublicId: string; toPublicId: string }
   */
  const renamePicture = trpc.cloudinary.renamePicture.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      setIsRenaming(false);
      onClose();
    },
    onError: (err) => console.error('[renamePicture] failed:', err),
  });

  // ─────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────
  const fileIsInBinTree = useMemo(() => isInBinTree(file.fullPath), [file.fullPath]);

  const isBusy =
    moveToBin.isPending ||
    deleteForever.isPending ||
    renamePicture.isPending;

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  function handleSendToBin() {
    // sécurité : si déjà dans bin, on n’envoie pas
    if (fileIsInBinTree) return;

    moveToBin.mutate({
      source: {
        type: 'file',
        fullPath: file.fullPath,
      },
      target: {
        type: 'virtual-folder',
        status: 'bin',
      },
    });
  }

  function handleDeleteForever() {
    const ok = confirm(
      '⚠️ Supprimer définitivement ce fichier ?\n\nCette action est irréversible.'
    );
    if (!ok) return;

    deleteForever.mutate({ publicId: file.fullPath });
  }

  function handleStartRename() {
    setDraftName(file.name);
    setIsRenaming(true);
  }

  function handleCancelRename() {
    setIsRenaming(false);
    setDraftName(file.name);
  }

  function handleSaveRename() {
    const clean = sanitizeName(draftName);

    if (!clean) return;
    if (clean === file.name) {
      // aucun changement
      setIsRenaming(false);
      return;
    }

    const toPublicId = replaceLastSegment(file.fullPath, clean);

    const ok = confirm(
      `Renommer:\n\n${file.fullPath}\n→\n${toPublicId}\n\nConfirmer ?`
    );
    if (!ok) return;

    renamePicture.mutate({
      fromPublicId: file.fullPath,
      toPublicId,
    });
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b gap-3">
        <div className="min-w-0 flex-1">
          {!isRenaming ? (
            <h3 className="font-medium truncate" title={file.name}>
              {file.name}
            </h3>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') handleCancelRename();
                }}
                disabled={isBusy}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Nouveau nom"
              />
            </div>
          )}
          <div className="text-xs text-gray-500 truncate" title={file.fullPath}>
            {file.fullPath}
          </div>
        </div>

        <button onClick={onClose} className="text-xl" disabled={isBusy}>
          ×
        </button>
      </div>

      {/* Actions */}
      <div className="p-4 border-b flex flex-wrap gap-2">
        {!isRenaming ? (
          <>
            {/* Rename */}
            <button
              onClick={handleStartRename}
              disabled={isBusy}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              title="Renommer"
            >
              ✏️ Renommer
            </button>

            {/* Bin / Delete */}
            {!fileIsInBinTree ? (
              <button
                onClick={handleSendToBin}
                disabled={isBusy}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                title="Envoyer vers la corbeille"
              >
                🗑 Envoyer vers bin
              </button>
            ) : (
              <button
                onClick={handleDeleteForever}
                disabled={isBusy}
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                title="Supprimer définitivement"
              >
                ❌ Supprimer
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleSaveRename}
              disabled={isBusy || !sanitizeName(draftName)}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {renamePicture.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>

            <button
              onClick={handleCancelRename}
              disabled={isBusy}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Annuler
            </button>
          </>
        )}

        {/* petit feedback d’erreur */}
        {(moveToBin.error || deleteForever.error || renamePicture.error) && (
          <span className="text-sm text-red-600">
            {(moveToBin.error?.message ??
              deleteForever.error?.message ??
              renamePicture.error?.message) ||
              'Erreur'}
          </span>
        )}
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Image
          src={file.url}
          alt={file.name}
          width={1200}
          height={1200}
          className="object-contain max-h-full"
        />
      </div>
    </div>
  );
}