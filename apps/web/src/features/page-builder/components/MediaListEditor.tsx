"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";

import { MediaPicker } from "@/features/finder-core/components/MediaPicker";
import { Button } from "@/features/editor-tiptap/ui-primitive/button";
import { trpc, trpcClient } from "@/core/trpc/trpcClient";
import type { AppRouter } from "@backend/modules";

import { usePageBuilderContext } from "@features/page-builder/PageBuilderContext";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Forme du retour de `media.resolveByIds` pour un asset trouvé.
 *
 * Dérivée du router via `inferRouterOutputs` plutôt qu'importée comme
 * type nommé — comme ça aucune dérive possible entre la procédure et
 * son consommateur côté frontend.
 */
export type ResolvedMedia = NonNullable<
  RouterOutputs["media"]["resolveByIds"][string]
>;

export type ResolutionStatus = "loading" | "ready" | "missing";

export interface MediaPreviewProps<TItem extends { mediaId: string }> {
  item: TItem;
  resolved: ResolvedMedia | null;
  status: ResolutionStatus;
}

export interface MediaListEditorProps<TItem extends { mediaId: string }> {
  items: ReadonlyArray<TItem>;
  onChange: (next: TItem[]) => void;

  /** Fabrique un nouvel item à partir d'un mediaId. */
  itemFactory: (mediaId: string) => TItem;

  /** Lit la valeur texte (caption / title / label) d'un item. */
  getItemText: (item: TItem) => string | null | undefined;

  /**
   * Renvoie un item modifié avec une nouvelle valeur texte.
   * Le contrat passe `null` pour signifier « champ vidé » — la fabrique
   * peut le convertir en `undefined` selon la forme du contrat du bloc.
   */
  setItemText: (item: TItem, value: string | null) => TItem;

  /** Placeholder du champ texte. */
  textPlaceholder: string;

  /** Libellé du bouton "Ajouter". */
  addLabel: string;

  /** Message quand la liste est vide (avant tout ajout). */
  emptyStateLabel: string;

