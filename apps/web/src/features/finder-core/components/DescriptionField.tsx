'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

/**
 * ✏️ DescriptionField — champ description éditable d'un fichier sélectionné.
 *
 * ─── UX ───────────────────────────────────────────────────────────────
 *
 * Toujours en mode édition (textarea visible). Sauvegarde combinée :
 *
 *   - **Save on blur** : dès que le user clique ailleurs, save immédiat
 *     (réflexe naturel d'un "j'ai fini")
 *   - **Auto-save debounced 1.5s** : après la dernière frappe sans nouveau
 *     caractère, save automatique (cas où le user laisse le focus sur le
 *     champ mais s'attend à ce que ce soit sauvegardé)
 *
 * Le `value` local est la source de vérité pendant la frappe ; le store
 * et la DB convergent en arrière-plan.
 *
 * ─── Indicateur de status ─────────────────────────────────────────────
 *
 *   - `idle`    : pas de save en cours, dernière save réussie (ou rien à save)
 *   - `saving`  : mutation tRPC en vol → spinner
 *   - `saved`   : succès récent (< 2s) → checkmark vert, puis retour à idle
 *   - `error`   : échec → icône d'alerte avec tooltip
 *
 * ─── Resync sur changement de file ────────────────────────────────────
 *
 * Quand on change de fichier sélectionné, on resync `value` avec la
 * description du nouveau fichier. La détection se fait via `file.id` —
 * pas par contenu de meta — pour éviter d'écraser une frappe en cours
 * si le store reçoit une mise à jour metadata pour CE même fichier.
 *
 * ─── Invalidation cache après save ────────────────────────────────────
 *
 * Après une save réussie, on invalide `media.getByPaths` pour que le
 * hook `useMediaAssetEnrichment` re-fetch et propage la nouvelle
 * description à tous les composants qui en dépendent (notamment la
 * searchbar qui peut chercher dedans).
 */
type Props = {
  file: FinderNode;
};

const MAX_LENGTH = 2000;
const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 1500;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function DescriptionField({ file }: Props): JSX.Element {
  // Valeur courante du textarea (source de vérité pendant la frappe)
  const [value, setValue] = useState(file.meta?.description ?? '');
  // Dernière valeur effectivement sauvegardée en DB. Sert à savoir s'il y
  // a une diff à sauvegarder (et évite les saves no-op).
  const [savedValue, setSavedValue] = useState(file.meta?.description ?? '');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trpcUtils = trpc.useUtils();
  const updateMutation = trpc.media.updateDescription.useMutation();

  // Ref pour pouvoir cancel le timer de debounce + le timer du "saved" badge
  const debounceRef = useRef<number | null>(null);
  const savedTimerRef = useRef<number | null>(null);

  // ─── Resync sur changement de fichier (pendant le render) ───────────
  // file.id change → on bascule sur un nouveau fichier, sync le textarea.
  // On utilise file.id et PAS file.meta?.description : ça nous laisse écraser
  // localement avec ce que l'user tape sans être écrasé par un setContent
  // du store (qui pourrait arriver pour des raisons d'enrichissement).
  //
  // Pattern « adjust state during render » : on resync les states ici, sans
  // useEffect. On NE touche pas aux refs de timers pendant le render
  // (interdit) — leur nettoyage se fait dans l'effet de cleanup ci-dessous.
  const [prevFileId, setPrevFileId] = useState(file.id);
  if (file.id !== prevFileId) {
    setPrevFileId(file.id);
    const newValue = file.meta?.description ?? '';
    setValue(newValue);
    setSavedValue(newValue);
    setStatus('idle');
    setErrorMessage(null);
  }

  // Cleanup des timers de debounce/badge au changement de fichier (ou à
  // l'unmount). Le cleanup s'exécute avant le prochain effet, donc avant
  // qu'un timer de l'ancien fichier puisse aboutir et sauver sur le mauvais
  // path.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (savedTimerRef.current) {
        window.clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
    };
  }, [file.id]);

  // ─── Save logic (extrait pour réuse entre blur et debounce) ─────────
  async function save(toSave: string) {
    // Pas de save si rien n'a changé depuis la dernière save
    if (toSave === savedValue) return;

    setStatus('saving');
    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync({
        appRoot: APP_ROOT,
        path: file.path,
        description: toSave,
      });
      setSavedValue(toSave);
      setStatus('saved');

      // Invalide le cache des metadata → useMediaAssetEnrichment va
      // re-fetch et propager la nouvelle description partout (searchbar,
      // grid, autres consommateurs).
      await trpcUtils.media.getByPaths.invalidate();

      // Reset visuel après 2s
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setStatus('idle');
        savedTimerRef.current = null;
      }, SAVED_DISPLAY_MS);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Échec de sauvegarde');
    }
  }

  // ─── Auto-save debounced (1.5s après dernière frappe) ───────────────
  useEffect(() => {
    if (value === savedValue) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void save(value);
      debounceRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ─── Save on blur (immediate, court-circuite le debounce) ──────────
  function handleBlur() {
    // Si un debounce est en attente, on l'annule et on save tout de suite.
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (value !== savedValue) {
      void save(value);
    }
  }

  // ─── Cleanup au démontage ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  const charCount = value.length;
  // Affiche le compteur seulement si on s'approche de la limite — sinon
  // ça pollue inutilement l'UI pour de petites descriptions.
  const showCounter = charCount > MAX_LENGTH * 0.8;
  const overLimit = charCount > MAX_LENGTH;

  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={`desc-${file.id}`}
          className="text-xs text-gray-500 font-medium"
        >
          Description
        </label>
        <StatusIndicator status={status} errorMessage={errorMessage} />
      </div>

      <textarea
        id={`desc-${file.id}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Aucune description — ajoute-en une…"
        rows={3}
        maxLength={MAX_LENGTH + 100 /* léger margin pour permettre delete depuis état surchargé */}
        className={clsx(
          'w-full text-xs p-2 rounded border resize-y min-h-[60px] max-h-[200px]',
          'focus:outline-none focus:ring-1 transition-colors',
          overLimit
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500',
        )}
      />

      {showCounter && (
        <div
          className={clsx(
            'text-[10px] text-right mt-0.5',
            overLimit ? 'text-red-600 font-medium' : 'text-gray-400',
          )}
        >
          {charCount} / {MAX_LENGTH}
          {overLimit && ' — trop long, raccourcis pour sauvegarder'}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              STATUS INDICATOR                              */
/* -------------------------------------------------------------------------- */

/**
 * Petit indicateur visuel à droite du label "Description".
 * Discret, non bloquant — le user voit du coin de l'œil ce qui se passe
 * sans avoir besoin de cliquer.
 */
function StatusIndicator({
  status,
  errorMessage,
}: {
  status: SaveStatus;
  errorMessage: string | null;
}): JSX.Element | null {
  if (status === 'idle') return null;

  if (status === 'saving') {
    return (
      <span className="text-[10px] text-gray-400 flex items-center gap-1" aria-live="polite">
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
        Enregistrement…
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span
        className="text-[10px] text-green-600 flex items-center gap-1"
        aria-live="polite"
      >
        <Check className="w-3 h-3" aria-hidden />
        Enregistré
      </span>
    );
  }

  // status === 'error'
  return (
    <span
      className="text-[10px] text-red-600 flex items-center gap-1"
      title={errorMessage ?? 'Erreur inconnue'}
      aria-live="polite"
    >
      <AlertCircle className="w-3 h-3" aria-hidden />
      Erreur — réessayer ?
    </span>
  );
}