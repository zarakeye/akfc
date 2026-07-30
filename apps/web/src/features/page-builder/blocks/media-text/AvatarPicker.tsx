"use client";

import { useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { avatarUrlFor } from "@features/social/userDisplay";

interface AdminCandidate {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  avatar: string | null;
}

function labelFor(a: AdminCandidate): string {
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
  return name || a.pseudo || "Admin";
}

/**
 * Sélecteur d'avatar d'administrateur pour le bloc media-text. Liste TOUS les
 * admins (avec placeholder si pas d'avatar). Choisir un admin pose une
 * référence LOGIQUE `{ kind: "avatar", userId }` — la page suivra l'avatar
 * courant de ce user.
 *
 * `selectedUserId` : l'admin actuellement référencé (ou null). `onSelect`
 * reçoit le userId choisi, ou null pour retirer la référence.
 */
export function AvatarPicker({
  selectedUserId,
  onSelect,
}: {
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
}): JSX.Element {
  const [admins, setAdmins] = useState<AdminCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void trpcClient.user.listAvatarCandidates.query().then((rows) => {
      if (cancelled) return;
      setAdmins(rows);
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

  if (admins.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Aucun administrateur.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {admins.map((a) => {
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
