"use client";

import { useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { avatarUrlFor } from "@features/social/userDisplay";

interface AvatarCandidate {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  avatar: string | null;
}

function labelFor(a: AvatarCandidate): string {
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
  return name || a.pseudo || "Membre";
}

/**
 * Sélecteur d'avatar des blocs media-text et float-text. Liste les candidats
 * que le serveur autorise (`listAvatarCandidates` : les administrateurs et
 * soi-même pour un administrateur, soi seul pour un autre membre), avec un
 * placeholder si pas d'avatar. Choisir un membre pose une référence LOGIQUE
 * `{ kind: "avatar", userId }` — la page suivra l'avatar courant de ce membre.
 *
 * `selectedUserId` : le membre actuellement référencé (ou null). `onSelect`
 * reçoit le userId choisi, ou null pour retirer la référence.
 */
export function AvatarPicker({
  selectedUserId,
  onSelect,
}: {
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
}): JSX.Element {
  const [candidates, setCandidates] = useState<AvatarCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void trpcClient.user.listAvatarCandidates.query().then((rows) => {
      if (cancelled) return;
      setCandidates(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground">Chargement des avatars…</p>
    );
  }

  if (candidates.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Aucun avatar disponible.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {candidates.map((a) => {
        const selected = a.id === selectedUserId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(selected ? null : a.id)}
            className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors ${
              selected
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted"
            }`}
            title={labelFor(a)}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-muted">
              {a.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrlFor(a.id)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {labelFor(a).slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
            <span>{labelFor(a)}</span>
          </button>
        );
      })}
    </div>
  );
}
