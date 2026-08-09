#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 6a/6 : backend de la mise à disposition.
#
#   - `publish` devient PATH-based : le finder fournit un chemin (pas un id) ;
#     résolution du MediaAsset côté serveur, tolérante à l'extension (comme
#     media.updateDescription) ;
#   - `listMembers` (admin) : liste des membres pour choisir les destinataires ;
#   - `publicationForPath` (admin) : indique si un fichier est déjà mis à
#     disposition (id + audience + nb destinataires), pour le menu du finder.
#
# Nécessite les increments 1+2 appliqués.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-publish-backend.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-publish-backend.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/memberDocuments/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance depuis la racine, increment 2 appliqué ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "listMembers" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── publish : input path + résolution par chemin ────────────────────────────
s2 = s.replace("        mediaAssetId: z.string(),\n",
               "        path: z.string(),\n", 1)
assert s2 != s, "ancre input publish introuvable — abandon"
s = s2

RES_OLD = r'''      const asset = await ctx.prisma.mediaAsset.findUnique({
        where: { id: input.mediaAssetId },
        select: { id: true },
      });'''
RES_NEW = r'''      // Résolution par chemin logique, tolérante à l'extension (comme
      // media.updateDescription) : le finder fournit un chemin, pas un id.
      const asset = await ctx.prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { fullPath: input.path },
            { fullPath: { startsWith: `${input.path}.` } },
          ],
        },
        select: { id: true },
      });'''
assert s.count(RES_OLD) == 1, "ancre résolution asset introuvable — abandon"
s = s.replace(RES_OLD, RES_NEW)

s2 = s.replace("        where: { mediaAssetId: input.mediaAssetId },\n",
               "        where: { mediaAssetId: asset.id },\n", 1)
assert s2 != s, "ancre existing where introuvable — abandon"
s = s2

s2 = s.replace("          mediaAssetId: input.mediaAssetId,\n",
               "          mediaAssetId: asset.id,\n", 1)
assert s2 != s, "ancre create data introuvable — abandon"
s = s2

# ── listMembers + publicationForPath (après listAdmin) ──────────────────────
TAIL_OLD = r'''        _count: { select: { recipients: true, receipts: true } },
      },
    });
  }),
});'''
TAIL_NEW = r'''        _count: { select: { recipients: true, receipts: true } },
      },
    });
  }),

  /** Membres, pour choisir les destinataires d'une diffusion restreinte. */
  listMembers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return users.map((u) => ({
      id: u.id,
      name:
        [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
    }));
  }),

  /** État de mise à disposition d'un fichier (pour le menu du finder). */
  publicationForPath: adminProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { fullPath: input.path },
            { fullPath: { startsWith: `${input.path}.` } },
          ],
        },
        select: { id: true },
      });
      if (!asset) return null;
      return ctx.prisma.memberDocument.findUnique({
        where: { mediaAssetId: asset.id },
        select: {
          id: true,
          audience: true,
          _count: { select: { recipients: true } },
        },
      });
    }),
});'''
assert s.count(TAIL_OLD) == 1, "ancre fin de router introuvable — abandon"
s = s.replace(TAIL_OLD, TAIL_NEW)

p.write_text(s, encoding="utf-8")
print("publish path-based + listMembers + publicationForPath")
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
if git commit -m "feat(documents): publish path-based + listMembers + publicationForPath (backend de la mise à disposition)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi