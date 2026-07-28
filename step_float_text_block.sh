#!/usr/bin/env bash
#
# step_float_text_block.sh
#
# Incrément — nouveau bloc « texte avec image flottante », aux côtés du
# média-texte, pas à sa place.
#
# ─── Pourquoi un bloc distinct, et non une fusion ──────────────────────────
#
# Le média-texte, quand il a ses deux parties, construit une GRILLE à deux
# colonnes avec alternance des côtés et largeurs inégales : la grille EST le
# bloc. Le float n'a ni grille, ni colonnes, ni alternance de largeurs — une
# seule coulée de texte, une image `float`-ée dedans, `clear` en pied. Ce sont
# deux moteurs de mise en page sans rapport. Les fusionner reviendrait à un
# bloc à interrupteur qui change tout en aval — exactement la lourdeur qu'on
# cherche à éviter.
#
# Ce qu'ils PARTAGENT (et qu'on réutilise tel quel) : le modèle de média
# (bibliothèque ou avatar), le nœud image serveur, `MediaFigure`, le rendu du
# texte riche. Ce qui DIFFÈRE (et qu'on écrit de neuf) : la disposition.
#
# ─── Le rendu ──────────────────────────────────────────────────────────────
#
# Une seule image, calée à gauche (ou à droite), le texte l'enrobe et se
# poursuit dessous quand il dépasse sa hauteur. `shape-outside` adoucit
# l'enrobage. Deux variables de laboratoire : la largeur de l'image et la
# gouttière entre l'image et le texte. Un `clear` en fin de bloc empêche le
# flottant de déborder sur le bloc suivant.
#
# Repli mobile : sous une largeur where l'enrobage n'a plus de sens (une
# image à 40% d'un écran de téléphone laisse trois mots par ligne), le float
# est neutralisé — l'image passe pleine largeur au-dessus du texte. Même
# logique de container query que le média-texte.
#
# Usage :
#   bash step_float_text_block.sh
#   AKFC_APPLY_ONLY=1 bash step_float_text_block.sh
#
set -euo pipefail

CONTRACT="packages/contracts/src/page/blocks.v1.ts"
BLOCKS="apps/web/src/features/page-builder/blocks"
FDIR="$BLOCKS/float-text"
REGISTRY="apps/web/src/features/page-builder/blockRegistry.ts"
GLOBALS="apps/web/src/app/globals.css"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Garde anti-double-application (AVANT prérequis) ────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$CONTRACT" "$REGISTRY" "$GLOBALS" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

if [ -d "$FDIR" ]; then
  echo "✓ déjà appliqué ($FDIR existe) — rien à faire"
  exit 0
fi

grep -q "mediaTextBlockSchema" "$CONTRACT" || {
  echo "✗ le bloc media-text doit exister (contrat introuvable)"; exit 1; }

mkdir -p "$FDIR"

# ─────────────────────────────────────────────────────────────────────────
#  Fichiers de bloc créés directement (pas de substitution : ils sont neufs)
# ─────────────────────────────────────────────────────────────────────────

cat > "$FDIR/index.tsx" <<'TSX'
import { WrapText } from "lucide-react";
import type { FloatTextBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { FloatTextEditor } from "./editor.client";
import { FloatTextView } from "./view.server";

/**
 * « Texte avec image flottante » : une image calée à gauche ou à droite, que
 * le texte enrobe puis dépasse. À distinguer du média-texte, qui sépare
 * l'image et le texte en deux colonnes. Ici l'image est DANS le texte.
 */
export const floatTextDefinition: BlockDefinition<FloatTextBlockV1> = {
  kind: "float-text",
  label: "Texte enrobant une image",
  icon: <WrapText className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "float-text",
    // side par défaut : image à gauche, cas le plus courant (portrait en
    // tête d'article). Réglable dans l'éditeur.
    side: "left",
  }),
  Editor: FloatTextEditor,
  View: FloatTextView,
};
TSX
echo "  + float-text/index.tsx"

