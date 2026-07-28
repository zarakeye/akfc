#!/usr/bin/env bash
#
# fix_float_preview_resolution.sh
#
# Correctif — l'aperçu du bloc float ne compilait pas. Deux erreurs, une seule
# cause : j'avais écrit cette résolution de mémoire au lieu de lire celle du
# média-texte, qui fonctionne depuis des semaines.
#
#   1. `block.media!.userId` — le `!` dans une closure fait perdre à TypeScript
#      le rétrécissement obtenu par le test `kind === "avatar"`. Le vrai code
#      capture le média dans une constante locale (`const m = block.media`),
#      et le rétrécissement tient sur toute la portée.
#
#   2. `resolveByIds.query({ ids: [...] })` — la procédure attend `mediaIds`.
#
# Plutôt que rapiécer deux lignes, l'aperçu est réécrit sur le patron exact du
# MediaTextPreview : même capture locale, même découpage avatar/bibliothèque,
# même distinction des états (`idle` / `loading` / `ready` / `missing` /
# `error`, qui sépare « rien choisi », « en cours », « choisi mais
# introuvable » — trois situations qui rendaient toutes du vide sans lui).
#
# Seule la mise en page diffère : enrobage au lieu de deux colonnes.
#
# Usage :
#   bash fix_float_preview_resolution.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_preview_resolution.sh
#
set -euo pipefail

PREVIEW="apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (AVANT les prérequis) ────────────────────
if grep -q "mediaIds: \[m.mediaId\]" "$PREVIEW" 2>/dev/null; then
  echo "✓ déjà appliqué (résolution corrigée) — rien à faire"
  exit 0
fi

[ -f "$PREVIEW" ] || { echo "✗ introuvable : $PREVIEW"; exit 1; }

# Le fichier est réécrit en entier : il a été créé par le script précédent et
# n'a pas été édité à la main, donc rien à préserver.
cat > "$PREVIEW" <<'TSX'
"use client";

import { useEffect, useState, type CSSProperties, type JSX } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

import { trpcClient } from "@trpc/trpcClient";
import type { FloatTextBlockV1 } from "@contracts/page";
import { publicIdToUrl } from "@features/social/userDisplay";

/**
 * Aperçu CLIENT du bloc float, affiché sous l'éditeur dans le builder.
 *
 * Reproduit le rendu public (FloatTextView, Server Component non montable
 * ici) : même enrobage, même côté. La résolution des médias suit exactement
 * le patron du MediaTextPreview — les deux blocs partagent le modèle de
 * média, il n'y avait aucune raison d'en inventer un autre.
 *
 * Le nœud `library-image` inline n'est pas résolu ici (pas de résolution
 * serveur côté client) : les images insérées DANS le texte n'apparaissent
 * donc pas dans l'aperçu, ce qui est acceptable.
 */

/**
 * État de la résolution du média.
 *
 * `missing` = la requête a abouti mais n'a rien rendu (média absent, ou
 * administrateur sans avatar). `error` = la requête elle-même a échoué.
 */
type Resolution = "idle" | "loading" | "ready" | "missing" | "error";

interface ResolvedPreviewMedia {
  url: string;
  kind: string;
  posterUrl: string | null;
  caption?: string;
}

