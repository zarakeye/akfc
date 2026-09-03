#!/usr/bin/env bash
#
# AKFC — Dépôt commun, A5 (front) : afficher l'expéditeur dans le finder.
#
# La date (« Créé le ») est déjà affichée. On ajoute « Déposé par » :
#   - MediaMeta (contract finder) : + uploaderName?: string
#   - adapter finder : mappe file.metadata.uploaderName → meta.uploaderName
#     (file.metadata = StorageMetadata, enrichi en A5-backend)
#   - PreviewPanel : passe file.meta.uploaderName au MetadataBlock, qui affiche
#     la ligne « Déposé par ».
#
# Front seul, typecheck web.
#
# Usage : bash apply-depot-commun-a5-front.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-a5-front.sh   (clone)
#
set -euo pipefail

META="packages/contracts/src/finder/meta.types.ts"
ADAPTER="apps/web/src/features/finder-adapters/cloudinary/finderStorage.adapter.ts"
PANEL="apps/web/src/features/finder-core/components/PreviewPanel.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$META" "$ADAPTER" "$PANEL"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. MediaMeta : + uploaderName ────────────────────────────────────────────
python3 - "$META" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "uploaderName" in s: print("— MediaMeta déjà patché"); sys.exit(0)
anchor = "  kind?: 'image' | 'video' | 'document';\n"
assert anchor in s, "ancre kind (MediaMeta) introuvable"
s = s.replace(
    anchor,
    anchor
    + "\n  /** Nom lisible de l'expéditeur (Dépôt commun) — depuis MediaAsset. */\n"
    + "  uploaderName?: string;\n",
)
p.write_text(s, encoding="utf-8"); print("✓ MediaMeta : uploaderName")
PY

# ── 2. adapter : mapper uploaderName ─────────────────────────────────────────
python3 - "$ADAPTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "uploaderName" in s: print("— adapter déjà patché"); sys.exit(0)
old = (
    "      kind: kindFromFormat(format, name),\n"
    "      status: file.metadata?.status,\n"
    "    },\n"
)
new = (
    "      kind: kindFromFormat(format, name),\n"
    "      status: file.metadata?.status,\n"
    "      uploaderName: file.metadata?.uploaderName,\n"
    "    },\n"
)
assert old in s, "ancre bloc meta (adapter) introuvable"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ adapter : uploaderName mappé")
PY

# ── 3. PreviewPanel : prop + ligne « Déposé par » ───────────────────────────
python3 - "$PANEL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "Déposé par" in s: print("— PreviewPanel déjà patché"); sys.exit(0)

# 3a. site d'appel : passer uploaderName (depuis file.meta)
call_old = (
    "        <MetadataBlock\n"
    "          metadata={metadata}\n"
    "          loading={metadataLoading}\n"
    "          error={metadataError}\n"
    "        />\n"
)
call_new = (
    "        <MetadataBlock\n"
    "          metadata={metadata}\n"
    "          loading={metadataLoading}\n"
    "          error={metadataError}\n"
    "          uploaderName={file.meta?.uploaderName}\n"
    "        />\n"
)
assert call_old in s, "ancre appel MetadataBlock introuvable"
s = s.replace(call_old, call_new)

# 3b. signature du composant : + uploaderName
sig_old = (
    "function MetadataBlock({\n"
    "  metadata,\n"
    "  loading,\n"
    "  error,\n"
    "}: {\n"
    "  metadata: FinderNodeMetadata | null;\n"
    "  loading: boolean;\n"
    "  error: string | null;\n"
    "}): JSX.Element | null {\n"
)
sig_new = (
    "function MetadataBlock({\n"
    "  metadata,\n"
    "  loading,\n"
    "  error,\n"
    "  uploaderName,\n"
    "}: {\n"
    "  metadata: FinderNodeMetadata | null;\n"
    "  loading: boolean;\n"
    "  error: string | null;\n"
    "  uploaderName?: string;\n"
    "}): JSX.Element | null {\n"
)
assert sig_old in s, "ancre signature MetadataBlock introuvable"
s = s.replace(sig_old, sig_new)

# 3c. le garde `metadata === null` empêche d'afficher uploaderName seul → on
#     l'assouplit : afficher si des rows OU un uploaderName. Puis ligne dédiée.
guard_old = "  if (rows.length === 0) return null;\n"
guard_new = "  if (rows.length === 0 && !uploaderName) return null;\n"
assert guard_old in s, "ancre garde rows.length === 0 introuvable"
s = s.replace(guard_old, guard_new)

# 3d. injecter la ligne « Déposé par » dans le tableau des rows (avant le rendu)
row_anchor = "  const updated = formatDate(metadata.updatedAt);\n  if (updated) rows.push({ label: 'Modifié le', value: updated });\n"
assert row_anchor in s, "ancre rows updated introuvable"
s = s.replace(
    row_anchor,
    row_anchor
    + "\n  if (uploaderName) rows.push({ label: 'Déposé par', value: uploaderName });\n",
)

p.write_text(s, encoding="utf-8"); print("✓ PreviewPanel : ligne « Déposé par »")
PY

# NB : le garde `if (error || metadata === null) return ...` en tête de
# MetadataBlock peut court-circuiter l'affichage quand getMetadata ne renvoie
# rien mais qu'on a un uploaderName. Vérif :
if grep -q 'if (error || metadata === null)' "$PANEL"; then
  echo "⚠️  MetadataBlock retourne tôt si metadata===null — si l'expéditeur ne"
  echo "    s'affiche pas sur un fichier sans getMetadata, on assouplira ce garde."
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|uploaderName" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): A5 front — ligne « Déposé par » dans le finder" \
  && echo "commit $(git rev-parse --short HEAD)"