cat > "$FDIR/view.server.tsx" <<'TSX'
import { Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import type { CSSProperties } from "react";
import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";

import type { FloatTextBlockV1, ResolvedMedia } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Nœud image server-only — identique au média-texte et au bloc tiptap.    */
/*  Dupliqué à dessein : chaque View est un module serveur autonome, et le  */
/*  factoriser créerait une dépendance croisée entre blocs pour trois       */
/*  lignes. La règle du projet est l'indépendance des blocs.                */
/* ─────────────────────────────────────────────────────────────────────── */

interface ServerLibraryImageOptions {
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
}

const ServerLibraryImageNode = Node.create<ServerLibraryImageOptions>({
  name: "library-image",
  group: "block",
  atom: true,
  addOptions() {
    return { resolveMedia: () => null };
  },
  addAttributes() {
    return { mediaId: { default: null }, caption: { default: null } };
  },
  renderHTML({ node }) {
    const mediaId = node.attrs.mediaId as string | null;
    const caption = node.attrs.caption as string | null;
    if (!mediaId) return ["span", { class: "hidden", "aria-hidden": "true" }];
    const media = this.options.resolveMedia(mediaId);
    if (!media) return ["span", { class: "hidden", "aria-hidden": "true" }];
    const imgAttrs: Record<string, unknown> = {
      src: media.url,
      alt: caption ?? "",
      loading: "lazy",
      decoding: "async",
    };
    if (media.width !== null) imgAttrs.width = media.width;
    if (media.height !== null) imgAttrs.height = media.height;
    if (caption) {
      return [
        "figure",
        { class: "tiptap-library-image" },
        ["img", imgAttrs],
        ["figcaption", {}, caption],
      ];
    }
    return ["figure", { class: "tiptap-library-image" }, ["img", imgAttrs]];
  },
});

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc « texte enrobant une image ».
 *
 * L'image est `float`-ée du côté choisi (indépendant de l'alternance
 * média-texte : ce côté est une donnée du bloc, pas une décision de position,
 * parce qu'un enrobage n'alterne pas — on choisit où l'illustration se pose).
 * Le texte l'enrobe et se poursuit dessous. Un `clear` en pied empêche le
 * flottant de mordre sur le bloc suivant.
 *
 * Container query : sous 34rem, le float est neutralisé (image pleine largeur
 * au-dessus du texte). En dessous, l'enrobage laisserait trop peu de place au
 * texte pour être lisible.
 */
export function FloatTextView({
  block,
  resolveMedia,
  resolveAvatar,
}: BlockViewProps<FloatTextBlockV1>) {
  const resolvedMedia = !block.media
    ? null
    : block.media.kind === "avatar"
      ? (resolveAvatar?.(block.media.userId) ?? null)
      : resolveMedia(block.media.mediaId);
  const mediaCaption = block.media?.caption;

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;
  const hasMedia = resolvedMedia !== null;

  if (!hasText && !hasMedia) return null;

  const textHtml = hasText
    ? generateHTML(block.content as JSONContent, [
        StarterKit.configure({ horizontalRule: false }),
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Subscript,
        Superscript,
        ServerLibraryImageNode.configure({ resolveMedia }),
      ])
    : null;

  // Sans image : le bloc dégénère en simple texte, à la mesure. Sans texte :
  // l'image seule, centrée. Le float n'a de sens qu'avec les deux.
  if (!hasMedia || !resolvedMedia) {
    return (
      <div
        className="akfc-measure-block akfc-prose tiptap-rendered prose max-w-none prose-h5:text-base prose-h5:font-semibold prose-h5:mt-6 prose-h6:text-sm prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6"
        dangerouslySetInnerHTML={{ __html: textHtml ?? "" }}
      />
    );
  }
  if (!hasText || !textHtml) {
    return (
      <div className="akfc-measure-block">
        <FloatFigure media={resolvedMedia} caption={mediaCaption} />
      </div>
    );
  }

  // Les deux présents : enrobage. `akfc-float-scope` est le conteneur de
  // requête (comme `akfc-block-scope` pour le média-texte) ; `akfc-float`
  // porte le float et le `clear`.
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
        <figure className="akfc-float-figure m-0">
          {resolvedMedia.kind === "video" ? (
            <video
              src={resolvedMedia.url}
              poster={resolvedMedia.posterUrl ?? undefined}
              controls
              className="block w-full rounded-md"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedMedia.url}
              alt={mediaCaption ?? ""}
              width={resolvedMedia.width ?? undefined}
              height={resolvedMedia.height ?? undefined}
              loading="lazy"
              decoding="async"
              className="block w-full rounded-md object-cover"
            />
          )}
          {mediaCaption && (
            <figcaption className="mt-1 text-sm text-muted-foreground">
              {mediaCaption}
            </figcaption>
          )}
        </figure>

        <div
          className="akfc-prose tiptap-rendered prose max-w-none prose-h5:text-base prose-h5:font-semibold prose-h5:mt-6 prose-h6:text-sm prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />

        {/* Referme le flottant : sans lui, une image plus haute que le texte
            déborderait sur le bloc suivant. */}
        <div className="akfc-float-clear" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  FloatFigure — image ou vidéo, pour le cas « image seule »               */
/* ─────────────────────────────────────────────────────────────────────── */

function FloatFigure({
  media,
  caption,
}: {
  media: ResolvedMedia;
  caption?: string;
}) {
  return (
    <figure className="m-0">
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
          alt={caption ?? ""}
          width={media.width ?? undefined}
          height={media.height ?? undefined}
          loading="lazy"
          decoding="async"
          className="block w-full rounded-md object-cover"
        />
      )}
      {caption && (
        <figcaption className="mt-1 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
TSX
echo "  + float-text/view.server.tsx"

cat > "$FDIR/editor.client.tsx" <<'TSX'
"use client";

import { useCallback } from "react";
import type { FloatTextBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { BuilderTipTapEditor } from "../tiptap/builder-tiptap-editor";
import { AvatarPicker } from "../media-text/AvatarPicker";
import { FloatTextPreview } from "./FloatTextPreview";

/**
 * Éditeur du bloc « texte enrobant une image ».
 *
 * Trois réglages : l'image (bibliothèque OU avatar, comme le média-texte),
 * son côté (gauche/droite), et le texte. L'`AvatarPicker` est réutilisé
 * depuis le média-texte — c'est le même sélecteur, il n'y a pas lieu de le
 * dupliquer.
 */
export function FloatTextEditor({
  block,
  onChange,
}: BlockEditorProps<FloatTextBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Côté de l'image */}
      <div className="space-y-1">
        <span className="text-sm font-medium text-muted-foreground">
          Côté de l&apos;image
        </span>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...block, side: s })}
              className={
                (block.side ?? "left") === s
                  ? "rounded border border-foreground px-3 py-1 text-sm"
                  : "rounded border px-3 py-1 text-sm hover:bg-muted"
              }
            >
              {s === "left" ? "À gauche" : "À droite"}
            </button>
          ))}
        </div>
      </div>

      {/* Image — une seule, bibliothèque ou avatar (exclusifs). */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">
          Image (une image de la bibliothèque, ou un avatar d&apos;admin)
        </span>

        {(!block.media || block.media.kind === "library") && (
          <MediaListEditor
            items={
              block.media && block.media.kind === "library" ? [block.media] : []
            }
            onChange={(list) =>
              onChange({
                ...block,
                media:
                  list.length > 0
                    ? { ...list[list.length - 1], kind: "library" as const }
                    : undefined,
              })
            }
            itemFactory={(mediaId) => ({ kind: "library" as const, mediaId })}
            getItemText={(item) => item.caption}
            setItemText={(item, value) => ({
              ...item,
              caption: value ?? undefined,
            })}
            textPlaceholder="Légende (optionnelle)"
            addLabel={block.media ? "Remplacer l'image" : "Ajouter une image"}
            emptyStateLabel="Aucune image de bibliothèque sélectionnée."
            renderPreview={({ resolved, status }) => {
              if (status === "loading") {
                return <div className="h-full w-full animate-pulse bg-muted" />;
              }
              if (status === "missing" || !resolved) {
                return (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                    indispo
                  </div>
                );
              }
              if (resolved.kind === "video") {
                return (
                  <div className="flex h-full w-full items-center justify-center bg-black text-[10px] text-white">
                    vidéo
                  </div>
                );
              }
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolved.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              );
            }}
          />
        )}

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            …ou l&apos;avatar d&apos;un administrateur
          </span>
          <AvatarPicker
            selectedUserId={
              block.media && block.media.kind === "avatar"
                ? block.media.userId
                : null
            }
            onSelect={(userId) =>
              onChange({
                ...block,
                media: userId
                  ? {
                      kind: "avatar",
                      userId,
                      caption:
                        block.media && "caption" in block.media
                          ? block.media.caption
                          : undefined,
                    }
                  : undefined,
              })
            }
          />
        </div>
      </div>

      {/* Texte */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Texte
        </span>
        <BuilderTipTapEditor
          content={block.content ?? {}}
          onChange={handleContentChange}
        />
      </div>

      {/* Aperçu */}
      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <FloatTextPreview block={block} />
        </div>
      </div>
    </div>
  );
}
TSX
echo "  + float-text/editor.client.tsx"

