'use client';

import { JSX } from 'react';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { APP_ROOT } from '@config/app';
import { highlightMatches } from '@features/finder-core/utils/highlightMatches';

/**
 * 🔎 SearchResultsView — vue plate des résultats de recherche récursive.
 *
 * ─── Types de résultats ──────────────────────────────────────────────
 *
 * Affiche à la fois :
 *   - Les **dossiers** qui matchent (status folders comme `bin`, `pending`,
 *     `published` quand on cherche depuis APP_ROOT, et sous-dossiers métier
 *     dérivés des publicIds des MediaAssets)
 *   - Les **fichiers** qui matchent (filename, description, ou uploadedBy)
 *
 * Les dossiers sont rendus en tête (convention Finder) avec une icône
 * Folder. Au click → navigation directe vers le dossier.
 *
 * Les fichiers en dessous avec icône FileText. Au click → navigation vers
 * le dossier parent + sélection du fichier.
 *
 * ─── UI ───────────────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────────────┐
 *   │ 📁 Stage                                 │   ← folder
 *   │    pending/                              │
 *   ├─────────────────────────────────────────┤
 *   │ 📁 karate                                │   ← folder
 *   │    pending/Stage/                        │
 *   ├─────────────────────────────────────────┤
 *   │ 📄 photo-stage-ete.jpg                   │   ← file
 *   │    pending/Stage/karate/                 │
 *   └─────────────────────────────────────────┘
 */
export default function SearchResultsView(): JSX.Element {
  const search = useFinderStore((s) => s.search);
  const currentPath = useFinderStore((s) => s.currentPath);
  const setPath = useFinderStore((s) => s.setPath);
  const selectOnly = useFinderStore((s) => s.selectOnly);

  if (search.query.trim().length === 0) return <></>;

  if (search.loading && search.results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2">
        <span>Recherche en cours…</span>
      </div>
    );
  }

  if (!search.loading && search.results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2">
        <span>
          Aucun fichier trouvé sous{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
            {displayRelativePath(currentPath)}
          </code>
        </span>
        <span className="text-xs">
          Essaie avec moins de caractères, ou ajuste les filtres (Aa / ab| / .*).
        </span>
      </div>
    );
  }

  // Handler unifié : selon le type du résultat, on navigue vers le path
  // (folder) ou vers le parent + sélection (file).
  function handleClick(result: typeof search.results[number]) {
    if (result.type === 'folder') {
      // Click sur un dossier → naviguer dedans. Le setPath reset
      // automatiquement search.query (logique du store).
      setPath(result.path);
    } else {
      // Click sur un fichier → naviguer vers son parent, sélectionner le fichier
      setPath(result.parentPath);
      selectOnly(result.id);
    }
  }

  // Compteurs typés pour le bandeau header
  const folderCount = search.results.filter((r) => r.type === 'folder').length;
  const fileCount = search.results.length - folderCount;

  return (
    <div className="flex flex-col h-full">
      {/* Header avec compteur + warning tronqué */}
      <div className="px-4 py-2 border-b text-xs text-gray-600 bg-gray-50">
        <span>
          <strong className="text-gray-900">{search.results.length}</strong>{' '}
          résultat{search.results.length > 1 ? 's' : ''}
          {folderCount > 0 && fileCount > 0 && (
            <span className="text-gray-500 ml-1">
              ({folderCount} dossier{folderCount > 1 ? 's' : ''}, {fileCount} fichier
              {fileCount > 1 ? 's' : ''})
            </span>
          )}
        </span>
        {search.truncated && (
          <span className="ml-3 text-amber-700">
            ⚠️ Liste tronquée — affine la recherche pour voir tous les résultats
          </span>
        )}
      </div>

      {/* Liste des résultats */}
      <div className="flex-1 overflow-auto divide-y divide-gray-100">
        {search.results.map((result) => {
          const isFolder = result.type === 'folder';

          const nameSegments = highlightMatches(
            result.name,
            search.query,
            search.flags,
          );
          const descSegments = result.meta?.description
            ? highlightMatches(result.meta.description, search.query, search.flags)
            : null;
          const senderSegments = result.meta?.uploadedBy
            ? highlightMatches(result.meta.uploadedBy, search.query, search.flags)
            : null;

          const hasDescMatch = descSegments?.some((s) => s.isMatch);
          const hasSenderMatch = senderSegments?.some((s) => s.isMatch);

          return (
            <button
              key={result.id}
              type="button"
              onClick={() => handleClick(result)}
              className="
                w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors
                flex items-start gap-3 group
              "
            >
              {/* Icône typée — Folder ou FileText */}
              <div
                className={
                  isFolder
                    ? 'shrink-0 mt-0.5 text-blue-500 group-hover:text-blue-600'
                    : 'shrink-0 mt-0.5 text-gray-400 group-hover:text-blue-500'
                }
              >
                {isFolder ? (
                  <Folder className="w-4 h-4" aria-hidden />
                ) : (
                  <FileText className="w-4 h-4" aria-hidden />
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                {/* Nom avec highlight */}
                <div className="text-sm text-gray-900 truncate">
                  {nameSegments.map((seg, i) =>
                    seg.isMatch ? (
                      <mark
                        key={i}
                        className="bg-yellow-200 text-gray-900 rounded px-0.5"
                      >
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </div>

                {/* Path parent + indicateurs match secondaire (files only) */}
                <div className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <FolderOpen className="w-3 h-3 inline shrink-0" aria-hidden />
                  <span>{displayRelativePath(result.parentPath)}</span>

                  {!isFolder && hasDescMatch && (
                    <span
                      className="ml-2 text-[10px] text-gray-400 italic"
                      title={result.meta?.description ?? ''}
                    >
                      · match dans la description
                    </span>
                  )}
                  {!isFolder && hasSenderMatch && (
                    <span
                      className="ml-2 text-[10px] text-gray-400 italic"
                      title={`Uploadé par ${result.meta?.uploadedBy}`}
                    >
                      · match dans l&apos;expéditeur
                    </span>
                  )}
                </div>
              </div>

              {/* Taille au survol (files only — les folders n'ont pas de taille) */}
              {!isFolder && result.size !== undefined && (
                <div className="shrink-0 text-xs text-gray-400 mt-0.5">
                  {formatBytes(result.size)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function displayRelativePath(path: string): string {
  if (path === APP_ROOT) return '/';
  if (path.startsWith(`${APP_ROOT}/`)) return path.slice(APP_ROOT.length + 1);
  return path;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
