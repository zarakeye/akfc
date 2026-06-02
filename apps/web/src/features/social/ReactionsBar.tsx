"use client";

import { useCallback, useEffect, useState } from "react";
import { SmilePlus } from "lucide-react";
import type { ReactionTarget } from "@prisma/client";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { UserPortrait, formatUserName } from "@features/social/userDisplay";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

/** Set fixe d'emojis proposés. Modifiable sans rien casser ailleurs. */
const EMOJI_SET = ["👍", "❤️", "😂", "😮", "😢", "👏"] as const;

/** Au-delà, le survol tronque la liste des auteurs avec « +N ». */
const MAX_TOOLTIP_USERS = 8;

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types (dérivés de l'inférence tRPC)                                    */
/* ─────────────────────────────────────────────────────────────────────── */

type ReactionGroup = Awaited<
  ReturnType<typeof trpcClient.reaction.getByTarget.query>
>[number];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant principal                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

export interface ReactionsBarProps {
  targetType: ReactionTarget;
  targetId: number;
  /** Réactions initiales (SSR) ; sinon le composant les charge au montage. */
  initialReactions?: ReactionGroup[];
}

/**
 * Barre de réactions emoji, réutilisable sur un Post comme sur un
 * Comment (polymorphe via `targetType`/`targetId`).
 *
 * Affichage des emojis posés (compteur, surlignage de ceux de
 * l'utilisateur), tooltip auteurs au survol (tronqué « +N »), bouton
 * d'ajout avec set fixe. Lecture seule si non connecté.
 */
export function ReactionsBar({
  targetType,
  targetId,
  initialReactions,
}: ReactionsBarProps) {
  const currentUser = useSessionStore((s) => s.session?.user);
  const canReact = Boolean(currentUser);

  const [reactions, setReactions] = useState<ReactionGroup[]>(
    initialReactions ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const fetchReactions = useCallback(
    () => trpcClient.reaction.getByTarget.query({ targetType, targetId }),
    [targetType, targetId],
  );

  // `refresh` (avec setState) sert aux mutations, hors effet.
  const refresh = useCallback(async () => {
    setReactions(await fetchReactions());
  }, [fetchReactions]);

  // Chargement initial : le setState vit dans le `.then` (asynchrone),
  // donc pas de setState synchrone dans le corps de l'effet.
  useEffect(() => {
    if (initialReactions != null) return;
    let cancelled = false;
    void fetchReactions().then((data) => {
      if (!cancelled) setReactions(data);
    });
    return () => {
      cancelled = true;
    };
  }, [initialReactions, fetchReactions]);

  const handleToggle = async (emoji: string) => {
    if (!canReact || pending) return;
    setPending(emoji);
    try {
      await trpcClient.reaction.toggle.mutate({ targetType, targetId, emoji });
      await refresh();
    } finally {
      setPending(null);
      setPickerOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {reactions.map((group) => (
        <ReactionPill
          key={group.emoji}
          group={group}
          pending={pending === group.emoji}
          canReact={canReact}
          onToggle={() => handleToggle(group.emoji)}
        />
      ))}

      {canReact && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Ajouter une réaction"
          >
            <SmilePlus className="h-4 w-4" />
          </button>

          {pickerOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setPickerOpen(false)}
              />
              <div className="absolute bottom-full left-0 z-20 mb-1 flex gap-1 rounded-full border border-border bg-popover p-1 shadow-md">
                {EMOJI_SET.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleToggle(emoji)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-base transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Pastille d'un emoji + tooltip auteurs                                  */
/* ─────────────────────────────────────────────────────────────────────── */

interface ReactionPillProps {
  group: ReactionGroup;
  pending: boolean;
  canReact: boolean;
  onToggle: () => void;
}

function ReactionPill({ group, pending, canReact, onToggle }: ReactionPillProps) {
  const hidden = group.users.length - MAX_TOOLTIP_USERS;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={!canReact || pending}
        className={[
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors",
          group.reactedByMe
            ? "border-primary bg-primary/10"
            : "border-border hover:bg-muted",
          pending ? "opacity-50" : "",
          !canReact ? "cursor-default" : "",
        ].join(" ")}
      >
        <span>{group.emoji}</span>
        <span className="text-xs tabular-nums">{group.count}</span>
      </button>

      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 group-hover:block">
        <div className="min-w-40 rounded-md border border-border bg-popover p-2 shadow-md">
          <ul className="flex flex-col gap-1">
            {group.users.slice(0, MAX_TOOLTIP_USERS).map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-2 whitespace-nowrap text-xs"
              >
                <UserPortrait user={u} size="sm" />
                <span>{formatUserName(u)}</span>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              +{hidden} autre{hidden > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}