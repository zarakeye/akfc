"use client";

import { useState, type JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@akfc/contracts/page/index.ts";
import { PageBuilder } from "#features/page-builder/index.ts";
import { finderStorageAdapter } from "#features/finder-adapters/storage/finderStorage.adapter.ts";
import { APP_ROOT } from "@akfc/config/app.ts";

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
  const visibility = trpc.pageVisibility.all.useQuery();
  const setPublished = trpc.pageVisibility.setPublished.useMutation();

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

  const published =
    (visibility.data ?? []).find((v) => v.key === slug)?.published ?? false;

  // Sauvegarde du contenu puis positionnement de l'état publié (brouillon
  // ou publié). L'instantané n'est posé qu'au succès.
  async function persist(publish: boolean): Promise<void> {
    const snapshot = JSON.stringify({ title, content });
    await save.mutateAsync({ slug, title: title.trim(), content });
    await setPublished.mutateAsync({ key: slug, published: publish });
    setSavedSnapshot(snapshot);
    await Promise.all([
      utils.sitePage.get.invalidate({ slug }),
      utils.pageVisibility.all.invalidate(),
    ]);
  }

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
            <span className="text-xs font-medium text-warning">
              Modifications non enregistrées
            </span>
          )}
          <span
            className={
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold " +
              (published
                ? "bg-success-muted text-success"
                : "bg-warning-muted text-warning")
            }
          >
            {published ? "Publiée" : "Brouillon"}
          </span>
          <button
            type="button"
            disabled={save.isPending || setPublished.isPending || title.trim() === ""}
            onClick={() => void persist(false)}
            className="shrink-0 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            Enregistrer en brouillon
          </button>
          <button
            type="button"
            disabled={save.isPending || setPublished.isPending || title.trim() === ""}
            onClick={() => void persist(true)}
            className="shrink-0 rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
          >
            {save.isPending || setPublished.isPending ? "…" : "Publier"}
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
