'use client';

import { JSX } from 'react';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import { useFinderStore } from '#features/finder-core/state/useFinderStore.ts';
import { APP_ROOT } from '@akfc/config/app.ts';
import { highlightMatches } from '#features/finder-core/utils/highlightMatches.ts';

/**
 * 🔎 SearchResultsView — vue plate des résultats de recherche récursive.
 *
 * ─── Types de résultats ──────────────────────────────────────────────
 *
 * Affiche à la fois :
 *   - Les **dossiers** qui matchent (la corbeille `bin` quand on cherche depuis
 *     APP_ROOT, et les sous-dossiers dérivés des chemins des MediaAssets)
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
 *   │ 📁 seminars                              │   ← folder
 *   │    AKFC/                                 │
 *   ├─────────────────────────────────────────┤
 *   │ 📁 stage-ete                             │   ← folder
 *   │    AKFC/seminars/                        │
 *   ├─────────────────────────────────────────┤
 *   │ 📄 photo-stage-ete.jpg                   │   ← file
 *   │    AKFC/seminars/stage-ete/              │
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
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm py-12 gap-2">
        <span>Recherche en cours…</span>
      </div>
    );
  }

  // Un refus ou une panne n'est pas « aucun résultat » : on le dit.
  if (!search.loading && search.error && search.results.length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center text-destructive text-sm py-12 px-4 text-center"
        role="alert"
      >
        {search.error}
      </div>
    );
  }

  if (!search.loading && search.results.length === 0) {
    const where = displayRelativePath(currentPath);
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm py-12 gap-2">
        <span>
          Aucun fichier trouvé
          {where !== null && (
            <>
              {' '}sous{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">{where}</code>
            </>
          )}
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
      <div className="px-4 py-2 border-b text-xs text-muted-foreground bg-muted">
        <span>
          <strong className="text-foreground">{search.results.length}</strong>{' '}
          résultat{search.results.length > 1 ? 's' : ''}
          {folderCount > 0 && fileCount > 0 && (
            <span className="text-muted-foreground ml-1">
              ({folderCount} dossier{folderCount > 1 ? 's' : ''}, {fileCount} fichier
              {fileCount > 1 ? 's' : ''})
            </span>
          )}
        </span>
        {search.error && (
          <span className="ml-3 text-destructive" role="alert">
            {search.error}
          </span>
        )}
        {search.truncated && (
          <span className="ml-3 text-warning">
            ⚠️ Liste tronquée — affine la recherche pour voir tous les résultats
          </span>
        )}
      </div>

      {/* Liste des résultats */}
      <div className="flex-1 overflow-auto divide-y divide-border">
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
                w-full text-left px-4 py-2 hover:bg-info-muted transition-colors
                flex items-start gap-3 group
              "
            >
              {/* Icône typée — Folder ou FileText */}
              <div
                className={
                  isFolder
                    ? 'shrink-0 mt-0.5 text-info group-hover:text-info'
                    : 'shrink-0 mt-0.5 text-muted-foreground group-hover:text-info'
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
                <div className="text-sm text-foreground truncate">
                  {nameSegments.map((seg, i) =>
                    seg.isMatch ? (
                      <mark
                        key={i}
                        className="bg-warning/25 text-foreground rounded px-0.5"
                      >
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </div>

                {/* Path parent + indicateurs match secondaire (files only) */}
                <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <FolderOpen className="w-3 h-3 inline shrink-0" aria-hidden />
                  <span>{displayRelativePath(result.parentPath)}</span>

                  {!isFolder && hasDescMatch && (
                    <span
                      className="ml-2 text-[10px] text-muted-foreground italic"
                      title={result.meta?.description ?? ''}
                    >
                      · match dans la description
                    </span>
                  )}
                  {!isFolder && hasSenderMatch && (
                    <span
                      className="ml-2 text-[10px] text-muted-foreground italic"
                      title={`Uploadé par ${result.meta?.uploadedBy}`}
                    >
                      · match dans l&apos;expéditeur
                    </span>
                  )}
                </div>
              </div>

              {/* Taille au survol (files only — les folders n'ont pas de taille) */}
              {!isFolder && result.size !== undefined && (
                <div className="shrink-0 text-xs text-muted-foreground mt-0.5">
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

/** Chemin lisible dans la bibliothèque ; `null` hors d'elle (la racine inventée « Mes espaces »). */
function displayRelativePath(path: string): string | null {
  if (path === APP_ROOT) return '/';
  if (path.startsWith(`${APP_ROOT}/`)) return path.slice(APP_ROOT.length + 1);
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
