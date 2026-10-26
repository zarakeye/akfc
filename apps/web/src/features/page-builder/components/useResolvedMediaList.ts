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

type Fetched = {
  /** La liste d'identifiants à laquelle ce résultat répond. */
  key: string;
  byId: Record<string, ResolvedMedia | null>;
  status: "ready" | "error";
};

/*
 * Le résultat est ÉTIQUETÉ par la liste qu'il résout : « en cours » se déduit (une liste, et pas
 * encore de résultat pour elle), sans setState synchrone dans l'effet (règle
 * react-hooks/set-state-in-effect). Pendant un nouveau chargement, les médias déjà résolus restent
 * affichés : ajouter une image à une galerie ne fait pas clignoter les autres.
 */
export function useResolvedMediaList(
  mediaIds: readonly string[],
): ResolvedMediaList {
  const [fetched, setFetched] = useState<Fetched | null>(null);

  // Clé stable : le tableau change d'identité à chaque rendu du parent alors
  // que son CONTENU est le plus souvent inchangé. Sans cette clé, l'effet
  // relancerait une requête à chaque frappe dans l'éditeur.
  const key = mediaIds.join(",");

  useEffect(() => {
    if (key.length === 0) return;
    let cancelled = false;
    void trpcClient.media.resolveByIds
      .query({ mediaIds: key.split(",") })
      .then((resolved) => {
        if (!cancelled) setFetched({ key, byId: resolved, status: "ready" });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key, byId: {}, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (key.length === 0) return { byId: {}, status: "idle" };
  if (fetched === null || fetched.key !== key) return { byId: fetched?.byId ?? {}, status: "loading" };
  return { byId: fetched.byId, status: fetched.status };
}
