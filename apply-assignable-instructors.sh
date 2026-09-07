#!/usr/bin/env bash
#
# AKFC — Select instructeur : élargir le vivier d'affectation (fin de l'œuf-et-
# la-poule).
#
# `getInstructors` ne renvoie que les users DÉJÀ rattachés → invisible tant qu'on
# n'enseigne rien. On ajoute `user.getAssignableInstructors` : membres du groupe
# ADMIN (le staff) OU déjà-rattachés (aucun instructeur existant perdu). Le
# select d'affectation pointe dessus. `getInstructors`/`listPublicInstructors`
# (les « titulaires » réels de la page publique) restent INCHANGÉS.
#
# Périmètre : backend (users/router.ts) + front (InstructorSelect.tsx).
# Un aller-retour = un typecheck.
# Usage : bash apply-assignable-instructors.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
R="packages/backend/src/modules/users/router.ts"
S="apps/web/src/features/admin/common/components/InstructorSelect.tsx"
[ -f "$R" ] || { echo "ERREUR: $R introuvable." >&2; exit 1; }
[ -f "$S" ] || { echo "ERREUR: $S introuvable." >&2; exit 1; }
if grep -q 'getAssignableInstructors' "$R" 2>/dev/null; then echo "— déjà appliqué"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

R = "packages/backend/src/modules/users/router.ts"
S = "apps/web/src/features/admin/common/components/InstructorSelect.tsx"

# 1) backend : nouvelle procédure avant getInstructors
rs = pathlib.Path(R)
s = rs.read_text(encoding="utf-8")
anchor = "  getInstructors: protectedProcedure.query(async ({ ctx }) => {"
assert s.count(anchor) == 1, "ancre getInstructors introuvable/multiple"
proc = (
    "  /**\n"
    "   * Vivier d'AFFECTATION du select instructeur (≠ « titulaires » réels).\n"
    "   * Résout l'œuf-et-la-poule : membres du groupe ADMIN (le staff) OU déjà\n"
    "   * rattachés (pour ne perdre aucun instructeur existant, même non-admin).\n"
    "   * `getInstructors` / `listPublicInstructors` restent la vérité publique.\n"
    "   */\n"
    "  getAssignableInstructors: protectedProcedure.query(async ({ ctx }) => {\n"
    "    return ctx.prisma.user.findMany({\n"
    "      where: {\n"
    "        OR: [\n"
    "          { memberGroupMemberships: { some: { group: { isAdminGroup: true } } } },\n"
    "          { disciplinesAsInstructor: { some: {} } },\n"
    "          { coursesAsInstructor: { some: {} } },\n"
    "          { stagesAsPrimaryAnimator: { some: {} } },\n"
    "          { stagesAsAnimator: { some: {} } },\n"
    "        ],\n"
    "      },\n"
    "      select: {\n"
    "        id: true,\n"
    "        firstName: true,\n"
    "        lastName: true,\n"
    "        pseudo: true,\n"
    "        email: true,\n"
    "      },\n"
    "      orderBy: [{ lastName: \"asc\" }, { firstName: \"asc\" }],\n"
    "    });\n"
    "  }),\n\n"
)
s = s.replace(anchor, proc + anchor, 1)
rs.write_text(s, encoding="utf-8")
print(f"  ok  {R} (procédure getAssignableInstructors ajoutée)")

# 2) front : le select pointe sur la nouvelle procédure
ss = pathlib.Path(S)
t = ss.read_text(encoding="utf-8")
old = "trpc.user.getInstructors.useQuery()"
assert t.count(old) == 1, "ancre InstructorSelect introuvable/multiple"
t = t.replace(old, "trpc.user.getAssignableInstructors.useQuery()")
ss.write_text(t, encoding="utf-8")
print(f"  ok  {S} (select repointé)")
print("Appliqué.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "fix(admin): vivier d'affectation instructeur = admins + rattachés (fin de l'œuf-et-la-poule)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi