#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R4 : brouillon/publier dans SitePageEditor.
#
# L'association (/about) et Contacts (/contacts) passent tous deux par
# `SitePageEditor` (builder générique par slug). On y ajoute :
#   - lecture de l'état via pageVisibility.all (badge Publiée/Brouillon) ;
#   - remplacement du bouton unique « Enregistrer » par « Enregistrer en
#     brouillon » et « Publier » — chacun sauve (sitePage.save) puis fixe
#     pageVisibility.setPublished({ key: slug, published }).
#
# Prérequis : brique 1 (pageVisibility). Front NON testé → valider. Pas de migration.
# Usage : bash apply-editorial-4-sitepage-publish.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-4-sitepage-publish.sh   (clone)
#
set -euo pipefail

SPE="apps/web/src/features/admin/site-pages/SitePageEditor.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SPE" ]; then
  echo "ERREUR: lance depuis la racine ($SPE attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$SPE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "setPublished" in s:
    print("SitePageEditor déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# A) query pageVisibility + mutation setPublished (après la mutation save)
s = sub(
    "  const save = trpc.sitePage.save.useMutation({\n"
    "    onSuccess: () => {\n"
    "      void utils.sitePage.get.invalidate({ slug });\n"
    "    },\n"
    "  });\n",
    "  const save = trpc.sitePage.save.useMutation({\n"
    "    onSuccess: () => {\n"
    "      void utils.sitePage.get.invalidate({ slug });\n"
    "    },\n"
    "  });\n"
    "  const visibility = trpc.pageVisibility.all.useQuery();\n"
    "  const setPublished = trpc.pageVisibility.setPublished.useMutation();\n",
    "query+mutation pageVisibility")

# B) published + persist (après dirty)
s = sub(
    "  const dirty = JSON.stringify({ title, content }) !== baseline;\n",
    "  const dirty = JSON.stringify({ title, content }) !== baseline;\n"
    "\n"
    "  const published =\n"
    "    (visibility.data ?? []).find((v) => v.key === slug)?.published ?? false;\n"
    "\n"
    "  // Sauvegarde du contenu puis positionnement de l'état publié (brouillon\n"
    "  // ou publié). L'instantané n'est posé qu'au succès.\n"
    "  async function persist(publish: boolean): Promise<void> {\n"
    "    const snapshot = JSON.stringify({ title, content });\n"
    "    await save.mutateAsync({ slug, title: title.trim(), content });\n"
    "    await setPublished.mutateAsync({ key: slug, published: publish });\n"
    "    setSavedSnapshot(snapshot);\n"
    "    await Promise.all([\n"
    "      utils.sitePage.get.invalidate({ slug }),\n"
    "      utils.pageVisibility.all.invalidate(),\n"
    "    ]);\n"
    "  }\n",
    "published+persist")

# C) remplacement du bouton unique par badge + 2 boutons
s = sub(
    "          <button\n"
    "            type=\"button\"\n"
    "            disabled={save.isPending || !dirty || title.trim() === \"\"}\n"
    "            onClick={() => {\n"
    "              // L'instantané est pris AVANT l'appel et posé seulement au\n"
    "              // succès : un enregistrement qui échoue ne doit pas faire\n"
    "              // croire que le contenu est à jour.\n"
    "              const snapshot = JSON.stringify({ title, content });\n"
    "              save.mutate(\n"
    "                { slug, title: title.trim(), content },\n"
    "                { onSuccess: () => setSavedSnapshot(snapshot) },\n"
    "              );\n"
    "            }}\n"
    "            className=\"shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50\"\n"
    "          >\n"
    "            {save.isPending ? \"Enregistrement…\" : \"Enregistrer\"}\n"
    "          </button>\n",
    "          <span\n"
    "            className={\n"
    "              \"shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold \" +\n"
    "              (published\n"
    "                ? \"bg-emerald-100 text-emerald-700\"\n"
    "                : \"bg-amber-100 text-amber-700\")\n"
    "            }\n"
    "          >\n"
    "            {published ? \"Publiée\" : \"Brouillon\"}\n"
    "          </span>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            disabled={save.isPending || setPublished.isPending || title.trim() === \"\"}\n"
    "            onClick={() => void persist(false)}\n"
    "            className=\"shrink-0 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50\"\n"
    "          >\n"
    "            Enregistrer en brouillon\n"
    "          </button>\n"
    "          <button\n"
    "            type=\"button\"\n"
    "            disabled={save.isPending || setPublished.isPending || title.trim() === \"\"}\n"
    "            onClick={() => void persist(true)}\n"
    "            className=\"shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50\"\n"
    "          >\n"
    "            {save.isPending || setPublished.isPending ? \"…\" : \"Publier\"}\n"
    "          </button>\n",
    "boutons brouillon/publier")

p.write_text(s, encoding="utf-8")
print("SitePageEditor patché (brouillon/publier)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(site-pages): brouillon/publier dans SitePageEditor (association + contacts)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  L'association (/about) et Contacts (/contacts) ont désormais brouillon/publier dans leur éditeur."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi