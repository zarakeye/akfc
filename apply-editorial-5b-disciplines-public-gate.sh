#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R5b : brouillons de disciplines cachés au public.
#
# `discipline.getAll` est utilisé PARTOUT côté admin (tables, sélecteurs,
# EventForm, galleries…) → on ne le filtre PAS. À la place :
#   - nouvelle query PUBLIQUE `getAllPublished` (publicationDate not null + <= now) ;
#   - OurActivitiesMenu (menu « Nos activités ») consomme getAllPublished ;
#   - accueil : le findMany des cartes disciplines gagne le filtre publié ;
#   - `/disciplines/[slug]` : notFound() si la discipline est en brouillon.
# (Pas de page /disciplines dédiée.) L'admin prévisualise via le dashboard.
#
# Prérequis : R5a (champ publicationDate + client régénéré). Front NON testé.
# Pas de migration.
# Usage : bash apply-editorial-5b-disciplines-public-gate.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-5b-disciplines-public-gate.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/disciplines/router.ts"
MENU="apps/web/src/features/app-shell/OurActivitiesMenu.tsx"
HOME="apps/web/src/app/(public)/page.tsx"
SLUG="apps/web/src/app/(public)/disciplines/[slug]/page.tsx"

for f in "package.json" "$ROUTER" "$MENU" "$HOME" "$SLUG"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── router : getAllPublished ────────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "getAllPublished" in s:
    print("router déjà à jour"); sys.exit(0)
old = (
    "  getAll: publicProcedure.query(async ({ ctx }) => {\n"
    "    return ctx.prisma.discipline.findMany({\n"
    "      orderBy: [{ categoryId: \"asc\" }, { name: \"asc\" }],\n"
    "    });\n"
    "  }),\n"
)
assert s.count(old) == 1, "ancre getAll introuvable"
new = old + (
    "\n"
    "  /**\n"
    "   * Disciplines PUBLIÉES uniquement (publicationDate non null et passée).\n"
    "   * Alimente les consommateurs publics (menu « Nos activités »). L'admin\n"
    "   * utilise `getAll` (toutes, brouillons compris).\n"
    "   */\n"
    "  getAllPublished: publicProcedure.query(async ({ ctx }) => {\n"
    "    return ctx.prisma.discipline.findMany({\n"
    "      where: { publicationDate: { not: null, lte: new Date() } },\n"
    "      orderBy: [{ categoryId: \"asc\" }, { name: \"asc\" }],\n"
    "    });\n"
    "  }),\n"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("router patché (getAllPublished)")
PY

# ── menu : consommer getAllPublished ────────────────────────────────────────
python3 - "$MENU" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "getAllPublished" in s:
    print("menu déjà à jour"); sys.exit(0)
old = "trpc.discipline.getAll.useQuery();"
assert s.count(old) == 1, "ancre getAll (menu) introuvable"
s = s.replace(old, "trpc.discipline.getAllPublished.useQuery();")
p.write_text(s, encoding="utf-8")
print("menu patché (getAllPublished)")
PY

# ── accueil : filtre publié sur les cartes disciplines ──────────────────────
python3 - "$HOME" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = (
    "  const disciplineRows = await prisma.discipline.findMany({\n"
    "    orderBy: { name: \"asc\" },\n"
)
if "publicationDate: { not: null" in s and "disciplineRows" in s and old not in s:
    print("accueil déjà à jour"); sys.exit(0)
assert s.count(old) == 1, "ancre findMany disciplines (accueil) introuvable"
new = (
    "  const disciplineRows = await prisma.discipline.findMany({\n"
    "    where: { publicationDate: { not: null, lte: new Date() } },\n"
    "    orderBy: { name: \"asc\" },\n"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("accueil patché (cartes disciplines publiées)")
PY

# ── [slug] : notFound si brouillon ──────────────────────────────────────────
python3 - "$SLUG" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "discipline.publicationDate" in s:
    print("[slug] déjà à jour"); sys.exit(0)
old = "  if (!discipline) notFound();\n"
assert s.count(old) == 1, "ancre notFound ([slug]) introuvable"
new = (
    "  if (!discipline) notFound();\n"
    "  // Brouillon (ou publication programmée future) : invisible du public.\n"
    "  if (!discipline.publicationDate || discipline.publicationDate > new Date()) {\n"
    "    notFound();\n"
    "  }\n"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("[slug] patché (notFound si brouillon)")
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
if git commit -m "feat(disciplines): brouillons cachés du public (getAllPublished + filtres accueil/[slug])" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "✅ R5 complet. Une discipline en brouillon disparaît du menu, de l'accueil et de sa page publique ; l'admin la voit dans le dashboard."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi