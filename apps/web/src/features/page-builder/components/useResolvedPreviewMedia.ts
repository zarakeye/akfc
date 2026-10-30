"use client";

import { useEffect, useState } from "react";

import { trpcClient } from "@trpc/trpcClient";
import type { MediaTextBlockV1 } from "@contracts/page";
import { avatarUrlFor } from "@features/social/userDisplay";

/**
 * Le média d'un bloc, résolu pour l'APERÇU de l'éditeur (les blocs « image et texte » et « texte
 * enrobant une image » le partagent).
 *
 * `missing` = la requête a abouti mais n'a rien rendu (média absent, repassé en attente, ou
 * administrateur sans avatar). `error` = la requête elle-même a échoué. Les distinguer aide au
 * diagnostic : le premier est un problème de contenu, le second un problème de transport.
 */
export type PreviewResolution = "idle" | "loading" | "ready" | "missing" | "error";

export interface ResolvedPreviewMedia {
  url: string;
  kind: string;
  posterUrl: string | null;
  caption?: string;
}

type PreviewMediaRef = MediaTextBlockV1["media"] | null;

/** Ce qui identifie le média : une nouvelle requête seulement quand ELLE change. */
function previewMediaKey(m: PreviewMediaRef): string | null {
  if (m == null) return null;
  if (m.kind === "avatar") return `avatar:${m.userId}`;
  if (m.kind === "site-logo") return "site-logo";
  return m.mediaId;
}

type Fetched = {
  /** Le média auquel ce résultat répond. */
  key: string;
  media: Omit<ResolvedPreviewMedia, "caption"> | null;
  resolution: "ready" | "missing" | "error";
};

/*
 * Pourquoi un résultat ÉTIQUETÉ par sa clé, plutôt que des états remis à « chargement » au début
 * de l'effet : l'état « en cours » se DÉDUIT (on a une clé, et pas encore de résultat pour elle).
 * L'effet ne fait plus de setState synchrone (règle react-hooks/set-state-in-effect) : il ne
 * modifie l'état qu'à l'arrivée de la réponse. Et une réponse arrivée trop tard pour un ancien
 * média est ignorée d'office, puisque sa clé ne correspond plus.
 *
 * La légende n'est pas dans le résultat : elle est prise dans le bloc à chaque rendu, si bien que
 * la taper met l'aperçu à jour sans relancer de requête.
 */
export function useResolvedPreviewMedia(m: PreviewMediaRef): {
  media: ResolvedPreviewMedia | null;
  resolution: PreviewResolution;
} {
  const key = previewMediaKey(m);
  const [fetched, setFetched] = useState<Fetched | null>(null);

  useEffect(() => {
    if (m == null || key === null) return;
    let cancelled = false;
    const done = (media: Fetched["media"], resolution: Fetched["resolution"]) => {
      if (!cancelled) setFetched({ key, media, resolution });
    };

    if (m.kind === "avatar") {
      void trpcClient.user.listAvatarCandidates
        .query()
        .then((candidates) => {
          const user = candidates.find((a) => a.id === m.userId);
          // Même URL que la page publique : un aperçu qui emprunte un autre chemin que le rendu
          // final n'est pas un aperçu.
          if (user?.avatar) done({ url: avatarUrlFor(user.id), kind: "image", posterUrl: null }, "ready");
          else done(null, "missing");
        })
        .catch(() => done(null, "error"));
    } else if (m.kind === "site-logo") {
      // Logo du site : URL publique via siteSettings.get (repli embarqué).
      void trpcClient.siteSettings.get
        .query()
        .then((s) => done({ url: s?.logoUrl ?? "/AKFC_logo.svg", kind: "image", posterUrl: null }, "ready"))
        .catch(() => done(null, "error"));
    } else {
      // Média de bibliothèque. `resolveByIds` ne renvoie que les médias validés : un média repassé
      // en attente ou mis à la corbeille APRÈS avoir été choisi revient `null`.
      void trpcClient.media.resolveByIds
        .query({ mediaIds: [m.mediaId] })
        .then((resolved) => {
          const r = resolved[m.mediaId];
          if (r) done({ url: r.url, kind: r.kind, posterUrl: r.posterUrl }, "ready");
          else done(null, "missing");
        })
        .catch(() => done(null, "error"));
    }

    return () => {
      cancelled = true;
    };
    // Relancé quand le MÉDIA change (sa clé), pas à chaque modification du bloc (la légende).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (m == null || key === null) return { media: null, resolution: "idle" };
  if (fetched === null || fetched.key !== key) return { media: null, resolution: "loading" };
  return {
    media: fetched.media ? { ...fetched.media, caption: m.caption } : null,
    resolution: fetched.resolution,
  };
}
