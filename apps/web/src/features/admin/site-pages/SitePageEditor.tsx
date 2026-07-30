"use client";

import { useState, type JSX } from "react";

import { trpc } from "@/core/trpc/trpcClient";
import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";
import { PageBuilder } from "@features/page-builder";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

/**
 * Éditeur d'une page de contenu, quelle qu'elle soit.
 *
 * Générique par slug plutôt que spécialisé « association » : le socle
 * `SitePage` couvre toute une famille de pages, et un éditeur par page aurait
 * été à réécrire à chaque ajout.
 *
 * Le builder est COMPLET ici, contrairement à la présentation synthétique
 * d'une discipline : une page de club est un contenu long, où galeries et
 * colonnes ont leur place.
 */
export function SitePageEditor({
  slug,
  fallbackTitle,
}: {
  slug: string;
  fallbackTitle: string;
}): JSX.Element {
  const existing = trpc.sitePage.get.useQuery({ slug });
  const utils = trpc.useUtils();
  const save = trpc.sitePage.save.useMutation({
    onSuccess: () => {
      void utils.sitePage.get.invalidate({ slug });
    },
  });

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<PageContentV1 | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  if (existing.isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  const persistedTitle = existing.data?.title ?? fallbackTitle;
  const persistedContent = existing.data
    ? parsePageContentV1(existing.data.content)
    : emptyPageContentV1();

  const title = titleDraft ?? persistedTitle;
  const content = contentDraft ?? persistedContent;

  // Comparaison sur le contenu sérialisé plutôt qu'un simple drapeau :
  // défaire une modification redonne « à jour » au lieu de laisser un faux
  // positif collé jusqu'au rechargement.
  const baseline =
    savedSnapshot ?? JSON.stringify({ title: persistedTitle, content: persistedContent });
  const dirty = JSON.stringify({ title, content }) !== baseline;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Titre de la page
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitleDraft(e.target.value)}
            className="w-full max-w-md rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-amber-600">
              Modifications non enregistrées
            </span>
          )}
          <button
            type="button"
            disabled={save.isPending || !dirty || title.trim() === ""}
            onClick={() => {
              // L'instantané est pris AVANT l'appel et posé seulement au
              // succès : un enregistrement qui échoue ne doit pas faire
              // croire que le contenu est à jour.
              const snapshot = JSON.stringify({ title, content });
              save.mutate(
                { slug, title: title.trim(), content },
                { onSuccess: () => setSavedSnapshot(snapshot) },
              );
            }}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <PageBuilder
        value={content}
        onChange={setContentDraft}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
      />

      {save.isError && (
        <p className="text-xs text-destructive">
          Échec de l&apos;enregistrement : {save.error.message}
        </p>
      )}
    </div>
  );
}
