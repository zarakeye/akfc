#!/bin/bash
# Fix « selection souris invisible » dans l editeur Tiptap. Cause : les
# variables --tt-* (dont --tt-selection-color) sont definies dans
# styles/_variables.scss mais ce fichier n etait IMPORTE NULLE PART -> au
# runtime `::selection { background-color: var(--tt-selection-color) }` n a
# pas de valeur -> surlignage transparent. Le texte ETAIT selectionnable
# (copier-coller ok) mais invisible. Fix : (1) importer _variables.scss
# globalement dans le layout (charge les 41 variables --tt-*) ; (2) fallback
# de securite sur les 3 var(--tt-selection-color) du paragraph-node.
# Supprime aussi la page de test /test-tiptap.
# À lancer depuis la RACINE : bash fix_tiptap_selection_visible.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

# Nettoyage de la page de test diagnostic
rm -rf apps/web/src/app/test-tiptap

echo "-> apps/web/src/app/layout.tsx"
cat > 'apps/web/src/app/layout.tsx' << 'FILE_EOF'
import { JSX } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
// Variables --tt-* de l'éditeur Tiptap (couleur de sélection, curseur,
// checklists, code blocks…). Définies sur :root mais n'étaient importées
// nulle part → la sélection de texte apparaissait invisible (background
// transparent). Chargées ici globalement.
import "@/styles/_variables.scss";
import { AppProviders } from "@app/providers"
import { SessionLoader } from "@features/auth/SessionLoader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AKFC",
  description: "Association de Kung Fu de Chambéry",
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Layout racine — minimal et NEUTRE en matière de hauteur/scroll.
 *
 * Il ne contraint PAS la hauteur du document : c'est à chaque famille de
 * routes (admin shell vs site public) de décider de son comportement de
 * scroll, via son propre layout. Mettre `overflow-hidden` / `h-dvh` ici
 * piégeait la home publique (page longue) dans la hauteur de l'écran et
 * masquait tout ce qui dépassait.
 */
export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <SessionLoader>{children}</SessionLoader>
        </AppProviders>
      </body>
    </html>
  )
}
FILE_EOF

echo "-> apps/web/src/features/editor-tiptap/node/paragraph-node/paragraph-node.scss"
cat > 'apps/web/src/features/editor-tiptap/node/paragraph-node/paragraph-node.scss' << 'FILE_EOF'
.tiptap.ProseMirror {
  --tt-collaboration-carets-label: var(--tt-gray-light-900);
  --link-text-color: var(--tt-brand-color-500);
  --thread-text: var(--tt-gray-light-900);
  --placeholder-color: var(--tt-gray-light-a-400);
  --thread-bg-color: var(--tt-color-yellow-inc-2);

  // ai
  --tiptap-ai-insertion-color: var(--tt-brand-color-600);

  .dark & {
    --tt-collaboration-carets-label: var(--tt-gray-dark-100);
    --link-text-color: var(--tt-brand-color-400);
    --thread-text: var(--tt-gray-dark-900);
    --placeholder-color: var(--tt-gray-dark-a-400);
    --thread-bg-color: var(--tt-color-yellow-dec-2);

    --tiptap-ai-insertion-color: var(--tt-brand-color-400);
  }
}

/* Ensure each top-level node has relative positioning 
   so absolutely positioned placeholders work correctly */
.tiptap.ProseMirror > * {
  position: relative;
}

/* =====================
     CORE EDITOR STYLES
     ===================== */
.tiptap.ProseMirror {
  white-space: pre-wrap;
  outline: none;
  caret-color: var(--tt-cursor-color);

  // Paragraph spacing
  p:not(:first-child):not(td p):not(th p) {
    font-size: 1rem;
    line-height: 1.6;
    font-weight: normal;
    margin-top: 20px;
  }

  // Selection styles
  &:not(.readonly):not(.ProseMirror-hideselection) {
    ::selection {
      background-color: var(--tt-selection-color, rgba(122, 82, 255, 0.25));
    }

    .selection::selection {
      background: transparent;
    }
  }

  .selection {
    display: inline;
    background-color: var(--tt-selection-color, rgba(122, 82, 255, 0.25));
  }

  // Selected node styles
  .ProseMirror-selectednode:not(img):not(pre):not(.react-renderer) {
    border-radius: var(--tt-radius-md);
    background-color: var(--tt-selection-color, rgba(122, 82, 255, 0.25));
  }

  .ProseMirror-hideselection {
    caret-color: transparent;
  }

  // Resize cursor
  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
}

/* =====================
     TEXT DECORATION
     ===================== */
.tiptap.ProseMirror {
  // Text decoration inheritance for spans
  a span {
    text-decoration: underline;
  }

  s span {
    text-decoration: line-through;
  }

  u span {
    text-decoration: underline;
  }

  .tiptap-ai-insertion {
    color: var(--tiptap-ai-insertion-color);
  }
}

