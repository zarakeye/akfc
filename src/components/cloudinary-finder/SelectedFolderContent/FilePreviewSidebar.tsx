'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FileNode } from '@/components/cloudinary-finder/types';
import { trpc } from '@/lib/trpcClient';

type Props = {
  file: FileNode;
  onClose: () => void;
};

type ParsedPath = {
  status: 'pending' | 'published' | 'bin' | null;
  base: string;   // `${appRoot}/${status}` si status OK
  suffix: string; // partie après `${base}/`
};

function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '');
}

function parsePath(fullPath: string): ParsedPath {
  const p = normalizePath(fullPath);
  const parts = p.split('/').filter(Boolean);

  const appRoot = parts[0] ?? '';
  const statusCandidate = parts[1] ?? null;

  const status =
    statusCandidate === 'pending' || statusCandidate === 'published' || statusCandidate === 'bin'
      ? statusCandidate
      : null;

  const base = status ? `${appRoot}/${status}` : appRoot;
  const prefix = status ? `${base}/` : `${base}/`;
  const suffix = status && p.startsWith(prefix) ? p.slice(prefix.length) : '';

  return { status, base, suffix };
}

function isInBinTree(path: string): boolean {
  return path.endsWith('/bin') || path.includes('/bin/');
}

function selectLastSegment(input: HTMLInputElement) {
  const v = input.value;
  const i = v.lastIndexOf('/');
  const start = i >= 0 ? i + 1 : 0;
  input.setSelectionRange(start, v.length);
}

export function FilePreviewSidebar({ file, onClose }: Props): JSX.Element {
  // ✅ Remount key => reset local state sans useEffect setState
  return <FilePreviewSidebarInner key={file.fullPath} file={file} onClose={onClose} />;
}

function FilePreviewSidebarInner({ file, onClose }: Props): JSX.Element {
  const utils = trpc.useUtils();

  const parsed = useMemo(() => parsePath(file.fullPath), [file.fullPath]);

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftSuffix, setDraftSuffix] = useState(parsed.suffix);
  const inputRef = useRef<HTMLInputElement>(null);

  // focus + sélection : OK
  useEffect(() => {
    if (!isRenaming) return;
    const id = setTimeout(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      selectLastSegment(inputRef.current);
    }, 0);
    return () => clearTimeout(id);
  }, [isRenaming]);

  const fileIsInBinTree = useMemo(() => isInBinTree(file.fullPath), [file.fullPath]);
  const canSecureRename = parsed.status !== null;

  const moveToBin = trpc.cloudinary.move.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      onClose();
    },
    onError: (err) => console.error('[moveToBin] failed:', err),
  });

  const deleteForever = trpc.cloudinary.deletePicture.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      onClose();
    },
    onError: (err) => console.error('[deletePicture] failed:', err),
  });

  const renamePicture = trpc.cloudinary.renamePicture.useMutation({
    onSuccess: async () => {
      await utils.cloudinary.getFolderTree.invalidate();
      setIsRenaming(false);
      onClose();
    },
    onError: (err) => console.error('[renamePicture] failed:', err),
  });

  const isBusy = moveToBin.isPending || deleteForever.isPending || renamePicture.isPending;

  function startRename() {
    if (!canSecureRename) return;
    setDraftSuffix(parsed.suffix);
    setIsRenaming(true);
  }

  function cancelRename() {
    setIsRenaming(false);
    setDraftSuffix(parsed.suffix);
  }

  function applyRename() {
    if (!canSecureRename) return;

    const cleanedSuffix = normalizePath(draftSuffix);
    if (!cleanedSuffix) return;

    const fromPublicId = normalizePath(file.fullPath);
    const toPublicId = `${parsed.base}/${cleanedSuffix}`;

    if (toPublicId === fromPublicId) {
      setIsRenaming(false);
      return;
    }

    const ok = confirm(`Renommer/déplacer ce fichier ?\n\n${fromPublicId}\n→\n${toPublicId}\n`);
    if (!ok) return;

    renamePicture.mutate({ fromPublicId, toPublicId });
  }

  function sendToBin() {
    if (fileIsInBinTree) return;

    moveToBin.mutate({
      source: { type: 'file', fullPath: file.fullPath },
      target: { type: 'virtual-folder', status: 'bin' },
    });
  }

  function deleteNow() {
    const ok = confirm('⚠️ Supprimer définitivement ce fichier ?\n\nCette action est irréversible.');
    if (!ok) return;
    deleteForever.mutate({ publicId: file.fullPath });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium truncate" title={file.name}>
            {file.name}
          </h3>
          {/* <div className="text-xs text-gray-500 truncate" title={file.fullPath}>
            {file.fullPath}
          </div> */}
        </div>

        <button onClick={onClose} className="text-xl" disabled={isBusy}>
          ×
        </button>
      </div>

      <div className="p-4 border-b flex flex-wrap gap-2">
        {!isRenaming ? (
          <>
            <button
              onClick={startRename}
              disabled={isBusy || !canSecureRename}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              title={
                canSecureRename
                  ? 'Renommer / déplacer (édition du suffix après status)'
                  : 'Chemin non conforme (impossible de sécuriser <app>/<status>)'
              }
            >
              ✏️ Renommer
            </button>

            {!fileIsInBinTree ? (
              <button
                onClick={sendToBin}
                disabled={isBusy}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                🗑 Envoyer vers bin
              </button>
            ) : (
              <button
                onClick={deleteNow}
                disabled={isBusy}
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                ❌ Supprimer
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">{parsed.base}/</span>
              <input
                ref={inputRef}
                className="border rounded px-2 py-2 text-sm w-[520px]"
                value={draftSuffix}
                onChange={(e) => setDraftSuffix(e.target.value)}
                disabled={isBusy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyRename();
                  if (e.key === 'Escape') cancelRename();
                }}
                placeholder="clients/2026/img_001"
              />
            </div>

            <button
              onClick={applyRename}
              disabled={isBusy || !normalizePath(draftSuffix)}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {renamePicture.isPending ? '…' : 'Appliquer'}
            </button>

            <button
              onClick={cancelRename}
              disabled={isBusy}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Annuler
            </button>
          </>
        )}

        {(moveToBin.error || deleteForever.error || renamePicture.error) && (
          <span className="text-sm text-red-600">
            {(moveToBin.error?.message ??
              deleteForever.error?.message ??
              renamePicture.error?.message) ||
              'Erreur'}
          </span>
        )}
      </div>

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