  /** Rendu d'aperçu pour un item (variable selon le bloc — image, audio, doc). */
  renderPreview: (props: MediaPreviewProps<TItem>) => ReactNode;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Composant partagé par les Editors des trois blocs média
 * (image-gallery, audio-collection, document-list).
 *
 * ─── Mécanique commune ────────────────────────────────────────────────
 *
 *   - Liste verticale des items, chacun avec son preview (rendu par le
 *     prop `renderPreview`), son champ texte éditable (caption / title /
 *     label selon le bloc), et un bouton supprimer
 *
 *   - Bouton "+ Ajouter" qui ouvre le MediaPicker (avec l'adapter et
 *     l'appRoot fournis par le `PageBuilderContext`)
 *
 *   - Au submit du picker : appel impératif `media.resolveByPaths`
 *     pour convertir les paths en mediaIds, fabrication des items via
 *     `itemFactory`, append à la liste existante
 *
 *   - En arrière-plan : `media.resolveByIds` en useQuery batch pour
 *     résoudre les URLs des items présents (pour les previews). React
 *     Query gère le cache et la re-fetch automatique quand la liste
 *     change.
 *
 * ─── Variations par bloc, injectées via les props ─────────────────────
 *
 *   - Forme de l'item (champ texte différent : caption / title / label)
 *     via `itemFactory`, `getItemText`, `setItemText`
 *
 *   - Rendu du preview (vignette image / icône audio / icône doc)
 *     via `renderPreview`
 *
 * C'est un pattern strategy classique — le composant tient la logique
 * de cycle de vie et de réseau, les blocs spécifient leurs détails.
 *
 * ─── Limites connues ──────────────────────────────────────────────────
 *
 *   - Pas de filtre par kind (image / audio / document) côté picker —
 *     l'utilisateur peut sélectionner n'importe quoi, le preview montrera
 *     « indispo » pour un mismatch. À améliorer quand le MediaPicker
 *     supportera un `kindFilter`.
 *
 *   - Pas de reorder (drag-and-drop) à l'intérieur de la liste — sera
 *     ajouté quand le PageBuilder lui-même aura son DnD (sous-livraison
 *     5e). En attendant, il faut supprimer/réajouter pour réordonner.
 */
export function MediaListEditor<TItem extends { mediaId: string }>({
  items,
  onChange,
  itemFactory,
  getItemText,
  setItemText,
  textPlaceholder,
  addLabel,
  emptyStateLabel,
  renderPreview,
}: MediaListEditorProps<TItem>) {
  const ctx = usePageBuilderContext();
  const [pickerOpen, setPickerOpen] = useState(false);

  /* ─── Résolution batch des mediaIds en URLs ──────────────────────── */

  const mediaIds = useMemo(() => items.map((i) => i.mediaId), [items]);

  const resolveQuery = trpc.media.resolveByIds.useQuery(
    { mediaIds },
    {
      enabled: mediaIds.length > 0,
      // staleTime à 0 : la résolution est cheap (lookup DB simple) et
      // on veut rester réactif si un asset est renommé en arrière-plan
      // par un autre admin.
      staleTime: 0,
    },
  );

  const resolveResult = resolveQuery.data ?? {};
  const isResolving = resolveQuery.isLoading && mediaIds.length > 0;

  function statusFor(mediaId: string): ResolutionStatus {
    if (isResolving) return "loading";
    if (resolveResult[mediaId]) return "ready";
    return "missing";
  }

  /* ─── Actions ────────────────────────────────────────────────────── */

  async function handlePickerSubmit(paths: string[]) {
    if (paths.length === 0) return;
    const resolved = await trpcClient.media.resolveByPaths.query({
      appRoot: ctx.appRoot,
      paths,
    });
    const newMediaIds = Object.values(resolved).filter(
      (id): id is string => id !== null,
    );
    if (newMediaIds.length === 0) return;
    const newItems = newMediaIds.map(itemFactory);
    onChange([...items, ...newItems]);
  }

  function handleRemoveAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleTextChange(index: number, value: string) {
    const trimmed = value.length > 0 ? value : null;
    onChange(
      items.map((item, i) => (i === index ? setItemText(item, trimmed) : item)),
    );
  }

  /* ─── Rendu ──────────────────────────────────────────────────────── */

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {emptyStateLabel}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            // Clé indexée volontairement — pas d'id stable dans le contrat,
            // et le reorder via DnD viendra avec une clé transient
            // (sous-livraison 5e). Index + mediaId suffit pour la rerender
            // stability dans le cas courant.
            <li
              key={`${index}-${item.mediaId}`}
              className="flex items-start gap-3 rounded-md border border-border bg-background p-2"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded">
                {renderPreview({
                  item,
                  resolved: resolveResult[item.mediaId] ?? null,
                  status: statusFor(item.mediaId),
                })}
              </div>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={getItemText(item) ?? ""}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder={textPlaceholder}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                />
                <code className="block text-xs text-muted-foreground opacity-60">
                  {item.mediaId}
                </code>
              </div>

              <Button
                type="button"
                tooltip="Retirer cet élément"
                aria-label="Retirer cet élément"
                onClick={() => handleRemoveAt(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button type="button" onClick={() => setPickerOpen(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden />
          {addLabel}
        </Button>
      </div>

      {pickerOpen && (
        <MediaPicker
          open
          adapter={ctx.adapter}
          rootPath={ctx.appRoot}
          onClose={() => setPickerOpen(false)}
          onSubmit={(paths) => {
            // Le picker rend une Promise via son onSubmit ?
            // Non — c'est une callback sync, on doit awaiter ici dans
            // une fonction async dédiée pour ne pas bloquer le picker.
            void handlePickerSubmit(paths);
          }}
        />
      )}
    </div>
  );
}
