"use client";

import { useCallback, useEffect, useState, type JSX } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { trpcClient } from "@trpc/trpcClient";

type PollData = NonNullable<
  Awaited<ReturnType<typeof trpcClient.poll.getByPost.query>>
>;

/**
 * Éditeur de sondage côté admin, sur la page d'édition d'un post.
 *
 * Le `pollRouter` propose **create** et **delete** (pas d'édition fine
 * des options). L'éditeur reflète donc cette granularité : soit le post
 * n'a pas de sondage → formulaire de création ; soit il en a un →
 * affichage + suppression. Pour modifier les options, on supprime et on
 * recrée. Si le besoin d'une vraie édition se confirme, on ajoutera des
 * endpoints (addOption/removeOption/updateOption).
 */
export function PollEditor({ postId }: { postId: number }): JSX.Element {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchPoll = useCallback(
    () => trpcClient.poll.getByPost.query({ postId }),
    [postId],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchPoll().then((data) => {
      if (!cancelled) {
        setPoll(data);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPoll]);

  const refresh = async () => {
    setPoll(await fetchPoll());
  };

  return (
    <section className="mt-8 rounded-lg border border-border p-6">
      <h3 className="mb-4 text-lg font-medium">Sondage</h3>
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : poll ? (
        <ExistingPoll poll={poll} onDeleted={refresh} />
      ) : (
        <CreatePollForm postId={postId} onCreated={refresh} />
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Sondage existant — affichage + suppression                            */
/* ─────────────────────────────────────────────────────────────────────── */

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(date));
}

function ExistingPoll({
  poll,
  onDeleted,
}: {
  poll: PollData;
  onDeleted: () => Promise<void>;
}): JSX.Element {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce sondage et tous ses votes ?")) return;
    setDeleting(true);
    try {
      await trpcClient.poll.delete.mutate({ id: poll.id });
      await onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <p className="font-medium">{poll.question}</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {poll.options.map((o) => (
          <li key={o.id} className="flex justify-between">
            <span>{o.label}</span>
            <span className="text-muted-foreground">
              {o.count} vote{o.count > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        {poll.multiple ? "Choix multiples" : "Choix unique"}
        {poll.closesAt && ` • clôture le ${formatDateTime(poll.closesAt)}`}
        {` • ${poll.totalVotes} vote${poll.totalVotes > 1 ? "s" : ""}`}
      </p>
      <p className="text-xs text-muted-foreground">
        Pour modifier les options, supprime puis recrée le sondage.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Formulaire de création                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

function CreatePollForm({
  postId,
  onCreated,
}: {
  postId: number;
  onCreated: () => Promise<void>;
}): JSX.Element {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [multiple, setMultiple] = useState(false);
  const [closesAtValue, setClosesAtValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));

  const handleCreate = async () => {
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o !== "");
    if (question.trim() === "") {
      setError("La question est obligatoire.");
      return;
    }
    if (cleanOptions.length < 2) {
      setError("Renseigne au moins deux options.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await trpcClient.poll.create.mutate({
        postId,
        question: question.trim(),
        multiple,
        closesAt: closesAtValue === "" ? null : new Date(closesAtValue),
        options: cleanOptions,
      });
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Ce post n&apos;a pas encore de sondage. Crée-en un pour activer le vote.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Question *</span>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Quel créneau préférez-vous pour le prochain stage ?"
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Options *</span>
        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={opt}
              onChange={(e) => setOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Retirer l'option"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Ajouter une option
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={multiple}
          onChange={(e) => setMultiple(e.target.checked)}
        />
        Autoriser plusieurs choix par votant
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date de clôture (optionnelle)</span>
        <input
          type="datetime-local"
          value={closesAtValue}
          onChange={(e) => setClosesAtValue(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          Après cette date, le vote est fermé mais les résultats restent
          visibles. Laisser vide = pas de clôture.
        </span>
      </label>

      {error && (
        <pre className="whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
          {error}
        </pre>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Création…" : "Créer le sondage"}
        </button>
      </div>
    </div>
  );
}