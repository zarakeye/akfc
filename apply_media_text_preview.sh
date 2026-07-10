#!/bin/bash
# Bloc media-text : (1) APERCU public sous chaque bloc dans le builder
# (MediaTextPreview, composant client qui resout les medias via trpc et
# reproduit la mise en page + l alternance reelle transmise par le
# PageBuilder). (2) Disposition medias : 1 media = pleine largeur ; plusieurs
# = grille remplissant la colonne ; goutiere nette (gap-6) entre colonnes.
# Socle : mediaSide ajoute a BlockEditorProps, calcule par PageBuilder,
# transmis via BlockShell.
# À lancer depuis la RACINE : bash apply_media_text_preview.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p apps/web/src/features/page-builder/blocks/media-text

echo "-> apps/web/src/features/page-builder/BlockDefinition.types.ts"
cat > 'apps/web/src/features/page-builder/BlockDefinition.types.ts' << 'FILE_EOF'
import type { ComponentType, ReactNode } from "react";
import type { PageBlockV1, ResolvedMedia } from "@contracts/page";

/**
 * Définition complète d'un type de bloc dans le builder de page.
 *
 * Trois rôles cohabitent dans cette interface unique :
 *
 *   1. **Métadonnées d'affichage** — `kind`, `label`, `icon` :
 *      consommés par le menu "+" du PageBuilder pour proposer
 *      l'ajout du bloc.
 *
 *   2. **Fabrique** — `defaultData(id)` : rend un bloc vide prêt à
 *      être ajouté au composite. L'`id` est fourni par le PageBuilder
 *      (cuid) au moment de la création — externalisé pour que le
 *      builder puisse cibler immédiatement le nouveau bloc (focus,
 *      scroll-into-view, drag handle).
 *
 *   3. **Composants** — `Editor` (client) pour l'édition, `View`
 *      (typiquement RSC) pour le rendu en lecture. La chrome
 *      transverse (drag handle, label de type, bouton supprimer)
 *      est dans le PageBuilder, pas dans chaque Editor.
 *
 * Le générique `TBlock` est instancié par chaque entrée du registry
 * pour une variante précise du discriminated union `PageBlockV1` —
 * c'est ce qui garantit le typage strict des props passées à Editor
 * et View, et qui rend `getBlockDefinition('tiptap').Editor` typé
 * pour les TipTapBlockV1 spécifiquement (pas l'union dégénérée).
 */
export interface BlockDefinition<TBlock extends PageBlockV1> {
  /**
   * Discriminant du bloc. Doit matcher exactement `TBlock['type']`,
   * c'est le typage qui force la cohérence.
   */
  kind: TBlock["type"];

  /** Libellé affiché dans le menu "+" du PageBuilder. */
  label: string;

  /**
   * Icône affichée dans le menu "+" et dans la chrome du bloc.
   *
   * `ReactNode` plutôt que `ComponentType` : on attend une instance
   * (`<Icon />`) plutôt qu'une référence (`Icon`), pour permettre des
   * compositions plus fines si besoin (icône avec badge, etc.).
   *
   * Doit être server-safe (pas de hooks) — peut être consommée par
   * le RSC du PageRenderer indirectement via le registry.
   */
  icon: ReactNode;

  /**
   * Fabrique un bloc vide. L'`id` est fourni par le PageBuilder, pas
   * par le bloc lui-même — typiquement `cuid()` côté frontend.
   */
  defaultData: (id: string) => TBlock;

  /**
   * Composant client d'édition. Reçoit le bloc courant et un callback
   * de mise à jour, ne gère QUE le contenu spécifique au bloc.
   *
   * Implémenté progressivement par type de bloc dans les sous-livraisons
   * suivantes du sous-chantier 5.
   */
  Editor: ComponentType<BlockEditorProps<TBlock>>;

