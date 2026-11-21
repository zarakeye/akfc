'use client';

import { JSX, useRef, useState } from 'react';

/**
 * Champ d'édition en ligne d'un nom de fichier ou de dossier.
 *
 * Partagé par la grille et l'arbre : une seule implémentation du
 * comportement (Entrée valide, Échap annule, la perte de focus valide).
 *
 * En cas d'erreur — collision de nom, nom invalide — le champ RESTE ouvert
 * avec le message dessous, pour corriger sans tout ressaisir. Le projet n'a
 * pas de système de toast : l'affichage est inline, comme ailleurs.
 *
 * On n'édite jamais que la BASE du nom. L'extension affichée est reconstruite
 * par `displayName` : c'est le backend qui réapplique celle de la source.
 */
export function RenameInput({
  initial,
  error,
  onCommit,
  onCancel,
  className,
}: {
  initial: string;
  error: string | null;
  onCommit: (value: string) => void | Promise<void>;
  onCancel: () => void;
  className?: string;
}): JSX.Element {
  const [value, setValue] = useState(initial);
  // Entrée puis clic ailleurs : sans ce verrou, la perte du focus validerait
  // une seconde fois pendant que le premier renommage est en route, sur
  // l'ancien chemin.
  const committingRef = useRef(false);
  const commit = async (): Promise<void> => {
    if (committingRef.current) return;
    committingRef.current = true;
    try {
      await onCommit(value);
    } finally {
      committingRef.current = false;
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Empêche les raccourcis du finder (suppression, navigation…)
          // de se déclencher pendant la saisie.
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            void commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={() => void commit()}
        className={
          className ??
          'w-full rounded border border-info/40 bg-card px-1 py-0.5 text-xs text-foreground outline-none'
        }
      />
      {error && (
        <p className="mt-0.5 rounded bg-destructive-muted px-1 text-[10px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