cat > "$FDIR/FloatTextPreview.tsx" <<'TSX'
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
 * Aperçu CLIENT du bloc float, sous l'éditeur. Reproduit le rendu public
 * (FloatTextView, Server Component non montable ici) : même enrobage, même
 * côté. Le nœud library-image inline n'est pas résolu ici (pas de résolution
 * serveur) — acceptable pour un aperçu.
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
}): JSX.Element {
  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);
  const [status, setStatus] = useState<Resolution>("idle");

  const mediaKey = block.media
    ? block.media.kind === "avatar"
      ? `avatar:${block.media.userId}`
      : `lib:${block.media.mediaId}`
    : null;

  useEffect(() => {
    let cancelled = false;
    if (!block.media) {
      setMedia(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");

    const run = async (): Promise<void> => {
      try {
        if (block.media!.kind === "avatar") {
          const candidates =
            await trpcClient.user.listAvatarCandidates.query();
          const found = candidates.find((c) => c.id === block.media!.userId);
          if (cancelled) return;
          if (!found || !found.avatar) {
            setStatus("missing");
            setMedia(null);
            return;
          }
          setMedia({
            url: publicIdToUrl(found.avatar),
            kind: "image",
            posterUrl: null,
            caption: block.media!.caption,
          });
          setStatus("ready");
        } else {
          const resolved = await trpcClient.media.resolveByIds.query({
            ids: [block.media!.mediaId],
          });
          if (cancelled) return;
          const first = resolved[block.media!.mediaId];
          if (!first) {
            setStatus("missing");
            setMedia(null);
            return;
          }
          setMedia({
            url: first.url,
            kind: first.kind,
            posterUrl: first.posterUrl ?? null,
            caption: block.media!.caption,
          });
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMedia(null);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [block.media, mediaKey]);

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

  if (!hasText && !media) {
    return (
      <p className="text-sm text-muted-foreground">
        {status === "loading"
          ? "Chargement du média…"
          : status === "missing"
            ? "Média sélectionné introuvable."
            : status === "error"
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
echo "  + float-text/FloatTextPreview.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  Substitutions dans les fichiers existants
# ─────────────────────────────────────────────────────────────────────────

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

CONTRACT = "packages/contracts/src/page/blocks.v1.ts"
REGISTRY = "apps/web/src/features/page-builder/blockRegistry.ts"
GLOBALS  = "apps/web/src/app/globals.css"
LAB      = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/8 contrat : le schéma du bloc float ─────────────────────────────────
# Réutilise mediaTextItemSchema (même modèle de média) et le preprocess.
edit(CONTRACT, """export type MediaTextBlockV1 = z.infer<typeof mediaTextBlockSchema>;""",
"""export type MediaTextBlockV1 = z.infer<typeof mediaTextBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc float-text (texte enrobant une image)                                */
/* -------------------------------------------------------------------------- */

/**
 * Une image `float`-ée dans une coulée de texte qui l'enrobe. À distinguer du
 * média-texte : pas de deux colonnes, pas d'alternance de largeurs. Le `side`
 * est une DONNÉE du bloc (on choisit où l'illustration se pose), pas une
 * décision de position — un enrobage n'alterne pas.
 *
 * Même modèle de média que le média-texte (bibliothèque OU avatar), réutilisé
 * via `mediaTextItemSchema` et son preprocess tolérant.
 */
const floatTextBlockSchema = blockBaseSchema.extend({
  type: z.literal("float-text"),
  content: proseMirrorContentSchema.optional(),
  side: z.enum(["left", "right"]).default("left"),
  media: z.preprocess((val) => {
    let v = val;
    if (Array.isArray(v)) v = v.length > 0 ? v[0] : undefined;
    if (
      v &&
      typeof v === "object" &&
      !("kind" in (v as Record<string, unknown>))
    ) {
      return { kind: "library", ...(v as Record<string, unknown>) };
    }
    return v;
  }, mediaTextItemSchema.optional()),
});

export type FloatTextBlockV1 = z.infer<typeof floatTextBlockSchema>;""")

# ── 2/8 contrat : l'ajouter à l'union discriminée ─────────────────────────
edit(CONTRACT, """  mediaTextBlockSchema,
]);

export type PageBlockV1 = z.infer<typeof pageBlockSchemaV1>;""",
"""  mediaTextBlockSchema,
  floatTextBlockSchema,
]);

export type PageBlockV1 = z.infer<typeof pageBlockSchemaV1>;""")

# ── 3/8 registre : import ─────────────────────────────────────────────────
edit(REGISTRY, """import { mediaTextDefinition } from "./blocks/media-text";""",
"""import { mediaTextDefinition } from "./blocks/media-text";
import { floatTextDefinition } from "./blocks/float-text";""")

# ── 4/8 registre : entrée du map ──────────────────────────────────────────
edit(REGISTRY, """  \"media-text\": mediaTextDefinition,
};""",
"""  \"media-text\": mediaTextDefinition,
  \"float-text\": floatTextDefinition,
};""")

# ── 5/8 registre : liste ordonnée du menu ─────────────────────────────────
edit(REGISTRY, """  mediaTextDefinition,
];""",
"""  mediaTextDefinition,
  floatTextDefinition,
];""")

# ── 6/8 globals : les styles du float ─────────────────────────────────────
edit(GLOBALS, """/* Filet horizontal, à poser entre deux blocs successifs. */""",
"""/* ── Bloc « texte enrobant une image » ────────────────────────────────────
   L'image est `float`-ée du côté `--akfc-float-side` ; le texte l'enrobe.
   Deux variables réglables : la largeur de l'image (`--akfc-float-width`) et
   la gouttière entre l'image et le texte (`--akfc-float-gap`). */
.akfc-float-scope {
  container-type: inline-size;
}

.akfc-float-figure {
  float: var(--akfc-float-side, left);
  width: var(--akfc-float-width);
  margin-block-end: var(--akfc-float-gap);
  /* `shape-outside` fait épouser au texte le contour de l'image (ici son
     rectangle arrondi) plutôt qu'un bloc rigide — l'enrobage est plus doux. */
  shape-outside: inset(0 round 0.375rem);
}

/* La gouttière va TOUJOURS du côté opposé au flottant : une image à gauche
   écarte le texte par sa marge droite, une image à droite par sa marge
   gauche. Le côté se lit sur la variable inline `--akfc-float-side`, portée
   par le conteneur `.akfc-float`, via le sélecteur d'attribut sur son `style`.
   Une seule règle par cas, aucune superposition. */
.akfc-float[style*="left"] .akfc-float-figure {
  margin-inline-end: var(--akfc-float-gap);
}
.akfc-float[style*="right"] .akfc-float-figure {
  margin-inline-start: var(--akfc-float-gap);
}

/* Referme le flottant : la coulée de texte reprend toute la largeur après. */
.akfc-float-clear {
  clear: both;
}

/* Repli mobile : sous 34rem, l'enrobage laisserait trop peu de place au
   texte. L'image passe pleine largeur au-dessus. */
@container (max-width: 34rem) {
  .akfc-float-figure {
    float: none;
    width: 100%;
    margin-inline: 0;
  }
}

/* Filet horizontal, à poser entre deux blocs successifs. */""")

# ── 7/8 globals : valeurs par défaut des variables float ──────────────────
edit(GLOBALS, """  --akfc-heading-gap: 1.8em;""",
"""  --akfc-heading-gap: 1.8em;

  /* Bloc float : largeur de l'image enrobée et gouttière autour. */
  --akfc-float-width: 38%;
  --akfc-float-gap: 1.5rem;""")

# ── 8/8 laboratoire : deux curseurs (DERNIER fichier écrit) ───────────────
edit(LAB, """  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5, anchor: "lab-colonnes" },""",
"""  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5, anchor: "lab-colonnes" },
  { key: "--akfc-float-width", label: "Largeur image enrobée", min: 20, max: 60, step: 1, unit: "%", initial: 38, anchor: "lab-float" },
  { key: "--akfc-float-gap", label: "Gouttière d'enrobage", min: 0, max: 4, step: 0.25, unit: "rem", initial: 1.5, anchor: "lab-float" },""")
PY

echo "✓ contrat, bloc, registre, styles et laboratoire posés"

# ── Ajout d'un échantillon float dans l'aperçu du laboratoire ─────────────
python3 - <<'PY'
import io
LAB = "apps/web/src/features/design-lab/BlockStyleLab.tsx"
with io.open(LAB, encoding='utf-8') as fh:
    src = fh.read()

# On insère une section float juste avant le bloc pleine largeur, avec son
# ancre `lab-float`. On repère la section pleine largeur.
anchor = '''        <section id="lab-pleine-largeur" className="akfc-rule-h">'''
assert src.count(anchor) == 1, "ancre lab-pleine-largeur absente ou multiple"

sample = '''        <section id="lab-float" className="akfc-rule-h">
          <div className="akfc-float-scope">
            <div className="akfc-float" style={{ "--akfc-float-side": "left" } as CSSProperties}>
              <figure className="akfc-float-figure m-0">
                <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  image
                </div>
              </figure>
              <div className="akfc-prose prose max-w-none">
                <p>
                  Texte enrobant une image flottante. Il commence à droite de
                  l&apos;image, l&apos;épouse sur toute sa hauteur, puis se
                  poursuit sous elle en reprenant toute la largeur. Réglez la
                  largeur de l&apos;image et la gouttière d&apos;enrobage pour
                  voir la coulée s&apos;ajuster.
                </p>
                <p>
                  Un deuxième paragraphe pour garantir que le texte dépasse la
                  hauteur de l&apos;image et redescende sous elle — c&apos;est
                  là qu&apos;on juge l&apos;enrobage.
                </p>
              </div>
              <div className="akfc-float-clear" />
            </div>
          </div>
        </section>

'''

src = src.replace(anchor, sample + anchor)
with io.open(LAB, 'w', encoding='utf-8') as fh:
    fh.write(src)
print("  ~ BlockStyleLab.tsx (échantillon float)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
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
distincts.

Reutilise le modele de media (bibliotheque ou avatar via
mediaTextItemSchema), le noeud image serveur, le rendu du texte riche.
De neuf : la disposition (float CSS + clear + shape-outside), deux
variables reglables (largeur image, gouttiere d'enrobage) et son repli
mobile (image pleine largeur sous 34rem)."

echo "✓ commité"
git log -1 --oneline