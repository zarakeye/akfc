'use client';

import { JSX, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Search, X, Loader2 } from 'lucide-react';
import { useFinderStore, type SearchFlags } from '@features/finder-core/state/useFinderStore';

/**
 * 🔎 FinderSearchBar — barre de recherche du finder avec filtres type VS Code.
 *
 * ─── UI ───────────────────────────────────────────────────────────────
 *
 * Largeur fixe ~280px, contient :
 *   - Icône loupe à gauche
 *   - Input central
 *   - 3 toggles à droite (Aa case-sensitive, ab| whole word, .* regex)
 *   - Bouton X pour clear (visible seulement si query non-vide)
 *   - Spinner discret dans l'input pendant le fetch
 *
 * ─── Comportements ───────────────────────────────────────────────────
 *
 *   - Escape → clear (depuis l'input)
 *   - Ctrl+F / Cmd+F → focus l'input (handler global au niveau Finder)
 *   - Bouton X → clear
 *   - Click sur un toggle → toggle l'état (relance la recherche
 *     automatiquement via le hook qui observe les flags)
 *
 * ─── Toggle UI ───────────────────────────────────────────────────────
 *
 * Style VS Code : petits boutons carrés, fond bleu pâle si actif. Les
 * conventions de label des toggles sont alignées avec VS Code search :
 *   - Aa : Match case
 *   - ab| : Match whole word (le pipe représente la frontière de mot)
 *   - .* : Use regular expression
 */
export default function FinderSearchBar(): JSX.Element {
  const query = useFinderStore((s) => s.search.query);
  const flags = useFinderStore((s) => s.search.flags);
  const loading = useFinderStore((s) => s.search.loading);

  const setSearchQuery = useFinderStore((s) => s.setSearchQuery);
  const toggleSearchFlag = useFinderStore((s) => s.toggleSearchFlag);
  const clearSearch = useFinderStore((s) => s.clearSearch);

  const inputRef = useRef<HTMLInputElement>(null);

  // Raccourci Ctrl+F / Cmd+F pour focus la searchbar.
  // Empêche le find natif du navigateur — c'est l'expérience attendue dans
  // une app type file explorer (Finder macOS, Explorer Windows).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        // Pas de preventDefault si on est déjà dans un input ailleurs
        // (ex: le user veut chercher dans un PreviewPanel texte)
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'textarea') return;
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      clearSearch();
      inputRef.current?.blur();
    }
  }

  return (
    <div
      className="
        relative flex items-center gap-1 shrink-0
        w-[280px] h-7 px-2
        bg-white border border-gray-300 rounded
        focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500
        transition-colors
      "
    >
      {/* Icône loupe (ou spinner pendant le fetch) */}
      <div className="shrink-0 w-3.5 h-3.5 flex items-center justify-center text-gray-400">
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-label="Recherche en cours" />
        ) : (
          <Search className="w-3.5 h-3.5" aria-hidden />
        )}
      </div>

      {/* Input principal */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher dans ce dossier…"
        className="
          flex-1 min-w-0 bg-transparent border-none outline-none text-xs
          placeholder:text-gray-400
        "
        aria-label="Rechercher des fichiers"
      />

      {/* Bouton clear — visible seulement si query non-vide.
          Reset complet de la recherche (query vidée + résultats purgés). */}
      {query.length > 0 && (
        <button
          type="button"
          onClick={clearSearch}
          className="shrink-0 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          title="Effacer la recherche"
          aria-label="Effacer la recherche"
        >
          <X className="w-3 h-3" aria-hidden />
        </button>
      )}

      {/* Toggles VS Code-style */}
      <div className="shrink-0 flex items-center gap-0.5 border-l border-gray-200 pl-1 ml-0.5">
        <FlagToggle
          flag="caseSensitive"
          active={flags.caseSensitive}
          onToggle={toggleSearchFlag}
          label="Aa"
          title="Respecter la casse"
        />
        <FlagToggle
          flag="wholeWord"
          active={flags.wholeWord}
          onToggle={toggleSearchFlag}
          label="ab|"
          title="Mot entier"
        />
        <FlagToggle
          flag="useRegex"
          active={flags.useRegex}
          onToggle={toggleSearchFlag}
          label=".*"
          title="Expression régulière"
        />
      </div>
    </div>
  );
}

/**
 * Sous-composant : un toggle individuel de filtre.
 * Style mono-bouton compact, état actif = fond bleu pâle.
 */
function FlagToggle({
  flag,
  active,
  onToggle,
  label,
  title,
}: {
  flag: keyof SearchFlags;
  active: boolean;
  onToggle: (flag: keyof SearchFlags) => void;
  label: string;
  title: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onToggle(flag)}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={clsx(
        'shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold rounded',
        'transition-colors',
        active
          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
      )}
    >
      {label}
    </button>
  );
}
