"use client";

import { useCallback, useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

type PollData = NonNullable<
  Awaited<ReturnType<typeof trpcClient.poll.getByPost.query>>
>;

/**
 * Widget de sondage public, sous un article. Ne rend **rien** si le
 * post n'a pas de sondage.
 *
 * Deux modes :
 * - **Vote** : options sélectionnables (radio si choix unique,
 *   cases si multiple) tant que l'utilisateur connecté n'a pas voté et
 *   que le sondage est ouvert.
 * - **Résultats** : barres proportionnelles avec %, dès que l'on a
 *   voté, que le sondage est clos, ou que l'on n'est pas connecté.
 *
 * `isClosed` est calculé côté serveur (au fetch) — pas de `Date.now()`
 * dans le render.
 */
export function PollWidget({ postId }: { postId: number }): JSX.Element | null {
  const currentUser = useSessionStore((s) => s.session?.user);
  const canVote = Boolean(currentUser);

  const [poll, setPoll] = useState<PollData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [editingVote, setEditingVote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoll = useCallback(
    () => trpcClient.poll.getByPost.query({ postId }),
    [postId],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchPoll().then((data) => {
      if (!cancelled) {
        setPoll(data);
        setSelected(data?.myVotes ?? []);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPoll]);

  if (!loaded || !poll) return null;

  const hasVoted = poll.myVotes.length > 0;
  const showResults = (hasVoted && !editingVote) || poll.isClosed || !canVote;

  const toggleOption = (optionId: number) => {
    if (poll.multiple) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelected([optionId]);
    }
  };

  const handleVote = async () => {
    if (selected.length === 0) {
      setError("Sélectionne au moins une option.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await trpcClient.poll.vote.mutate({
        pollId: poll.id,
        optionIds: selected,
      });
      const fresh = await fetchPoll();
      setPoll(fresh);
      setSelected(fresh?.myVotes ?? []);
      setEditingVote(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-border p-5">
      <h3 className="font-medium">{poll.question}</h3>
      {poll.isClosed && (
        <p className="mt-1 text-xs text-muted-foreground">Sondage clos</p>
      )}

      {showResults ? (
        <PollResults poll={poll} />
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {poll.options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type={poll.multiple ? "checkbox" : "radio"}
                name={`poll-${poll.id}`}
                checked={selected.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
              />
              {opt.label}
            </label>
          ))}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleVote}
              disabled={submitting}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Envoi…" : "Voter"}
            </button>
            {hasVoted && (
              <button
                type="button"
                onClick={() => {
                  setSelected(poll.myVotes);
                  setEditingVote(false);
                }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}

      {showResults && hasVoted && !poll.isClosed && canVote && (
        <button
          type="button"
          onClick={() => setEditingVote(true)}
          className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Modifier mon vote
        </button>
      )}

      {!canVote && !poll.isClosed && (
        <p className="mt-3 text-xs text-muted-foreground">
          Connecte-toi pour voter.
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {poll.totalVotes} vote{poll.totalVotes > 1 ? "s" : ""}
        {poll.multiple && " • choix multiples"}
      </p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Résultats (barres proportionnelles)                                    */
/* ─────────────────────────────────────────────────────────────────────── */

function PollResults({ poll }: { poll: PollData }): JSX.Element {
  return (
    <div className="mt-3 flex flex-col gap-3">
      {poll.options.map((opt) => {
        const pct =
          poll.totalVotes > 0
            ? Math.round((opt.count / poll.totalVotes) * 100)
            : 0;
        const mine = poll.myVotes.includes(opt.id);
        return (
          <div key={opt.id}>
            <div className="flex items-center justify-between text-sm">
              <span className={mine ? "font-medium" : ""}>
                {opt.label}
                {mine && " ✓"}
              </span>
              <span className="text-xs text-muted-foreground">
                {pct}% ({opt.count})
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${mine ? "bg-primary" : "bg-primary/50"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}