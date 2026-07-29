#!/usr/bin/env bash
#
# step_missing_block_previews.sh
#
# Les trois aperçus manquants : galerie d'images, collection audio, liste de
# documents. Réponse au constat d'audit — sur six blocs, deux seulement
# montraient leur rendu final.
#
# ─── Ce que l'audit avait relevé ───────────────────────────────────────────
#
# Ces trois éditeurs n'emploient AUCUNE classe `akfc-*`, alors que leurs vues
# publiques en lisent deux à cinq. L'éditeur est une interface de GESTION —
# ajouter, réordonner, légender — pas un aperçu. Concrètement, la galerie
# laisse choisir entre grille, carrousel et mosaïque sans jamais montrer la
# différence, et les trois variables du laboratoire qu'elle lit
# (`--akfc-item-gap`, `--akfc-card-padding`, `--akfc-caption-size`) restaient
# invisibles à l'édition.
#
# ─── Une résolution partagée, écrite une fois ──────────────────────────────
#
# `useResolvedMediaList` centralise la résolution des identifiants de médias.
# Le média-texte et le float avaient chacun leur copie ; en ajouter trois
# autres aurait fait cinq exemplaires du même effet, avec cinq occasions d'y
# réintroduire l'angle mort corrigé hier (un échec de résolution qui n'affiche
# rien plutôt que de le dire).
#
# Les deux aperçus existants ne sont PAS migrés dessus dans ce script : ils
# fonctionnent, et une migration est un changement à part qu'on ne mêle pas à
# un ajout de fonctionnalité.
#
# ─── Aucun échec muet ──────────────────────────────────────────────────────
#
# Chaque aperçu distingue quatre situations plutôt que d'afficher du vide :
# rien de sélectionné, chargement en cours, échec de la requête, et —
# important — résolution partielle, où l'on annonce combien de médias
# manquent. C'est la leçon du bloc float, appliquée d'emblée.
#
# ─── Une limite connue, à traiter séparément ───────────────────────────────
#
# La galerie publique choisit son nombre de colonnes sur des seuils de
# FENÊTRE (`sm:` / `lg:`), pas de conteneur. Dans le panneau d'édition, plus
# étroit que la page, elle affichera donc le bon nombre de colonnes mais
# resserrées. La structure est fidèle, les proportions non.
#
# Le remède est le même que pour le média-texte : passer la galerie en
# container queries. C'est un chantier distinct, et je préfère ne pas changer
# le rendu public dans un script qui ajoute des aperçus.
#
# Usage :
#   bash step_missing_block_previews.sh
#   AKFC_APPLY_ONLY=1 bash step_missing_block_previews.sh
#
set -euo pipefail

BLOCKS="apps/web/src/features/page-builder/blocks"
COMPONENTS="apps/web/src/features/page-builder/components"
HOOK="$COMPONENTS/useResolvedMediaList.ts"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "DocumentListPreview" "$BLOCKS/document-list/editor.client.tsx" 2>/dev/null; then
  echo "✓ déjà appliqué (aperçus posés) — rien à faire"
  exit 0
fi

for f in "$BLOCKS/image-gallery/editor.client.tsx" \
         "$BLOCKS/audio-collection/editor.client.tsx" \
         "$BLOCKS/document-list/editor.client.tsx"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ─────────────────────────────────────────────────────────────────────────
#  1 — La résolution partagée
# ─────────────────────────────────────────────────────────────────────────

cat > "$HOOK" <<'TS'
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
TS
echo "  + useResolvedMediaList.ts"

# ─────────────────────────────────────────────────────────────────────────
#  2 — Aperçu de la galerie
# ─────────────────────────────────────────────────────────────────────────

cat > "$BLOCKS/image-gallery/ImageGalleryPreview.tsx" <<'TSX'
"use client";

import type { JSX, ReactNode } from "react";

import type { ImageGalleryBlockV1, ResolvedMedia } from "@contracts/page";

import { useResolvedMediaList } from "../../components/useResolvedMediaList";

