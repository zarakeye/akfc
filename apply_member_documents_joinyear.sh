#!/usr/bin/env bash
#
# AKFC — Documents membres : borne cloche = ANNÉE d'adhésion.
#
# La cloche (`unreadCountForMe`) ne signale que les documents publiés depuis le
# 1er JANVIER de l'année d'adhésion — pas la date exacte. Ainsi un membre qui
# adhère APRÈS la dernière AG est quand même invité à lire son compte rendu (même
# année). Les documents antérieurs restent listés sur la page (lecture
# volontaire). memberSince null → pas de borne, on notifie tout.
#
# Corrige la version « date exacte » (script précédent) OU la version placeholder
# (increment 2 seul) — s'applique dans les deux cas. `listForMe` inchangé.
#
# Nécessite l'increment 2 appliqué (router memberDocument présent).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-joinyear.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-joinyear.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/memberDocuments/router.ts"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC." >&2
  exit 1
fi
if [ ! -f "$SVC" ]; then
  echo "ERREUR: $SVC introuvable — applique d'abord l'increment 2 (router)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "getUTCFullYear" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

NEW = '''  unreadCountForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { memberSince: true },
    });
    // Borne = 1er janvier de l'ANNÉE d'adhésion (pas la date exacte) : un membre
    // qui adhère après la dernière AG doit quand même être invité à lire le
    // compte rendu de la même année. Les documents antérieurs restent listés
    // sur la page (lecture volontaire). memberSince null → pas de borne.
    const yearStart = me?.memberSince
      ? new Date(Date.UTC(me.memberSince.getUTCFullYear(), 0, 1))
      : null;
    return ctx.prisma.memberDocument.count({
      where: {
        ...visibleToUser(userId),
        // Non lu = aucun reçu daté pour ce membre.
        receipts: { none: { userId, readAt: { not: null } } },
        ...(yearStart ? { publishedAt: { gte: yearStart } } : {}),
      },
    });
  }),'''

# Version « date exacte » (script memberSince précédent).
EXACT = '''  unreadCountForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { memberSince: true },
    });
    return ctx.prisma.memberDocument.count({
      where: {
        ...visibleToUser(userId),
        // Non lu = aucun reçu daté pour ce membre.
        receipts: { none: { userId, readAt: { not: null } } },
        // La cloche ne signale que les documents publiés DEPUIS l'adhésion :
        // les plus anciens restent accessibles sur la page, mais leur lecture
        // est une démarche volontaire, pas une alerte. Sans date d'adhésion
        // (memberSince null), pas de borne — on notifie tout.
        ...(me?.memberSince ? { publishedAt: { gte: me.memberSince } } : {}),
      },
    });
  }),'''

# Version placeholder (increment 2 seul, borne non activée).
PLACEHOLDER = '''  unreadCountForMe: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    return ctx.prisma.memberDocument.count({
      where: {
        ...visibleToUser(userId),
        // Non lu = aucun reçu daté pour ce membre.
        receipts: { none: { userId, readAt: { not: null } } },
        // Raffinement possible (à décider) : ne notifier que le postérieur à
        // l'adhésion → ajouter `publishedAt: { gte: <memberSince> }`.
      },
    });
  }),'''

if s.count(EXACT) == 1:
    s = s.replace(EXACT, NEW)
    print("patch OK (depuis version date exacte)")
elif s.count(PLACEHOLDER) == 1:
    s = s.replace(PLACEHOLDER, NEW)
    print("patch OK (depuis version placeholder)")
else:
    raise SystemExit("ERREUR: aucune des deux versions attendues de unreadCountForMe trouvée — abandon")

p.write_text(s, encoding="utf-8")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): borne cloche = 1er janvier de l'année d'adhésion (pas la date exacte)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi