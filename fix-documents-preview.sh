#!/usr/bin/env bash
#
# AKFC — aperçu Documents : lire md / txt (+ textes) dans DocumentReaderPanel.
#
# Le panneau envoyait TOUT à PdfViewer (react-pdf) → un .md/.txt cassait.
# Fix : détecter le type (mimeType/format déjà remontés par listForMe, portés
# par `selected`) et brancher le bon viewer — PDF (inchangé), Markdown
# (react-markdown), Texte (pre). Formats bureautiques & inconnus → placeholder
# « aperçu non disponible » + bouton Télécharger (déjà présent).
# Réutilise le hook `useNodeTextContent` du finder (fetch().text(), cap 200KB).
#
# Prérequis : aucun (react-markdown déjà dépendance ; hook finder présent).
# Un seul fichier modifié. Front NON testé.
# Usage : bash fix-documents-preview.sh
#         AKFC_APPLY_ONLY=1 bash fix-documents-preview.sh   (clone)
#
set -euo pipefail

PANEL="apps/web/src/features/member-documents/DocumentReaderPanel.tsx"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$PANEL" ] || { echo "ERREUR: $PANEL introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$PANEL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "detectDocKind" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# 1) imports (après l'import PdfViewer)
s = sub(
    'import { PdfViewer } from "@features/member-documents/PdfViewer";\n',
    'import { PdfViewer } from "@features/member-documents/PdfViewer";\n'
    'import ReactMarkdown from "react-markdown";\n'
    'import { useNodeTextContent } from "@features/finder-core/hooks/useNodeTextContent";\n',
    "imports")

# 2) type ReaderDoc : + mimeType/format
s = sub(
    "type ReaderDoc = {\n"
    "  id: string;\n"
    "  title: string;\n"
    "  readAt: string | Date | null;\n"
    "};\n",
    "type ReaderDoc = {\n"
    "  id: string;\n"
    "  title: string;\n"
    "  readAt: string | Date | null;\n"
    "  mimeType?: string | null;\n"
    "  format?: string | null;\n"
    "};\n"
    "\n"
    "type DocKind = \"pdf\" | \"markdown\" | \"text\" | \"other\";\n"
    "\n"
    "/** Type d'aperçu depuis mimeType (fiable) puis format puis extension du titre. */\n"
    "function detectDocKind(doc: ReaderDoc): DocKind {\n"
    "  const mime = (doc.mimeType ?? \"\").toLowerCase();\n"
    "  const fmt = (doc.format ?? \"\").toLowerCase();\n"
    "  const name = (doc.title ?? \"\").toLowerCase();\n"
    "  const ext = name.includes(\".\") ? name.split(\".\").pop()! : \"\";\n"
    "  if (mime === \"application/pdf\" || fmt === \"pdf\" || ext === \"pdf\") return \"pdf\";\n"
    "  if (\n"
    "    mime === \"text/markdown\" ||\n"
    "    fmt === \"md\" || fmt === \"markdown\" ||\n"
    "    ext === \"md\" || ext === \"markdown\"\n"
    "  )\n"
    "    return \"markdown\";\n"
    "  if (\n"
    "    mime.startsWith(\"text/\") ||\n"
    "    [\"txt\", \"csv\", \"log\", \"json\"].includes(fmt) ||\n"
    "    [\"txt\", \"csv\", \"log\", \"json\"].includes(ext)\n"
    "  )\n"
    "    return \"text\";\n"
    "  return \"other\";\n"
    "}\n"
    "\n"
    "function MarkdownDocView({ src }: { src: string }) {\n"
    "  const { content, loading, error, truncated } = useNodeTextContent(src);\n"
    "  if (loading) return <div className=\"p-6 text-sm text-gray-500\">Chargement…</div>;\n"
    "  if (error) return <div className=\"p-6 text-sm text-red-600\">Impossible de lire ce fichier.</div>;\n"
    "  return (\n"
    "    <div className=\"h-full overflow-auto bg-white p-6\">\n"
    "      <div className=\"prose prose-sm max-w-none\">\n"
    "        <ReactMarkdown>{content ?? \"\"}</ReactMarkdown>\n"
    "      </div>\n"
    "      {truncated && (\n"
    "        <p className=\"mt-4 text-xs text-gray-400\">Aperçu tronqué — téléchargez le fichier pour la version complète.</p>\n"
    "      )}\n"
    "    </div>\n"
    "  );\n"
    "}\n"
    "\n"
    "function TextDocView({ src }: { src: string }) {\n"
    "  const { content, loading, error, truncated } = useNodeTextContent(src);\n"
    "  if (loading) return <div className=\"p-6 text-sm text-gray-500\">Chargement…</div>;\n"
    "  if (error) return <div className=\"p-6 text-sm text-red-600\">Impossible de lire ce fichier.</div>;\n"
    "  return (\n"
    "    <div className=\"h-full overflow-auto bg-gray-50 p-6\">\n"
    "      <pre className=\"whitespace-pre-wrap break-words font-mono text-sm text-gray-800\">{content ?? \"\"}</pre>\n"
    "      {truncated && (\n"
    "        <p className=\"mt-4 text-xs text-gray-400\">Aperçu tronqué — téléchargez le fichier pour la version complète.</p>\n"
    "      )}\n"
    "    </div>\n"
    "  );\n"
    "}\n"
    "\n"
    "function UnsupportedDocView() {\n"
    "  return (\n"
    "    <div className=\"flex h-full flex-col items-center justify-center gap-2 p-8 text-center\">\n"
    "      <p className=\"text-sm font-medium text-gray-700\">Aperçu non disponible pour ce format.</p>\n"
    "      <p className=\"text-xs text-gray-500\">Utilisez le bouton « Télécharger » pour ouvrir le fichier.</p>\n"
    "    </div>\n"
    "  );\n"
    "}\n",
    "type + viewers")

# 3) rendu : switch selon le type
s = sub(
    "        {/* Aperçu — viewer react-pdf (canvas). */}\n"
    "        <div className=\"min-h-0 flex-1 bg-gray-100\">\n"
    "          <PdfViewer src={src} />\n"
    "        </div>\n",
    "        {/* Aperçu selon le type de fichier. */}\n"
    "        <div className=\"min-h-0 flex-1 bg-gray-100\">\n"
    "          {(() => {\n"
    "            switch (detectDocKind(doc)) {\n"
    "              case \"pdf\":\n"
    "                return <PdfViewer src={src} />;\n"
    "              case \"markdown\":\n"
    "                return <MarkdownDocView src={src} />;\n"
    "              case \"text\":\n"
    "                return <TextDocView src={src} />;\n"
    "              default:\n"
    "                return <UnsupportedDocView />;\n"
    "            }\n"
    "          })()}\n"
    "        </div>\n",
    "render switch")

p.write_text(s, encoding="utf-8")
print("panneau patché (md/txt + fallback)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck web…"
pnpm --filter web typecheck > /tmp/tc.log 2>&1 || { echo "KO :"; grep -nE "error TS" /tmp/tc.log | head; tail -4 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(documents): aperçu markdown + texte (fallback téléchargement pour le reste)" && echo "commit $(git rev-parse --short HEAD)"