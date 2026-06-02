import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { LibraryImageNodeView } from "./library-image-node"

/* ───────────────────────────────────────────────────────────────────────── */
/*  Types injectables                                                        */
/* ───────────────────────────────────────────────────────────────────────── */

/**
 * Résout un `mediaId` vers une URL téléchargeable de l'image.
 *
 * Appelé par la NodeView à chaque affichage d'un nœud `library-image`.
 * Implémentation typique côté builder : un wrapper autour de la query
 * tRPC `media.resolveByIds` (à introduire au sous-chantier 4).
 *
 * Retourne `null` si l'asset est introuvable ou inaccessible — la
 * NodeView affichera alors un placeholder « média indisponible » plutôt
 * que de jeter.
 */
export type ResolveMediaUrlFn = (mediaId: string) => Promise<string | null>

/**
 * Ouvre le MediaPicker (scope: published, kind: image) et résout vers
 * le `mediaId` sélectionné.
 *
 * Retourne `null` si l'utilisateur annule. Appelé par :
 *   - le toolbar button qui insère un nouveau nœud
 *   - la NodeView, bouton « Remplacer » sur un nœud existant
 */
export type OpenImagePickerFn = () => Promise<string | null>

/**
 * Options à passer au `.configure(...)` de l'extension lors de son
 * intégration à un éditeur. Les deux fonctions sont injectées par le
 * consommateur (typiquement le composant `BuilderTipTapEditor`),
 * ce qui maintient l'extension découplée de toute couche réseau.
 */
export interface LibraryImageNodeOptions {
  resolveMediaUrl: ResolveMediaUrlFn
  openImagePicker: OpenImagePickerFn
  /**
   * Attributs HTML appliqués à l'élément racine en rendu.
   * Pratique pour appliquer des classes utilitaires (Tailwind, etc.).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Commandes exposées sur l'éditeur                                         */
/* ───────────────────────────────────────────────────────────────────────── */

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    libraryImage: {
      /**
       * Insère un nœud `library-image` avec les attributs fournis.
       *
       * Le `mediaId` doit pointer vers un MediaAsset présent en
       * `published` — la validation est faite côté backend au save de
       * la page (sous-chantier 4) ; ici on fait confiance à l'appelant.
       */
      insertLibraryImage: (attrs: {
        mediaId: string
        caption?: string | null
      }) => ReturnType
    }
  }
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Extension                                                                */
/* ───────────────────────────────────────────────────────────────────────── */

/**
 * Extension TipTap qui définit le nœud `library-image` : une référence
 * stable à un asset de la bibliothèque (par `mediaId`), affichée comme
 * une figure en bloc avec légende éditable.
 *
 * ─── Modèle ────────────────────────────────────────────────────────────
 *
 *   - name        : `library-image`
 *   - group       : `block` (occupe une place autonome dans le flux)
 *   - atom        : oui (pas de contenu enfant ; légende portée par attr)
 *   - selectable  : oui
 *   - draggable   : oui
 *
 *   Attributs :
 *     - `mediaId` : référence stable vers MediaAsset (jamais une URL)
 *     - `caption` : légende optionnelle (string | null)
 *
 * ─── Pourquoi un mediaId et pas une URL ────────────────────────────────
 *
 * Si l'asset est renommé ou déplacé à l'intérieur de `published`, sa
 * publicId / fullPath / URL changent — mais son cuid (MediaAsset.id)
 * reste stable. Stocker le mediaId protège donc le contenu des pages
 * contre les renames côté bibliothèque, et c'est la raison d'être
 * structurelle de cette extension comparée au `Image` standard.
 *
 * ─── Sérialisation HTML ────────────────────────────────────────────────
 *
 * `renderHTML` produit un placeholder
 * `<div data-type="library-image" data-media-id="…" data-caption="…">`
 * SANS URL — c'est volontaire. Le rendu public (côté View RSC, futur
 * sous-chantier 6) sera produit par `generateHTML` avec un sérialiseur
 * custom qui injecte les URLs depuis une map résolue côté serveur.
 * Aucun chemin de rendu ne doit aboutir à une URL en dur dans le nœud.
 *
 * Le `parseHTML` correspondant reconnaît ces div pour restaurer le nœud
 * lors d'un copier-coller ou d'une réhydratation de contenu sérialisé.
 */
export const LibraryImageNode = Node.create<LibraryImageNodeOptions>({
  name: "library-image",

  group: "block",

  atom: true,

  selectable: true,

  draggable: true,

  addOptions() {
    return {
      // No-op safety defaults — surchargés par .configure() côté éditeur.
      resolveMediaUrl: async () => null,
      openImagePicker: async () => null,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attributes) =>
          attributes.mediaId ? { "data-media-id": attributes.mediaId } : {},
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption"),
        renderHTML: (attributes) =>
          attributes.caption ? { "data-caption": attributes.caption } : {},
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="library-image"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "library-image",
      }),
    ]
  },

  addCommands() {
    return {
      insertLibraryImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              mediaId: attrs.mediaId,
              caption: attrs.caption ?? null,
            },
          }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(LibraryImageNodeView)
  },
})