export function FloatTextPreview({
  block,
}: {
  block: FloatTextBlockV1;
}): JSX.Element | null {
  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);
  const [resolution, setResolution] = useState<Resolution>("idle");

  // Capture locale : c'est elle qui permet à TypeScript de conserver le
  // rétrécissement obtenu par `m.kind === "avatar"` jusque dans les closures
  // asynchrones. Un `block.media!` à l'intérieur du `.then()` le perdrait.
  const m = block.media ?? null;
  const mediaKey =
    m == null ? null : m.kind === "avatar" ? `avatar:${m.userId}` : m.mediaId;

  useEffect(() => {
    let cancelled = false;
    if (!m) {
      setMedia(null);
      setResolution("idle");
      return;
    }

    setMedia(null);
    setResolution("loading");

    if (m.kind === "avatar") {
      void trpcClient.user.listAvatarCandidates
        .query()
        .then((admins) => {
          if (cancelled) return;
          const user = admins.find((a) => a.id === m.userId);
          if (user?.avatar) {
            setMedia({
              url: publicIdToUrl(user.avatar),
              kind: "image",
              posterUrl: null,
              caption: m.caption,
            });
            setResolution("ready");
          } else {
            setMedia(null);
            setResolution("missing");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });
    } else {
      void trpcClient.media.resolveByIds
        .query({ mediaIds: [m.mediaId] })
        .then((resolved) => {
          if (cancelled) return;
          const r = resolved[m.mediaId];
          if (r) {
            setMedia({
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: m.caption,
            });
            setResolution("ready");
          } else {
            setMedia(null);
            setResolution("missing");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setMedia(null);
          setResolution("error");
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey]);

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;

  const textHtml = hasText
    ? generateHTML(block.content as JSONContent, [
        StarterKit.configure({ horizontalRule: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Subscript,
        Superscript,
      ])
    : null;

  // Rien à montrer : on dit LAQUELLE des situations c'est, plutôt que de
  // rendre du vide indistinct.
  if (!hasText && !media) {
    return (
      <p className="text-sm text-muted-foreground">
        {resolution === "loading"
          ? "Chargement du média…"
          : resolution === "missing"
            ? "Média sélectionné introuvable (supprimé, en attente, ou administrateur sans avatar)."
            : resolution === "error"
              ? "Échec du chargement du média."
              : "Bloc vide : ajoutez une image et du texte."}
      </p>
    );
  }

  return (
    <div className="akfc-float-scope akfc-measure-block">
      <div
        className="akfc-float"
        style={
          {
            "--akfc-float-side": block.side === "right" ? "right" : "left",
          } as CSSProperties
        }
      >
        {media && (
          <figure className="akfc-float-figure m-0">
            {media.kind === "video" ? (
              <video
                src={media.url}
                poster={media.posterUrl ?? undefined}
                controls
                className="block w-full rounded-md"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.url}
                alt={media.caption ?? ""}
                className="block w-full rounded-md object-cover"
              />
            )}
            {media.caption && (
              <figcaption className="mt-1 text-sm text-muted-foreground">
                {media.caption}
              </figcaption>
            )}
          </figure>
        )}
        {textHtml && (
          <div
            className="akfc-prose tiptap-rendered prose max-w-none"
            dangerouslySetInnerHTML={{ __html: textHtml }}
          />
        )}
        <div className="akfc-float-clear" />
      </div>
    </div>
  );
}
TSX

echo "  ~ FloatTextPreview.tsx (résolution réécrite sur le patron du média-texte)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ─────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(page-builder): bloc texte enrobant une image (float)

Sixieme type de bloc, aux cotes du media-texte et non a sa place : le
media-texte separe image et texte en deux colonnes, le float integre
l'image DANS le texte qui l'enrobe. Deux moteurs de mise en page
distincts — flexbox et grid ne peuvent pas produire un enrobage, seul
le float garde l'image dans le flux inline.

Reutilise le modele de media (bibliotheque ou avatar via
mediaTextItemSchema), le noeud image serveur, le rendu du texte riche,
et le patron de resolution client du MediaTextPreview. De neuf : la
disposition (float + clear + shape-outside), deux variables reglables
(largeur image, gouttiere d'enrobage) et son repli mobile (image pleine
largeur sous 34rem).

Deux raccords que le nouveau type a reveles :
- extractMediaIdsFromBlock partage sa branche avec le media-texte, sans
  quoi l'image d'un bloc float ne serait pas enregistree dans
  PageMediaReference et l'asset passerait pour orphelin ;
- PageRenderer collecte desormais les avatars des DEUX types de bloc.
  Cet oubli-la ne cassait pas la compilation : il rendait juste l'image
  absente, en silence, precisement pour le portrait d'instructeur."

echo "✓ commité"
git log -1 --oneline