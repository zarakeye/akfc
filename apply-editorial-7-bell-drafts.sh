#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R7 : cloche admin agrège les brouillons.
#
#   - Backend : `pageVisibility.entityDraftCounts` (admin) → { disciplines,
#     events, stages } = count publicationDate null.
#   - NotificationBell : pour un ADMIN, ajoute au TOTAL (badge) les pages
#     éditoriales non publiées (front, via PAGE_REGISTRY + pageVisibility.all) +
#     les brouillons d'entités ; et une section « brouillons à publier » (liens)
#     dans le dropdown. Null-safety : counts! → variables locales (le total peut
#     devenir >0 via les brouillons pendant que counts charge).
#
# Prérequis : brique 1 (pageVisibility) + R1 (registre) + R5a (Discipline.publicationDate).
# Front NON testé. Pas de migration.
# Usage : bash apply-editorial-7-bell-drafts.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-7-bell-drafts.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/pageVisibility/router.ts"
BELL="apps/web/src/features/app-shell/NotificationBell.tsx"

for f in "package.json" "$ROUTER" "$BELL"; do
  [ -f "$f" ] || { echo "ERREUR: fichier manquant: $f (brique 1 appliquée ?)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── backend : entityDraftCounts ─────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "entityDraftCounts" in s:
    print("router déjà à jour"); sys.exit(0)
old = (
    "      return { count: input.keys.length };\n"
    "    }),\n"
    "});"
)
assert s.count(old) == 1, "ancre fin setAll introuvable"
new = (
    "      return { count: input.keys.length };\n"
    "    }),\n"
    "\n"
    "  /**\n"
    "   * Nombre d'entités en BROUILLON (publicationDate null) — disciplines,\n"
    "   * events, stages. Pour le compteur/tooltip de la cloche admin.\n"
    "   */\n"
    "  entityDraftCounts: protectedProcedure.query(async ({ ctx }) => {\n"
    "    await assertAdmin(ctx);\n"
    "    const [disciplines, events, stages] = await Promise.all([\n"
    "      ctx.prisma.discipline.count({ where: { publicationDate: null } }),\n"
    "      ctx.prisma.event.count({ where: { publicationDate: null } }),\n"
    "      ctx.prisma.stage.count({ where: { publicationDate: null } }),\n"
    "    ]);\n"
    "    return { disciplines, events, stages };\n"
    "  }),\n"
    "});"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("router patché (entityDraftCounts)")
PY

# ── NotificationBell ────────────────────────────────────────────────────────
python3 - "$BELL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "draftTotal" in s:
    print("cloche déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# import registre
s = sub(
    'import Link from "next/link";\n',
    'import Link from "next/link";\n'
    'import { PAGE_REGISTRY } from "@/config/pageRegistry";\n',
    "import PAGE_REGISTRY")

# isAdmin
s = sub(
    "  const canSee = (user?.role?.permissions.length ?? 0) > 0;\n",
    "  const canSee = (user?.role?.permissions.length ?? 0) > 0;\n"
    "  const isAdmin = user?.role?.name === \"ADMIN\";\n",
    "isAdmin")

# queries brouillons (après getPendingBreakdown)
s = sub(
    "  const { data: breakdown } = trpc.storage.getPendingBreakdown.useQuery(\n"
    "    undefined,\n"
    "    { enabled: canSee },\n"
    "  );\n",
    "  const { data: breakdown } = trpc.storage.getPendingBreakdown.useQuery(\n"
    "    undefined,\n"
    "    { enabled: canSee },\n"
    "  );\n"
    "  const { data: pageStates } = trpc.pageVisibility.all.useQuery(undefined, {\n"
    "    enabled: isAdmin,\n"
    "  });\n"
    "  const { data: entityDrafts } =\n"
    "    trpc.pageVisibility.entityDraftCounts.useQuery(undefined, {\n"
    "      enabled: isAdmin,\n"
    "    });\n",
    "draft queries")

# total : variables locales + brouillons
s = sub(
    "  const total = (counts?.pending ?? 0) + (counts?.bin ?? 0);\n",
    "  const pending = counts?.pending ?? 0;\n"
    "  const bin = counts?.bin ?? 0;\n"
    "  const persoPending = counts?.persoPending ?? 0;\n"
    "  const generalPending = counts?.generalPending ?? 0;\n"
    "\n"
    "  // Brouillons (admin) : pages éditoriales non publiées + entités en\n"
    "  // brouillon. S'ajoutent au badge et au dropdown.\n"
    "  const editorialDrafts = isAdmin\n"
    "    ? PAGE_REGISTRY.filter(\n"
    "        (pg) =>\n"
    "          !(pageStates ?? []).some((v) => v.key === pg.key && v.published),\n"
    "      )\n"
    "    : [];\n"
    "  const entityDraftTotal =\n"
    "    (entityDrafts?.disciplines ?? 0) +\n"
    "    (entityDrafts?.events ?? 0) +\n"
    "    (entityDrafts?.stages ?? 0);\n"
    "  const draftTotal = editorialDrafts.length + entityDraftTotal;\n"
    "\n"
    "  const total = pending + bin + draftTotal;\n",
    "total + drafts")

# null-safety : counts!.X → variables locales (aria-label + dropdown)
for a, b in [
    ("counts!.pending", "pending"),
    ("counts!.bin", "bin"),
    ("counts!.persoPending", "persoPending"),
    ("counts!.generalPending", "generalPending"),
]:
    s = s.replace(a, b)

# section « brouillons à publier » dans le dropdown (après le bloc corbeille)
s = sub(
    "            {bin > 0 && (\n"
    "              <p className={pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>\n"
    "                {bin} contenu{bin > 1 ? 's' : ''} dans la\n"
    "                corbeille\n"
    "              </p>\n"
    "            )}\n",
    "            {bin > 0 && (\n"
    "              <p className={pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>\n"
    "                {bin} contenu{bin > 1 ? 's' : ''} dans la\n"
    "                corbeille\n"
    "              </p>\n"
    "            )}\n"
    "            {draftTotal > 0 && (\n"
    "              <div\n"
    "                className={\n"
    "                  pending > 0 || bin > 0\n"
    "                    ? 'mt-1.5 border-t border-white/15 pt-1.5'\n"
    "                    : ''\n"
    "                }\n"
    "              >\n"
    "                <p className=\"mb-1 font-medium\">\n"
    "                  {draftTotal} brouillon{draftTotal > 1 ? 's' : ''} à publier :\n"
    "                </p>\n"
    "                <ul className=\"space-y-0.5\">\n"
    "                  {editorialDrafts.map((pg) => (\n"
    "                    <li key={pg.key}>\n"
    "                      <Link\n"
    "                        href={`/dashboard/site-pages/${pg.key}`}\n"
    "                        className=\"block rounded px-1 py-0.5 hover:bg-white/10 hover:underline\"\n"
    "                      >\n"
    "                        Page « {pg.label} »\n"
    "                      </Link>\n"
    "                    </li>\n"
    "                  ))}\n"
    "                  {(entityDrafts?.disciplines ?? 0) > 0 && (\n"
    "                    <li>\n"
    "                      <Link\n"
    "                        href=\"/dashboard/disciplines\"\n"
    "                        className=\"block rounded px-1 py-0.5 hover:bg-white/10 hover:underline\"\n"
    "                      >\n"
    "                        {entityDrafts!.disciplines} discipline\n"
    "                        {entityDrafts!.disciplines > 1 ? 's' : ''}\n"
    "                      </Link>\n"
    "                    </li>\n"
    "                  )}\n"
    "                  {(entityDrafts?.events ?? 0) > 0 && (\n"
    "                    <li>\n"
    "                      <Link\n"
    "                        href=\"/dashboard/events\"\n"
    "                        className=\"block rounded px-1 py-0.5 hover:bg-white/10 hover:underline\"\n"
    "                      >\n"
    "                        {entityDrafts!.events} événement\n"
    "                        {entityDrafts!.events > 1 ? 's' : ''}\n"
    "                      </Link>\n"
    "                    </li>\n"
    "                  )}\n"
    "                  {(entityDrafts?.stages ?? 0) > 0 && (\n"
    "                    <li>\n"
    "                      <Link\n"
    "                        href=\"/dashboard/stages\"\n"
    "                        className=\"block rounded px-1 py-0.5 hover:bg-white/10 hover:underline\"\n"
    "                      >\n"
    "                        {entityDrafts!.stages} stage\n"
    "                        {entityDrafts!.stages > 1 ? 's' : ''}\n"
    "                      </Link>\n"
    "                    </li>\n"
    "                  )}\n"
    "                </ul>\n"
    "              </div>\n"
    "            )}\n",
    "section brouillons")

p.write_text(s, encoding="utf-8")
print("cloche patchée (agrégation brouillons + dropdown)")
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
if git commit -m "feat(notif): cloche admin agrège tous les brouillons (pages + entités) + tooltip liens" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "✅ R7 OK — chantier « Pages éditoriales » complet. La cloche admin compte pending+corbeille+brouillons ; le dropdown liste les brouillons à publier avec liens."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi