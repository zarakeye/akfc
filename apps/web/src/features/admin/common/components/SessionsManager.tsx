"use client";

import { useState } from "react";
import { Calendar, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  TimeInput,
} from "@features/admin/common/components/TimeInput";
import { formatHHMM } from "@lib/time/formatHHMM";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface SessionItem {
  id: number;
  date: Date;
  beginTime: number;
  endTime: number;
  location: string | null;
  notes: string | null;
}

export interface SessionDraft {
  date: Date;
  beginTime: number;
  endTime: number;
  location: string | null;
  notes: string | null;
}

export interface SessionsManagerProps {
  /** Sessions du parent (stage ou event), déjà triées. */
  sessions: SessionItem[];
  /** Crée une session. Le parentId est injecté par l'appelant. */
  onCreate: (draft: SessionDraft) => Promise<void>;
  /** Met à jour une session existante. */
  onUpdate: (id: number, draft: SessionDraft) => Promise<void>;
  /** Supprime une session. */
  onDelete: (id: number) => Promise<void>;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Date → "YYYY-MM-DD" pour `<input type="date">`. Lecture en **UTC**
 * car les dates de session sont stockées à midi UTC (date pure
 * neutralisée du fuseau — cf. handleSave). getUTC* garantit le bon
 * jour quel que soit le fuseau du runtime.
 */
function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * Date lisible en français : « samedi 15 mars 2026 ». Forcé en
 * Europe/Paris : une date stockée à midi UTC y tombe à 13/14h le même
 * jour, donc le jour affiché est toujours correct et stable, peu
 * importe le fuseau du serveur (SSR) ou du client.
 */
function formatSessionDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant principal                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Gère les sessions (séances datées) d'un parent — stage ou event.
 *
 * **Agnostique du type de parent** : il reçoit `sessions` + les
 * callbacks CRUD en props. L'appelant (page d'édition Stage ou Event)
 * fournit les implémentations branchées sur le bon store / router et
 * injecte le `parentId` au `onCreate`. Ce composant ne sait pas s'il
 * manipule des StageSession ou des EventSession.
 *
 * `editingId` pilote l'affichage du form inline :
 *   - `null`   → aucune édition, juste la liste + bouton « ajouter »
 *   - `"new"`  → form de création
 *   - `number` → form d'édition de la session correspondante
 */
export function SessionsManager({
  sessions,
  onCreate,
  onUpdate,
  onDelete,
}: SessionsManagerProps) {
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async (draft: SessionDraft) => {
    await onCreate(draft);
    setEditingId(null);
  };

  const handleUpdate = async (id: number, draft: SessionDraft) => {
    await onUpdate(id, draft);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Supprimer cette session ?");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="h-5 w-5" />
          Sessions
        </h3>
        {editingId === null && (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Ajouter une session
          </button>
        )}
      </div>

      {/* Form de création */}
      {editingId === "new" && (
        <div className="mb-4">
          <SessionForm
            onSave={handleCreate}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {/* Liste des sessions */}
      {sessions.length === 0 && editingId !== "new" ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Pas encore de session. Ajoute la première séance datée.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((session) =>
            editingId === session.id ? (
              <li key={session.id}>
                <SessionForm
                  initial={session}
                  onSave={(draft) => handleUpdate(session.id, draft)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={session.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium capitalize">
                    {formatSessionDate(session.date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatHHMM(session.beginTime)}–
                    {formatHHMM(session.endTime)}
                    {session.location && ` • ${session.location}`}
                  </p>
                  {session.notes && (
                    <p className="mt-1 text-sm">{session.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(session.id)}
                    disabled={editingId !== null}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                    aria-label="Éditer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(session.id)}
                    disabled={deletingId === session.id || editingId !== null}
                    className="rounded p-1.5 text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-40"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Sous-composant : form d'une session (create / edit)                    */
/* ─────────────────────────────────────────────────────────────────────── */

interface SessionFormProps {
  initial?: SessionItem;
  onSave: (draft: SessionDraft) => Promise<void>;
  onCancel: () => void;
}

function SessionForm({ initial, onSave, onCancel }: SessionFormProps) {
  const [dateValue, setDateValue] = useState<string>(
    initial ? toDateInputValue(initial.date) : "",
  );
  const [beginTime, setBeginTime] = useState<number>(
    initial?.beginTime ?? 1000,
  );
  const [endTime, setEndTime] = useState<number>(initial?.endTime ?? 1200);
  const [location, setLocation] = useState<string>(initial?.location ?? "");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    if (dateValue === "") {
      setError("La date est obligatoire.");
      return;
    }
    if (endTime <= beginTime) {
      setError("L'heure de fin doit être strictement après l'heure de début.");
      return;
    }

    // "YYYY-MM-DD" → date stockée à **midi UTC** du jour choisi. C'est
    // la convention « date pure » : midi UTC tombe le même jour
    // calendaire dans tous les fuseaux usuels, donc aucune dérive selon
    // le fuseau du serveur ou du client. L'argument explicite garde
    // l'appel pur (pas de `new Date()` sans argument).
    const date = new Date(`${dateValue}T12:00:00.000Z`);

    setIsSaving(true);
    try {
      await onSave({
        date,
        beginTime,
        endTime,
        location: location.trim() === "" ? null : location.trim(),
        notes: notes.trim() === "" ? null : notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-muted/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Date *</span>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Début *</span>
          <TimeInput value={beginTime} onChange={setBeginTime} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Fin *</span>
          <TimeInput value={endTime} onChange={setEndTime} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Lieu</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Dojo principal, Gymnase Jean Moulin…"
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Apporter son propre keikogi…"
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      {error && (
        <pre className="whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
          {error}
        </pre>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? "Enregistrement…" : "Enregistrer la session"}
        </button>
      </div>
    </div>
  );
}