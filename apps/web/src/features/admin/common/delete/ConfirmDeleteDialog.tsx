"use client";

import { JSX, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

/** Comparaison tolérante : casse, espaces multiples et apostrophes typographiques ne comptent pas. */
function normalize(s: string): string {
  return s.normalize("NFC").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
}

export interface ConfirmDeleteDialogProps {
  /** Article défini + nom du type : « l'article », « la discipline »… */
  entityLabel: string;
  /** Nom de l'élément, tel qu'affiché dans la liste. */
  name: string;
  /** Conséquence à connaître avant de confirmer (cascade, refus possible…). */
  consequence?: string;
  /** Effectue la suppression ; une erreur levée est affichée dans la fenêtre. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/**
 * Fenêtre de confirmation d'une suppression DÉFINITIVE.
 *
 * Garde-fous : il faut TAPER « supprimer <nom> » (le collage est refusé, pour que le geste reste
 * délibéré) ; le bouton ne s'active qu'à l'identique ; Échap ou « Annuler » referment sans rien faire.
 *
 * Rendue dans un portail, mais React fait remonter les événements d'un portail jusqu'à ses
 * ancêtres React : sans `stopPropagation`, un clic dans la fenêtre atteindrait la ligne du
 * tableau qui l'a ouverte, et ouvrirait la fiche de l'élément.
 */
export function ConfirmDeleteDialog({
  entityLabel,
  name,
  consequence,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps): JSX.Element | null {
  const phrase = `supprimer ${name.replace(/\s+/g, " ").trim()}`;
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteRefused, setPasteRefused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();
  const matches = normalize(typed) === normalize(phrase);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const confirm = async () => {
    if (!matches || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl bg-background p-5 text-foreground shadow-2xl"
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="font-semibold">
              Supprimer {entityLabel} « {name} » ?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              La suppression est définitive : elle ne passe pas par la corbeille.
              {consequence ? ` ${consequence}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fermer"
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="block text-sm">
          Pour confirmer, tapez{" "}
          <code className="select-none rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-red-700">{phrase}</code>
          <input
            ref={inputRef}
            type="text"
            value={typed}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setTyped(e.target.value);
              setPasteRefused(false);
            }}
            onPaste={(e) => {
              e.preventDefault();
              setPasteRefused(true);
            }}
            onDrop={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter") void confirm();
            }}
            disabled={busy}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
        </label>
        {pasteRefused && <p className="mt-1 text-xs text-amber-700">Le collage est désactivé : tapez la phrase.</p>}
        {error && (
          <p className="mt-3 whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={!matches || busy}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Suppression…" : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