  /**
   * Composant de rendu en lecture seule. Typiquement un Server Component
   * (file marqué `view.server.tsx`), qui résout les références médias
   * en URL via la couche storage avant émission HTML.
   *
   * Implémenté au sous-chantier 6 (le renderer public).
   */
  View: ComponentType<BlockViewProps<TBlock>>;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props des composants                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Props du composant `Editor` d'un bloc.
 *
 * Signature volontairement minimale : pas d'`onRemove`, pas d'`onMoveUp` —
 * ce sont des affaires de chrome, gérées par le PageBuilder en wrapper
 * autour de l'Editor. L'Editor ne sait que se rendre et notifier le
 * changement de son propre contenu.
 */
export interface BlockEditorProps<TBlock extends PageBlockV1> {
  block: TBlock;
  onChange: (next: TBlock) => void;
  /**
   * Côté d'affichage des médias dans la preview du builder, calculé par le
   * PageBuilder selon la position du bloc parmi les blocs `media-text`
   * (même alternance que le rendu public). Optionnel — seul le bloc
   * media-text l'exploite pour sa preview.
   */
  mediaSide?: "left" | "right";
}

/**
 * Props du composant `View` d'un bloc.
 *
 * Le bloc lui-même + un **lookup synchrone** des mediaIds vers leurs
 * informations résolues. Le `PageRenderer` (RSC) extrait tous les
 * mediaIds de la page en amont, fait une résolution batch en une
 * requête, et passe `resolveMedia` à chaque View — qui peut alors
 * accéder aux URLs / mimeType / dimensions sans aucun appel asynchrone.
 *
 * `resolveMedia(mediaId)` rend `null` si l'asset n'existe pas ou n'est
 * pas en `published` (cf. la sémantique du service `resolveMediaByIds`).
 * À la View de présenter un placeholder dans ce cas, sans casser.
 */
export interface BlockViewProps<TBlock extends PageBlockV1> {
  block: TBlock;
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
  /**
   * Côté d'affichage des médias, calculé par le PageRenderer selon la
   * POSITION du bloc parmi les blocs `media-text` (alternance automatique :
   * 1er → "left", 2e → "right", etc.). Optionnel — seul le bloc media-text
   * l'exploite ; les autres blocs l'ignorent. Absent = pas d'alternance
   * pertinente pour ce bloc.
   */
  mediaSide?: "left" | "right";
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/PageBuilder.tsx"
cat > 'apps/web/src/features/page-builder/PageBuilder.tsx' << 'FILE_EOF'
"use client";

import { useState } from "react";
import type { FileAdapter } from "@contracts/finder";
import type {
  PageContentV1,
  PageBlockV1,
  PageBlockKindV1,
} from "@contracts/page";

import { getBlockDefinition } from "./blockRegistry";
import { PageBuilderProvider } from "./PageBuilderContext";
import { BlockShell } from "./components/BlockShell";
import { AddBlockMenu } from "./components/AddBlockMenu";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface PageBuilderProps {
  /** Contenu courant (contrôlé par l'host — typiquement le form du Course). */
  value: PageContentV1;
  /** Émis à chaque mutation (ajout, édition, suppression, réordonnancement). */
  onChange: (next: PageContentV1) => void;
  /** Adapter du finder pour le MediaPicker (Cloudinary pour AKFC). */
  adapter: FileAdapter;
  /** Racine de l'arborescence média (valeur d'`APP_ROOT`). */
  appRoot: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Le composant d'assemblage du builder de page.
 *
 * **Contrôlé** : l'host détient le `value` (typiquement dans le state du
 * formulaire d'édition d'un Course) et reçoit chaque mutation via
 * `onChange`. Le PageBuilder ne garde en interne que l'état d'UI du
 * drag-and-drop.
 *
 * Pas de `useReducer` : en mode contrôlé, chaque handler dérive le
 * prochain `PageContentV1` à partir du `value` courant et le pousse via
 * `onChange`. La logique reste lisible sans la cérémonie d'un reducer.
 *
 * Le `key={block.id}` sur chaque `BlockShell` est essentiel : c'est ce
 * qui permet à React de réconcilier les blocs par identité stable à
 * travers les réordonnancements (et c'est l'une des raisons pour
 * lesquelles chaque bloc porte un `id` dans le contrat).
 *
 * ─── Note perf (v1) ─────────────────────────────────────────────────────
 *
 * Chaque frappe dans un bloc tiptap déclenche `onChange` → nouveau
 * `value` → re-render de tous les `BlockShell`. Acceptable pour une
 * poignée de blocs. Si une page devient très lourde, on mémoïsera
 * `BlockShell` (React.memo + handlers stables) — pas nécessaire pour
 * l'instant.
 */
export function PageBuilder({
  value,
  onChange,
  adapter,
  appRoot,
}: PageBuilderProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* ── Handlers de mutation (dérivent le prochain content) ── */

  const handleAdd = (kind: PageBlockKindV1) => {
    const def = getBlockDefinition(kind);
    const newBlock = def.defaultData(generateBlockId());
    onChange({ ...value, blocks: [...value.blocks, newBlock] });
  };

  const handleUpdate = (id: string, next: PageBlockV1) => {
    onChange({
      ...value,
      blocks: value.blocks.map((b) => (b.id === id ? next : b)),
    });
  };

  const handleRemove = (id: string) => {
    onChange({
      ...value,
      blocks: value.blocks.filter((b) => b.id !== id),
    });
  };

  const handleMove = (from: number, to: number) => {
    if (from === to) return;
    const blocks = [...value.blocks];
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    onChange({ ...value, blocks });
  };

  /* ── Rendu ── */

  return (
    <PageBuilderProvider value={{ adapter, appRoot }}>
      <div className="flex flex-col gap-3">
        {value.blocks.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Cette page est vide. Ajoute un premier bloc pour commencer.
          </p>
        )}

        {(() => {
          // Alternance media-text (même logique que le PageRenderer public) :
          // le compteur n'avance que sur les blocs media-text, pour que la
          // preview du builder reflète fidèlement le côté public.
          let mediaTextRank = 0;
          return value.blocks.map((block, index) => {
            let mediaSide: "left" | "right" | undefined;
            if (block.type === "media-text") {
              mediaSide = mediaTextRank % 2 === 0 ? "left" : "right";
              mediaTextRank += 1;
            }
            return (
              <BlockShell
                key={block.id}
                block={block}
                mediaSide={mediaSide}
                onUpdate={(next) => handleUpdate(block.id, next)}
                onRemove={() => handleRemove(block.id)}
                isDragging={draggingIndex === index}
                isDragOver={dragOverIndex === index && draggingIndex !== index}
                onDragStart={() => setDraggingIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={() => {
                  if (draggingIndex !== null) {
                    handleMove(draggingIndex, index);
                  }
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
              />
            );
          });
        })()}

        <AddBlockMenu onAdd={handleAdd} />
      </div>
    </PageBuilderProvider>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Génère un identifiant unique de bloc côté client. Le block id vit dans
 * le JSON du composite (pas une clé primaire DB), donc l'unicité suffit —
 * pas besoin d'un cuid spécifiquement. `crypto.randomUUID()` est dispo en
 * contexte sécurisé (localhost + https) ; fallback défensif sinon.
 */
function generateBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/components/BlockShell.tsx"
cat > 'apps/web/src/features/page-builder/components/BlockShell.tsx' << 'FILE_EOF'
"use client";

import { useRef, type ComponentType } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { PageBlockV1 } from "@contracts/page";

import { getBlockDefinition } from "../blockRegistry";
import type { BlockEditorProps } from "../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface BlockShellProps {
  block: PageBlockV1;
  onUpdate: (next: PageBlockV1) => void;
  onRemove: () => void;

  /** Côté médias (alternance), transmis à l'Editor pour sa preview. */
  mediaSide?: "left" | "right";

  // État et callbacks de drag-and-drop, pilotés par le PageBuilder parent.
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Chrome transverse autour de l'Editor d'un bloc : barre d'en-tête avec
 * poignée de drag, icône + label de type, bouton supprimer ; puis le
 * corps qui rend l'Editor spécifique au bloc.
 *
 * ─── Le cast de variance ────────────────────────────────────────────────
 *
 * `getBlockDefinition(block.type)` retourne, quand `block.type` est l'union
 * `PageBlockKindV1`, une union de `BlockDefinition<variante>`. Son `.Editor`
 * est donc une union de `ComponentType<BlockEditorProps<variante>>`. Pour
 * le rendre avec `block: PageBlockV1`, on le cast en
 * `ComponentType<BlockEditorProps<PageBlockV1>>`.
 *
 * Ce cast est **sûr par construction** : `getBlockDefinition(block.type)`
 * retourne TOUJOURS la définition dont l'Editor accepte exactement ce
 * `block` — le discriminant `type` garantit la correspondance. TypeScript
 * ne peut pas le prouver à travers l'union (variance contravariante de
 * `TBlock` dans `onChange`), d'où le cast explicite et localisé ici.
 *
 * ─── Drag-and-drop natif ────────────────────────────────────────────────
 *
 * Seul l'en-tête est `draggable` — pas le corps — pour ne pas interférer
 * avec la sélection de texte dans les éditeurs. Au `dragStart`, on force
 * l'image de drag à être le bloc entier (`setDragImage` sur le ref du
 * conteneur) plutôt que juste l'en-tête, pour un retour visuel correct.
 */
export function BlockShell({
  block,
  onUpdate,
  onRemove,
  mediaSide,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BlockShellProps) {
  const def = getBlockDefinition(block.type);
  const Editor = def.Editor as unknown as ComponentType<
    BlockEditorProps<PageBlockV1>
  >;

  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={shellRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={clsx(
        "rounded-lg border bg-card transition-colors",
        isDragging && "opacity-50",
        isDragOver ? "border-primary" : "border-border",
      )}
    >
      {/* En-tête : seule zone draggable */}
      <div
        draggable
        onDragStart={(e) => {
          if (shellRef.current) {
            e.dataTransfer.setDragImage(shellRef.current, 0, 0);
          }
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        className="flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5"
      >
        <span className="cursor-grab text-muted-foreground" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {def.icon}
          {def.label}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Supprimer le bloc"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Corps : l'Editor spécifique au bloc */}
      <div className="p-3">
        <Editor block={block} onChange={onUpdate} mediaSide={mediaSide} />
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/view.server.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/view.server.tsx' << 'FILE_EOF'
import { Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";

import type { MediaTextBlockV1, ResolvedMedia } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Nœud image server-only (identique à la View tiptap)                     */
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
 * Rendu public d'un bloc `media-text`.
 *
 * Mise en page éditoriale : médias d'un côté, texte de l'autre, avec
 * ALTERNANCE automatique du côté des médias d'un bloc media-text au suivant
 * (`mediaSide`, calculé par le PageRenderer selon la position). Si une seule
 * des deux parties est présente, le bloc s'affiche centré, pleine largeur.
 *
 * Server Component pur (sync, pas de hook). Les vidéos sont rendues avec un
 * `<video controls>` + poster ; les images en grille.
 */
export function MediaTextView({
  block,
  resolveMedia,
  mediaSide = "left",
}: BlockViewProps<MediaTextBlockV1>) {
  // Médias résolus (on saute silencieusement ceux qui ne résolvent pas).
  const media = block.media.flatMap((item) => {
    const resolved = resolveMedia(item.mediaId);
    return resolved ? [{ item, resolved }] : [];
  });

  // Texte : présent uniquement si content non vide.
  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;

  const hasMedia = media.length > 0;

  // Bloc vide (ni texte ni média résolu) → rien.
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

  const MediaColumn = hasMedia ? (
    media.length === 1 ? (
      // Un seul média : pleine largeur de la colonne.
      <MediaFigure media={media[0].resolved} caption={media[0].item.caption} />
    ) : (
      // Plusieurs médias : grille qui remplit la colonne.
      <div className="grid grid-cols-2 gap-3">
        {media.map(({ item, resolved }) => (
          <MediaFigure
            key={item.mediaId}
            media={resolved}
            caption={item.caption}
          />
        ))}
      </div>
    )
  ) : null;

  const TextColumn = textHtml ? (
    <div
      className="tiptap-rendered prose max-w-none"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré, pleine largeur (impression de respiration).
  if (!hasText || !hasMedia) {
    return (
      <div className="mx-auto max-w-3xl">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance.
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  MediaFigure — image ou vidéo selon le kind résolu                       */
/* ─────────────────────────────────────────────────────────────────────── */

function MediaFigure({
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
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx' << 'FILE_EOF'
"use client";

import { useCallback } from "react";
import type { MediaTextBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { BuilderTipTapEditor } from "../tiptap/builder-tiptap-editor";
import { MediaTextPreview } from "./MediaTextPreview";

/**
 * Editor du bloc `media-text`.
 *
 * Deux sections empilées dans l'éditeur (la mise en page côte à côte /
 * alternée est une affaire de rendu public, pas d'édition) :
 *
 *   1. Le picker de médias (MediaListEditor partagé) — plusieurs images
 *      et/ou une vidéo, avec légende optionnelle par média.
 *   2. L'éditeur de texte riche (BuilderTipTapEditor, même instance que le
 *      bloc tiptap).
 *
 * Les deux parties sont optionnelles : l'admin peut ne renseigner que l'une
 * ou l'autre — le rendu public centrera alors le contenu présent.
 */
export function MediaTextEditor({
  block,
  onChange,
  mediaSide,
}: BlockEditorProps<MediaTextBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Médias */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Médias (images et/ou vidéo)
        </span>
        <MediaListEditor
          items={block.media}
          onChange={(media) => onChange({ ...block, media })}
          itemFactory={(mediaId) => ({ mediaId })}
          getItemText={(item) => item.caption}
          setItemText={(item, value) => ({
            ...item,
            caption: value ?? undefined,
          })}
          textPlaceholder="Légende (optionnelle)"
          addLabel="Ajouter des médias"
          emptyStateLabel="Aucun média — le bloc affichera seulement le texte."
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
      </div>

      {/* Texte */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Texte (optionnel)
        </span>
        <BuilderTipTapEditor
          content={block.content ?? {}}
          onChange={handleContentChange}
        />
      </div>

      {/* Aperçu du rendu public (mise en page réelle, alternance incluse) */}
      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <MediaTextPreview block={block} mediaSide={mediaSide} />
        </div>
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useState, type JSX } from "react";
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
import type { MediaTextBlockV1 } from "@contracts/page";

/**
 * Preview CLIENT du bloc media-text, affichée sous l'éditeur dans le builder.
 *
 * Reproduit fidèlement le rendu public (MediaTextView, qui est un Server
 * Component non montable ici) : résolution des médias via trpcClient,
 * alternance gauche/droite selon `mediaSide` (fourni par le PageBuilder), et
 * mêmes règles de disposition (1 média = pleine largeur ; plusieurs = grille ;
 * une seule partie = centré, gouttière nette entre colonnes).
 *
 * Le rendu du texte réutilise generateHTML avec les mêmes extensions que la
 * vue publique (sans le nœud library-image, dont la résolution serveur n'est
 * pas disponible ici — les images insérées dans le texte n'apparaissent donc
 * pas dans la preview, ce qui est acceptable pour un aperçu).
 */

interface ResolvedPreviewMedia {
  mediaId: string;
  url: string;
  kind: string;
  posterUrl: string | null;
  caption?: string;
}

export function MediaTextPreview({
  block,
  mediaSide = "left",
}: {
  block: MediaTextBlockV1;
  mediaSide?: "left" | "right";
}): JSX.Element | null {
  const [media, setMedia] = useState<ResolvedPreviewMedia[]>([]);

  const mediaKey = block.media.map((m) => m.mediaId).join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = block.media.map((m) => m.mediaId);
    if (ids.length === 0) {
      setMedia([]);
      return;
    }
    void trpcClient.media.resolveByIds
      .query({ mediaIds: ids })
      .then((resolved) => {
        if (cancelled) return;
        const out: ResolvedPreviewMedia[] = [];
        for (const item of block.media) {
          const r = resolved[item.mediaId];
          if (r) {
            out.push({
              mediaId: item.mediaId,
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: item.caption,
            });
          }
        }
        setMedia(out);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey]);

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;
  const hasMedia = media.length > 0;

  if (!hasText && !hasMedia) {
    return (
      <p className="text-xs italic text-muted-foreground">
        Aperçu : bloc vide (ajoute du texte et/ou des médias).
      </p>
    );
  }

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

  const MediaColumn = hasMedia ? (
    media.length === 1 ? (
      <PreviewFigure media={media[0]} />
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {media.map((m) => (
          <PreviewFigure key={m.mediaId} media={m} />
        ))}
      </div>
    )
  ) : null;

  const TextColumn = textHtml ? (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré, pleine largeur.
  if (!hasText || !hasMedia) {
    return (
      <div className="mx-auto max-w-2xl">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance, gouttière nette.
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}
    </div>
  );
}

function PreviewFigure({
  media,
}: {
  media: ResolvedPreviewMedia;
}): JSX.Element {
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
          alt={media.caption ?? ""}
          className="block w-full rounded-md object-cover"
        />
      )}
      {media.caption && (
        <figcaption className="mt-1 text-xs text-muted-foreground">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
FILE_EOF

echo
echo "Typecheck web..."
pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "feat(media-text): apercu public dans le builder + medias pleine largeur"
echo "Commit effectue."