/* =====================
     COLLABORATION
     ===================== */
.tiptap.ProseMirror {
  .collaboration-carets {
    &__caret {
      border-right: 1px solid transparent;
      border-left: 1px solid transparent;
      pointer-events: none;
      margin-left: -1px;
      margin-right: -1px;
      position: relative;
      word-break: normal;
    }

    &__label {
      color: var(--tt-collaboration-carets-label);
      border-radius: 0.25rem;
      border-bottom-left-radius: 0;
      font-size: 0.75rem;
      font-weight: 600;
      left: -1px;
      line-height: 1;
      padding: 0.125rem 0.375rem;
      position: absolute;
      top: -1.3em;
      user-select: none;
      white-space: nowrap;
    }
  }
}

/* =====================
     EMOJI
     ===================== */
.tiptap.ProseMirror [data-type="emoji"] img {
  display: inline-block;
  width: 1.25em;
  height: 1.25em;
  cursor: text;
}

/* =====================
     LINKS
     ===================== */
.tiptap.ProseMirror {
  a {
    color: var(--link-text-color);
    text-decoration: underline;
  }
}

/* =====================
     MENTION
     ===================== */
.tiptap.ProseMirror {
  [data-type="mention"] {
    display: inline-block;
    color: var(--tt-brand-color-500);
  }
}

/* =====================
     THREADS
     ===================== */
.tiptap.ProseMirror {
  // Base styles for inline threads
  .tiptap-thread.tiptap-thread--unresolved.tiptap-thread--inline {
    transition:
      color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;
    color: var(--thread-text);
    border-bottom: 2px dashed var(--tt-color-yellow-base);
    font-weight: 600;

    &.tiptap-thread--selected,
    &.tiptap-thread--hovered {
      background-color: var(--thread-bg-color);
      border-bottom-color: transparent;
    }
  }

  // Block thread styles with images
  .tiptap-thread.tiptap-thread--unresolved.tiptap-thread--block {
    &:has(img) {
      outline: 0.125rem solid var(--tt-color-yellow-base);
      border-radius: var(--tt-radius-xs, 0.25rem);
      overflow: hidden;
      width: fit-content;

      &.tiptap-thread--selected {
        outline-width: 0.25rem;
        outline-color: var(--tt-color-yellow-base);
      }

      &.tiptap-thread--hovered {
        outline-width: 0.25rem;
      }
    }

    // Block thread styles without images
    &:not(:has(img)) {
      border-radius: 0.25rem;
      border-bottom: 0.125rem dashed var(--tt-color-yellow-base);
      border-top: 0.125rem dashed var(--tt-color-yellow-base);
      // padding-bottom: 0.5rem;
      outline: 0.25rem solid transparent;

      &.tiptap-thread--hovered,
      &.tiptap-thread--selected {
        background-color: var(--tt-color-yellow-base);
        outline-color: var(--tt-color-yellow-base);
      }
    }
  }

  // Resolved thread styles
  .tiptap-thread.tiptap-thread--resolved.tiptap-thread--inline.tiptap-thread--selected {
    background-color: var(--tt-color-yellow-base);
    border-color: transparent;
    opacity: 0.5;
  }

  // React renderer specific styles
  .tiptap-thread.tiptap-thread--block:has(.react-renderer) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
}

/* =====================
     PLACEHOLDER
     ===================== */
.is-empty:not(.with-slash)[data-placeholder]:has(
    > .ProseMirror-trailingBreak:only-child
  )::before {
  content: attr(data-placeholder);
}

.is-empty.with-slash[data-placeholder]:has(
    > .ProseMirror-trailingBreak:only-child
  )::before {
  content: "Write, type '/' for commands…";
  font-style: italic;
}

.is-empty[data-placeholder]:has(
    > .ProseMirror-trailingBreak:only-child
  ):before {
  pointer-events: none;
  height: 0;
  position: absolute;
  width: 100%;
  text-align: inherit;
  left: 0;
  right: 0;
}

.is-empty[data-placeholder]:has(> .ProseMirror-trailingBreak):before {
  color: var(--placeholder-color);
}

/* =====================
     DROPCURSOR
     ===================== */
.prosemirror-dropcursor-block,
.prosemirror-dropcursor-inline {
  background: var(--tt-brand-color-400) !important;
  border-radius: 0.25rem;
  margin-left: -1px;
  margin-right: -1px;
  width: 100%;
  height: 0.188rem;
  cursor: grabbing;
}
FILE_EOF

echo
echo "Typecheck web..."
pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "fix(editor): selection Tiptap invisible (variables --tt-* non importees)"
echo "Commit effectue."