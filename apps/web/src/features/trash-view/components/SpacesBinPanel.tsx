'use client';

import { JSX, useState } from 'react';
import { FileText, Folder, RotateCcw, Trash2 } from 'lucide-react';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { formatDay, purgeIsSoon } from '@features/trash-view/lib/trashDates';

/**
 * Corbeille des ESPACES, côté membre (« Mes espaces collaboratifs »).
 *
 * Liste ce qui a été jeté dans les espaces des groupes où le membre est ÉDITEUR, quel que soit
 * l'auteur (trash.listSpacesBin), et le restaure à sa place d'origine. Le serveur revérifie le
 * droit (un lecteur du groupe est refusé). Absente quand il n'y a rien à restaurer.
 */
export default function SpacesBinPanel(): JSX.Element | null {
  const utils = trpc.useUtils();
  const { data: items } = trpc.trash.listSpacesBin.useQuery();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const restore = trpc.trash.restoreFromBin.useMutation({
    onSuccess: (out) => {
      const r = out.restored[0];
      const renamed = r && r.restoredToPath !== r.previousPath;
      setMessage({
        ok: true,
        text: r
          ? `« ${r.displayName} » est revenu à sa place${renamed ? `, renommé : un élément du même nom l'avait remplacé` : ''}.`
          : 'Restauré.',
      });
      void utils.trash.listSpacesBin.invalidate();
      useFinderStore.getState().reloadFolderContent();
    },
    onError: (err) => setMessage({ ok: false, text: err.message }),
  });

  if (!items || items.length === 0) {
    return message ? <p className="mb-3 text-sm text-emerald-700">{message.text}</p> : null;
  }

  return (
    <details className="mb-3 shrink-0 rounded-md border border-gray-200 bg-white" data-testid="spaces-bin">
      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700">
        <Trash2 className="h-4 w-4 text-gray-500" aria-hidden />
        Corbeille de mes espaces ({items.length})
      </summary>
      <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
        Ce qui a été jeté dans les espaces dont vous êtes éditeur, par vous ou par un autre. Un
        élément restauré revient à sa place ; à la date indiquée, il est effacé définitivement.
      </p>
      {message && (
        <p className={`px-3 pb-2 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`} role="status">
          {message.text}
        </p>
      )}
      <ul className="divide-y divide-gray-100 border-t border-gray-100">
        {items.map((it) => {
          const Icon = it.kind === 'folder' ? Folder : FileText;
          return (
            <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
              <Icon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900" title={it.previousPath}>
                  {it.displayName}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {it.groupName} · jeté le {formatDay(it.trashedAt)}
                  {it.trashedByName ? ` par ${it.trashedByName}` : ''}
                </span>
              </span>
              <span
                className={`whitespace-nowrap text-xs ${purgeIsSoon(it.purgeAt) ? 'font-medium text-red-600' : 'text-gray-500'}`}
              >
                Effacé le {formatDay(it.purgeAt)}
              </span>
              <button
                type="button"
                disabled={restore.isPending}
                onClick={() => {
                  setMessage(null);
                  restore.mutate({ appRoot: APP_ROOT, ids: [it.id] });
                }}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Restaurer
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
