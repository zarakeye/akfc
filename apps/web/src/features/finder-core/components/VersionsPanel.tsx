'use client';

import { JSX, useState } from 'react';
import { Download, History, RotateCcw, Trash2 } from 'lucide-react';

import type { FinderNode } from '@akfc/contracts/finder/index.ts';
import { trpc } from '#core/trpc/trpcClient.ts';
import { useFinderStore } from '#features/finder-core/state/useFinderStore.ts';
import { formatBytes } from '#features/finder-core/utils/formatBytes.ts';
import { formatDate } from '#features/finder-core/utils/formatDate.ts';

/**
 * Panneau « Versions » d'un fichier sélectionné (aperçu du finder, admin et « Mes espaces »).
 *
 * Remplacer un fichier garde son contenu précédent en version (fileVersion.*). Le panneau liste
 * le contenu actuel puis les anciennes versions, de la plus récente à la plus ancienne :
 * télécharger (tous ceux qui voient l'espace), restaurer (admin, éditeur de l'espace du groupe),
 * effacer (admin). Restaurer échange la version et le contenu actuel : on peut revenir en arrière.
 *
 * Silencieux quand le serveur refuse (fichier hors d'un espace pour un membre) ou ne connaît pas
 * le fichier (non suivi en base).
 */
export default function VersionsPanel({ file }: { file: FinderNode }): JSX.Element | null {
  const utils = trpc.useUtils();
  const { data, isError } = trpc.fileVersion.list.useQuery({ fullPath: file.path }, { retry: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const done = (text: string) => {
    setConfirmId(null);
    setMessage({ ok: true, text });
    void utils.fileVersion.list.invalidate({ fullPath: file.path });
    useFinderStore.getState().reloadFolderContent();
  };
  const fail = (err: { message: string }) => setMessage({ ok: false, text: err.message });

  const restore = trpc.fileVersion.restore.useMutation({
    onSuccess: () => done('Version restaurée. Le contenu remplacé est gardé dans les versions.'),
    onError: fail,
  });
  const remove = trpc.fileVersion.delete.useMutation({ onSuccess: () => done('Version effacée.'), onError: fail });
  const download = trpc.fileVersion.downloadUrl.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: fail,
  });

  if (isError || !data) return null;
  const busy = restore.isPending || remove.isPending;

  return (
    <details className="border-t border-border pt-3 text-xs" data-testid="versions-panel">
      <summary className="flex cursor-pointer items-center gap-1.5 font-medium text-foreground" data-tour="finder.versions">
        <History className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        Versions ({data.versions.length + 1})
      </summary>

      <ol className="mt-2 space-y-2" data-tour="finder.versions.list">
        <li className="rounded border border-success/40 bg-success-muted/60 px-2 py-1.5">
          <div className="font-medium text-success">Version actuelle</div>
          <div className="text-muted-foreground">
            {formatDate(data.current.uploadedAt)}
            {data.current.authorName ? ` · ${data.current.authorName}` : ''} · {formatBytes(data.current.bytes)}
          </div>
        </li>

        {data.versions.map((v) => (
          <li key={v.id} className="rounded border border-border px-2 py-1.5">
            <div className="text-foreground">
              Déposée le {formatDate(v.uploadedAt)}
              {v.authorName ? ` par ${v.authorName}` : ''}
            </div>
            <div className="text-muted-foreground">
              Remplacée le {formatDate(v.replacedAt)} · {formatBytes(v.bytes)}
            </div>

            {confirmId === v.id ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2" role="alert">
                <span className="text-foreground">Remettre cette version à la place de l&apos;actuelle ?</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => restore.mutate({ versionId: v.id })}
                  className="rounded bg-brand px-2 py-0.5 font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
                >
                  Restaurer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="rounded border border-border px-2 py-0.5 hover:bg-muted"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => download.mutate({ versionId: v.id })}
                  className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-foreground hover:bg-muted"
                >
                  <Download className="h-3 w-3" aria-hidden />
                  Télécharger
                </button>
                {data.canRestore && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setMessage(null);
                      setConfirmId(v.id);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden />
                    Restaurer…
                  </button>
                )}
                {data.canDelete && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove.mutate({ versionId: v.id })}
                    className="inline-flex items-center gap-1 rounded border border-destructive/40 px-1.5 py-0.5 text-destructive hover:bg-destructive-muted disabled:opacity-50"
                    aria-label={`Effacer la version déposée le ${formatDate(v.uploadedAt)}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden />
                    Effacer
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>

      {data.versions.length === 0 && (
        <p className="mt-2 text-muted-foreground">
          Aucune ancienne version. Remplacer ce fichier par un fichier du même nom gardera l&apos;actuel ici.
        </p>
      )}
      {message && (
        <p className={`mt-2 ${message.ok ? 'text-success' : 'text-destructive'}`} role="status">
          {message.text}
        </p>
      )}
      <p className="mt-2 text-muted-foreground">Les 10 dernières versions sont gardées, un an au plus.</p>
    </details>
  );
}
