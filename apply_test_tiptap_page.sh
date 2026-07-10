#!/bin/bash
# TEST 2 (diagnostic, temporaire) : StarterKit seul + les 6 SCSS de node +
# la classe .simple-editor. Compare au test 1 (sans styles). Si la selection
# casse ICI -> coupable = un SCSS de node. À SUPPRIMER apres.
# À lancer depuis la RACINE : bash apply_test_tiptap_2.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
mkdir -p apps/web/src/app/test-tiptap
echo "-> apps/web/src/app/test-tiptap/page.tsx"
cat > 'apps/web/src/app/test-tiptap/page.tsx' << 'FILE_EOF'
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type { JSX } from "react";

// TEST 2 : StarterKit seul (comme test 1) MAIS avec les SCSS de nodes
// importés. Si la sélection casse ici, le coupable est un de ces CSS.
import "@features/editor-tiptap/node/blockquote-node/blockquote-node.scss";
import "@features/editor-tiptap/node/code-block-node/code-block-node.scss";
import "@features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node.scss";
import "@features/editor-tiptap/node/list-node/list-node.scss";
import "@features/editor-tiptap/node/heading-node/heading-node.scss";
import "@features/editor-tiptap/node/paragraph-node/paragraph-node.scss";

/**
 * PAGE DE TEST 2 — StarterKit seul + SCSS de nodes.
 * Compare avec le test 1 (sans SCSS). Si la sélection est bloquée ICI mais
 * marchait au test 1 → le coupable est un de ces fichiers SCSS.
 */
export default function TestTiptapPage(): JSX.Element {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content:
      "<p>Test 2 : avec les SCSS de nodes. Essaie de sélectionner ce texte à la souris.</p>",
  });

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Test Tiptap 2 — avec SCSS
      </h1>
      <div
        className="simple-editor"
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: 12,
          minHeight: 150,
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <p style={{ marginTop: 16, color: "#666" }}>
        Si tu ne peux PLUS sélectionner ici (alors que le test 1 marchait), le
        coupable est un des fichiers SCSS de node.
      </p>
    </div>
  );
}
FILE_EOF
echo "OK. Recharge http://localhost:3000/test-tiptap et re-teste la selection."