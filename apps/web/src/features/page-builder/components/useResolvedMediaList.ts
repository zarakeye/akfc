"use client";

import { useEffect, useState } from "react";

import { trpcClient } from "@trpc/trpcClient";
import type { ResolvedMedia } from "@contracts/page";

/**
 * Résolution d'une liste d'identifiants de médias, pour les aperçus côté
 * éditeur.
 *
 * Les Views publiques sont des Server Components qui reçoivent un
 * `resolveMedia` déjà résolu ; un aperçu client n'a pas ce luxe et doit
 * interroger le serveur lui-même. Ce hook centralise cet appel, qui était
 * jusqu'ici recopié dans chaque aperçu — autant d'occasions de réintroduire
 * l'angle mort classique : un échec qui n'affiche rien au lieu de le dire.
 */
export type MediaListStatus = "idle" | "loading" | "ready" | "error";

export interface ResolvedMediaList {
  /** Média par identifiant. `null` = résolu mais introuvable côté serveur. */
  byId: Record<string, ResolvedMedia | null>;
  status: MediaListStatus;
}

export function useResolvedMediaList(
  mediaIds: readonly string[],
): ResolvedMediaList {
  const [byId, setById] = useState<Record<string, ResolvedMedia | null>>({});
  const [status, setStatus] = useState<MediaListStatus>("idle");

  // Clé stable : le tableau change d'identité à chaque rendu du parent alors
  // que son CONTENU est le plus souvent inchangé. Sans cette clé, l'effet
  // relancerait une requête à chaque frappe dans l'éditeur.
  const key = mediaIds.join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = key.length > 0 ? key.split(",") : [];

    if (ids.length === 0) {
      setById({});
      setStatus("idle");
      return;
    }

    setStatus("loading");
    void trpcClient.media.resolveByIds
      .query({ mediaIds: ids })
      .then((resolved) => {
        if (cancelled) return;
        setById(resolved);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setById({});
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { byId, status };
}
