'use client';

import { JSX, useState } from 'react';
import { Folder, ChevronRight, Loader2 } from 'lucide-react';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

/**
 * Choix d'un dossier de destination pour un déplacement.
 *
 * Navigateur autonome : il n'utilise que `storage.getTree` (profondeur 1) et
 * ne dépend pas de l'adapter du finder, ce qui lui évite d'être branché à
 * l'état global. Le dossier COURANT de la modale est la destination — le
 * bouton « Déplacer ici » valide, le fil d'Ariane permet de remonter.
 */
export function MoveDialog({
  title,
  onConfirm,
  onClose,
  disabledPaths = [],
}: {
  title: string;
  onConfirm: (destination: string) => void | Promise<void>;
  onClose: () => void;
  /** Chemins qu'on ne peut pas choisir (l'élément déplacé, son parent…). */
  disabledPaths?: string[];
}): JSX.Element {
  const [current, setCurrent] = useState<string>(APP_ROOT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tree = trpc.storage.getTree.useQuery(
    { path: current, depth: 1 },
    { staleTime: 30_000 },
  );

  const folders = (tree.data?.root.children ?? []).filter(
    (child) => child.type === 'folder',
  );

  const segments = current.split('/').filter(Boolean);
  const isDisabled = disabledPaths.includes(current);

  async function confirm(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le déplacement a échoué.');
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>

        {/* Fil d'Ariane : chaque segment ramène à son niveau. */}
        <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-4 py-2 text-xs text-gray-600">
          {segments.map((segment, index) => {
            const path = segments.slice(0, index + 1).join('/');
            const last = index === segments.length - 1;
            return (
              <span key={path} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrent(path)}
                  className={
                    last
                      ? 'font-medium text-gray-900'
                      : 'hover:text-blue-600 hover:underline'
                  }
                >
                  {segment}
                </button>
                {!last && <ChevronRight className="h-3 w-3 text-gray-400" />}
              </span>
            );
          })}
        </div>

        <div className="min-h-[10rem] flex-1 overflow-auto p-2">
          {tree.isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-gray-400">
              Aucun sous-dossier ici.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {folders.map((folder) => (
                <li key={folder.path}>
                  <button
                    type="button"
                    onClick={() => setCurrent(folder.path)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Folder className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="mx-4 mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
          <span className="truncate text-xs text-gray-500">
            Destination : <span className="font-mono">{current}</span>
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={busy || isDisabled}
              onClick={() => void confirm()}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Déplacement…' : 'Déplacer ici'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