/**
 * Aperçu client de la galerie, reproduisant `ImageGalleryView`.
 *
 * Les trois dispositions sont recopiées à l'identique — mêmes classes, mêmes
 * variables. C'est le seul moyen de voir ce que « grille », « carrousel » et
 * « mosaïque » veulent dire : l'éditeur les laissait choisir sans jamais les
 * montrer.
 *
 * Limite connue : la vue publique choisit son nombre de colonnes sur des
 * seuils de FENÊTRE (`sm:` / `lg:`) et non de conteneur. Dans le panneau
 * d'édition, plus étroit que la page, le nombre de colonnes est donc juste
 * mais les colonnes sont resserrées. La structure est fidèle, les proportions
 * non — le remède est de passer la galerie en container queries, comme le
 * média-texte, ce qui est un chantier à part.
 */
export function ImageGalleryPreview({
  block,
}: {
  block: ImageGalleryBlockV1;
}): JSX.Element {
  const { byId, status } = useResolvedMediaList(
    block.items.map((i) => i.mediaId),
  );

  const items = block.items.flatMap((item) => {
    const media = byId[item.mediaId];
    return media ? [{ item, media }] : [];
  });

  const missing = block.items.length - items.length;

  if (block.items.length === 0) {
    return <Notice>Aucune image : ajoutez-en pour voir la galerie.</Notice>;
  }
  if (status === "loading") {
    return <Notice>Chargement des images…</Notice>;
  }
  if (status === "error") {
    return <Notice>Échec de la requête de résolution des images.</Notice>;
  }
  if (items.length === 0) {
    return (
      <Notice>
        Aucune des images sélectionnées n&apos;a pu être résolue (supprimées,
        en attente, ou déplacées).
      </Notice>
    );
  }

  return (
    <div>
      {missing > 0 && (
        <Notice>
          {missing} média(s) sélectionné(s) introuvable(s) — non affiché(s)
          ci-dessous ni sur la page publique.
        </Notice>
      )}
      {block.layout === "grid" && (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <Figure key={item.mediaId} media={media} caption={item.caption} />
          ))}
        </div>
      )}
      {block.layout === "carousel" && (
        <div
          className="flex snap-x snap-mandatory overflow-x-auto pb-2"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <div key={item.mediaId} className="w-72 flex-shrink-0 snap-start">
              <Figure media={media} caption={item.caption} />
            </div>
          ))}
        </div>
      )}
      {block.layout === "masonry" && (
        <div
          className="columns-1 sm:columns-2 lg:columns-3"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <div
              key={item.mediaId}
              className="break-inside-avoid"
              style={{ marginBottom: "var(--akfc-item-gap)" }}
            >
              <Figure media={media} caption={item.caption} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Notice({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

function Figure({
  media,
  caption,
}: {
  media: ResolvedMedia;
  caption?: string;
}): JSX.Element {
  return (
    <figure className="m-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt={caption ?? ""}
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading="lazy"
        decoding="async"
        className="block w-full rounded-md object-cover"
      />
      {caption && (
        <figcaption
          className="mt-1 text-muted-foreground"
          style={{ fontSize: "var(--akfc-caption-size)" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
TSX
echo "  + ImageGalleryPreview.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  3 — Aperçu de la collection audio
# ─────────────────────────────────────────────────────────────────────────

cat > "$BLOCKS/audio-collection/AudioCollectionPreview.tsx" <<'TSX'
"use client";

import type { JSX, ReactNode } from "react";

import type { AudioCollectionBlockV1 } from "@contracts/page";

import { useResolvedMediaList } from "../../components/useResolvedMediaList";

/**
 * Aperçu client de la collection audio, reproduisant `AudioCollectionView` —
 * mêmes cartes, mêmes variables (`--akfc-item-gap`, `--akfc-card-padding`),
 * mêmes lecteurs. L'éditeur ne montrait qu'une liste de vignettes.
 */
export function AudioCollectionPreview({
  block,
}: {
  block: AudioCollectionBlockV1;
}): JSX.Element {
  const { byId, status } = useResolvedMediaList(
    block.items.map((i) => i.mediaId),
  );

  const items = block.items.flatMap((item) => {
    const media = byId[item.mediaId];
    return media ? [{ item, media }] : [];
  });

  const missing = block.items.length - items.length;

  if (block.items.length === 0) {
    return <Notice>Aucune piste : ajoutez-en pour voir la collection.</Notice>;
  }
  if (status === "loading") return <Notice>Chargement des pistes…</Notice>;
  if (status === "error") {
    return <Notice>Échec de la requête de résolution des pistes.</Notice>;
  }
  if (items.length === 0) {
    return (
      <Notice>
        Aucune des pistes sélectionnées n&apos;a pu être résolue.
      </Notice>
    );
  }

  return (
    <div>
      {missing > 0 && (
        <Notice>{missing} piste(s) introuvable(s) — non affichée(s).</Notice>
      )}
      <ul className="flex flex-col" style={{ gap: "var(--akfc-item-gap)" }}>
        {items.map(({ item, media }) => (
          <li
            key={item.mediaId}
            className="rounded-md border border-border bg-card"
            style={{ padding: "var(--akfc-card-padding)" }}
          >
            <p className="mb-2 text-sm font-medium">
              {item.title ?? media.fileName}
            </p>
            <audio
              controls
              preload="metadata"
              src={media.url}
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
TSX
echo "  + AudioCollectionPreview.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  4 — Aperçu de la liste de documents
# ─────────────────────────────────────────────────────────────────────────

cat > "$BLOCKS/document-list/DocumentListPreview.tsx" <<'TSX'
"use client";

import type { JSX, ReactNode } from "react";
import { Download, FileText } from "lucide-react";

import type { DocumentListBlockV1 } from "@contracts/page";

import { useResolvedMediaList } from "../../components/useResolvedMediaList";

/**
 * Aperçu client de la liste de documents, reproduisant `DocumentListView` —
 * mêmes rangées, mêmes icônes, mêmes variables. Les liens ne sont pas
 * cliquables ici : un aperçu ne doit pas déclencher de téléchargement.
 */
export function DocumentListPreview({
  block,
}: {
  block: DocumentListBlockV1;
}): JSX.Element {
  const { byId, status } = useResolvedMediaList(
    block.items.map((i) => i.mediaId),
  );

  const items = block.items.flatMap((item) => {
    const media = byId[item.mediaId];
    return media ? [{ item, media }] : [];
  });

  const missing = block.items.length - items.length;

  if (block.items.length === 0) {
    return <Notice>Aucun document : ajoutez-en pour voir la liste.</Notice>;
  }
  if (status === "loading") return <Notice>Chargement des documents…</Notice>;
  if (status === "error") {
    return <Notice>Échec de la requête de résolution des documents.</Notice>;
  }
  if (items.length === 0) {
    return (
      <Notice>
        Aucun des documents sélectionnés n&apos;a pu être résolu.
      </Notice>
    );
  }

  return (
    <div>
      {missing > 0 && (
        <Notice>{missing} document(s) introuvable(s) — non affiché(s).</Notice>
      )}
      <ul className="flex flex-col" style={{ gap: "var(--akfc-item-gap)" }}>
        {items.map(({ item, media }) => (
          <li key={item.mediaId}>
            <div
              className="flex items-center gap-3 rounded-md border border-border bg-card"
              style={{ padding: "var(--akfc-card-padding)" }}
            >
              <FileText
                className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="flex-1 text-sm">
                {item.label ?? media.fileName}
              </span>
              <Download
                className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
TSX
echo "  + DocumentListPreview.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  5 — Montage dans les trois éditeurs
# ─────────────────────────────────────────────────────────────────────────

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.replace('apps/web/src/features/page-builder/blocks/', ''))

B = "apps/web/src/features/page-builder/blocks"

PREVIEW_BLOCK = '''
      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <%s block={block} />
        </div>
      </div>
'''

# ── Galerie : import puis montage en fin de l'arbre existant ──────────────
edit(B + "/image-gallery/editor.client.tsx",
"""import { MediaListEditor } from "../../components/MediaListEditor";""",
"""import { MediaListEditor } from "../../components/MediaListEditor";
import { ImageGalleryPreview } from "./ImageGalleryPreview";""")

edit(B + "/image-gallery/editor.client.tsx",
"""        }}
      />
    </div>
  );
}""",
"""        }}
      />
""" + (PREVIEW_BLOCK % "ImageGalleryPreview") + """    </div>
  );
}""")

# ── Audio : l'éditeur rendait le MediaListEditor nu, il faut l'envelopper ─
edit(B + "/audio-collection/editor.client.tsx",
"""} from "../../components/MediaListEditor";""",
"""} from "../../components/MediaListEditor";
import { AudioCollectionPreview } from "./AudioCollectionPreview";""")

edit(B + "/audio-collection/editor.client.tsx",
"""  return (
    <MediaListEditor<AudioItem>
      items={block.items}
      onChange={(items) => onChange({ ...block, items })}
      itemFactory={(mediaId) => ({ mediaId })}
      getItemText={(item) => item.title}
      setItemText={(item, value) => ({ ...item, title: value ?? undefined })}
      textPlaceholder="Titre (optionnel)"
      addLabel="Ajouter des pistes audio"
      emptyStateLabel="Aucune piste — clique sur « Ajouter des pistes audio » pour en sélectionner."
      renderPreview={AudioPreview}
    />
  );
}""",
"""  return (
    <div className="space-y-4">
      <MediaListEditor<AudioItem>
        items={block.items}
        onChange={(items) => onChange({ ...block, items })}
        itemFactory={(mediaId) => ({ mediaId })}
        getItemText={(item) => item.title}
        setItemText={(item, value) => ({ ...item, title: value ?? undefined })}
        textPlaceholder="Titre (optionnel)"
        addLabel="Ajouter des pistes audio"
        emptyStateLabel="Aucune piste — clique sur « Ajouter des pistes audio » pour en sélectionner."
        renderPreview={AudioPreview}
      />
""" + (PREVIEW_BLOCK % "AudioCollectionPreview") + """    </div>
  );
}""")

# ── Documents : idem (DERNIER fichier écrit, c'est lui que la garde teste) ─
edit(B + "/document-list/editor.client.tsx",
"""} from "../../components/MediaListEditor";""",
"""} from "../../components/MediaListEditor";
import { DocumentListPreview } from "./DocumentListPreview";""")

edit(B + "/document-list/editor.client.tsx",
"""  return (
    <MediaListEditor<DocumentItem>
      items={block.items}
      onChange={(items) => onChange({ ...block, items })}
      itemFactory={(mediaId) => ({ mediaId })}
      getItemText={(item) => item.label}
      setItemText={(item, value) => ({ ...item, label: value ?? undefined })}
      textPlaceholder="Libellé (optionnel)"
      addLabel="Ajouter des documents"
      emptyStateLabel="Aucun document — clique sur « Ajouter des documents » pour en sélectionner."
      renderPreview={DocumentPreview}
    />
  );
}""",
"""  return (
    <div className="space-y-4">
      <MediaListEditor<DocumentItem>
        items={block.items}
        onChange={(items) => onChange({ ...block, items })}
        itemFactory={(mediaId) => ({ mediaId })}
        getItemText={(item) => item.label}
        setItemText={(item, value) => ({ ...item, label: value ?? undefined })}
        textPlaceholder="Libellé (optionnel)"
        addLabel="Ajouter des documents"
        emptyStateLabel="Aucun document — clique sur « Ajouter des documents » pour en sélectionner."
        renderPreview={DocumentPreview}
      />
""" + (PREVIEW_BLOCK % "DocumentListPreview") + """    </div>
  );
}""")
PY

echo "✓ trois aperçus posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(page-builder): apercus pour galerie, audio et documents

Sur six blocs, deux seulement montraient leur rendu final. Ces trois
editeurs n'employaient aucune classe akfc-, alors que leurs vues
publiques en lisent deux a cinq : la galerie laissait choisir entre
grille, carrousel et mosaique sans jamais montrer la difference.

useResolvedMediaList centralise la resolution des identifiants de
medias, jusqu'ici recopiee dans chaque apercu. Les deux apercus
existants ne sont pas migres dessus ici : une migration est un
changement a part.

Chaque apercu distingue quatre situations plutot que d'afficher du
vide — rien de selectionne, chargement, echec de requete, et resolution
PARTIELLE ou l'on annonce combien de medias manquent.

Limite connue : la galerie publique choisit ses colonnes sur des seuils
de fenetre et non de conteneur, donc l'apercu montre le bon nombre de
colonnes mais resserrees. Le remede est de la passer en container
queries comme le media-texte — chantier distinct, qui touche le rendu
public."

echo "✓ commité"
git log -1 --oneline