#!/usr/bin/env bash
#
# AKFC — Dépôt commun : select des dépôts existants de l'utilisateur (page membre).
#
# Le membre peut reprendre un de SES sujets déjà déposés au lieu d'en recréer un.
#   - backend : listMyCommonRepositoryContainers (protectedProcedure, scopé
#     uploaderUserId=ctx.user.id) → extrait le SUJET de chaque dossier
#     (`{sujet}_{personne}-{cuid}` → sujet), robuste (retire `-{userId}` puis tout
#     depuis le dernier `_`, sans dépendre du calcul de personSlug).
#   - front : un <select> de ces sujets ; le choisir remplit `containerName` →
#     le resolver retombe sur le MÊME dossier (slug(sujet) idempotent).
#
# Backend + front, typecheck backend + web.
#
# Usage : bash apply-depot-commun-member-select.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-member-select.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/media/services/listMyCommonRepositoryContainers.service.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
COMP="apps/web/src/features/common-repository/CommonRepositoryUpload.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$ROUTER" "$COMP"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Service (scopé user, extraction du sujet) ─────────────────────────────
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";
import { physicalCandidates } from "@backend/modules/storage/logicalPath";

/**
 * Sujets des dépôts de l'utilisateur courant dans common_repository.
 *
 * Un conteneur est nommé `{slug(sujet)}_{personne}-{cuid}`. On extrait le sujet
 * en retirant `-{userId}` (fin), puis tout depuis le dernier `_` (le séparateur
 * avant `{personne}`). Robuste : ne dépend pas du recalcul de personSlug. Scopé
 * par `uploaderUserId` → l'utilisateur ne voit QUE ses propres dépôts.
 *
 * Le sujet renvoyé, repassé en `containerName`, produit le même chemin (slug
 * idempotent) → un nouveau dépôt retombe dans le dossier existant.
 */
export async function listMyCommonRepositoryContainers(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<{ subject: string }[]> {
  const { prisma, appRoot, userId } = params;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      uploaderUserId: userId,
      fullPath: { contains: "/common_repository/" },
    },
    select: { fullPath: true },
  });

  const prefixes = physicalCandidates(`${appRoot}/common_repository`, appRoot).map(
    (candidate) => `${candidate}/`,
  );
  const tail = `-${userId}`;
  const subjects = new Set<string>();

  for (const { fullPath } of assets) {
    for (const prefix of prefixes) {
      if (!fullPath.startsWith(prefix)) continue;
      let seg = fullPath.slice(prefix.length).split("/")[0];
      if (seg.endsWith(tail)) {
        seg = seg.slice(0, seg.length - tail.length);
        const u = seg.lastIndexOf("_");
        const subject = u >= 0 ? seg.slice(0, u) : seg;
        if (subject) subjects.add(subject);
      }
      break;
    }
  }

  return [...subjects]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((subject) => ({ subject }));
}
TS
echo "créé  $SVC"

# ── 2. Router : import + query ───────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "listMyCommonRepositoryContainers" in s:
    print("— router déjà patché"); sys.exit(0)

imp_anchor = 'import { listCommonRepositoryFolders } from "@backend/modules/media/services/listCommonRepositoryFolders.service";\n'
assert imp_anchor in s, "ancre import listCommonRepositoryFolders introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { listMyCommonRepositoryContainers } from "@backend/modules/media/services/listMyCommonRepositoryContainers.service";\n',
)

q_anchor = (
    "  listCommonRepositoryFolders: protectedProcedure.query(async ({ ctx }) => {\n"
    "    return listCommonRepositoryFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });\n"
    "  }),\n"
)
assert q_anchor in s, "ancre query listCommonRepositoryFolders introuvable"
s = s.replace(
    q_anchor,
    q_anchor
    + "\n"
    + "  // Sujets des dépôts de l'utilisateur courant (page membre) — scopé user.\n"
    + "  listMyCommonRepositoryContainers: protectedProcedure.query(async ({ ctx }) => {\n"
    + "    return listMyCommonRepositoryContainers({\n"
    + "      prisma: ctx.prisma,\n"
    + "      appRoot: ctx.appRoot,\n"
    + "      userId: ctx.user.id,\n"
    + "    });\n"
    + "  }),\n",
)
p.write_text(s, encoding="utf-8")
print("router : query listMyCommonRepositoryContainers ajoutée")
PY

# ── 3. Front : select des sujets existants ───────────────────────────────────
python3 - "$COMP" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "listMyCommonRepositoryContainers" in s:
    print("— front déjà patché"); sys.exit(0)

# 3a. query (après les mutations)
mut_anchor = "  const registerR2Upload = trpc.storage.registerR2Upload.useMutation();\n"
assert mut_anchor in s, "ancre mutations (front) introuvable"
s = s.replace(
    mut_anchor,
    mut_anchor
    + "  const { data: myContainers = [] } =\n"
    + "    trpc.storage.listMyCommonRepositoryContainers.useQuery();\n",
)

# 3b. select après le champ containerName
input_anchor = (
    '        <span className="font-medium">Nom du dossier de dépôt (optionnel)</span>\n'
    "        <input\n"
    "          type=\"text\"\n"
    "          value={containerName}\n"
    "          onChange={(e) => setContainerName(e.target.value)}\n"
    '          placeholder="ex. Photos du stage de bâton long"\n'
    '          className="rounded border border-input bg-background px-2 py-1"\n'
    "          disabled={busy}\n"
    "        />\n"
    "      </label>\n"
)
select_block = (
    input_anchor
    + "\n"
    + "      {myContainers.length > 0 && (\n"
    + '        <label className="flex flex-col gap-1 text-sm">\n'
    + '          <span className="font-medium">Ou reprendre un dépôt existant</span>\n'
    + "          <select\n"
    + '            className="rounded border border-input bg-background px-2 py-1"\n'
    + "            disabled={busy}\n"
    + '            value=""\n'
    + "            onChange={(e) => {\n"
    + "              if (e.target.value) setContainerName(e.target.value);\n"
    + "            }}\n"
    + "          >\n"
    + '            <option value="">— Choisir un de mes dépôts —</option>\n'
    + "            {myContainers.map((c) => (\n"
    + "              <option key={c.subject} value={c.subject}>\n"
    + "                {c.subject}\n"
    + "              </option>\n"
    + "            ))}\n"
    + "          </select>\n"
    + "        </label>\n"
    + "      )}\n"
)
assert input_anchor in s, "ancre champ containerName (front) introuvable"
s = s.replace(input_anchor, select_block)
p.write_text(s, encoding="utf-8")
print("front : select des dépôts existants ajouté")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|listMyCommon|physicalCandidates" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|listMyCommon" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): select des dépôts existants de l'utilisateur (page membre)" \
  && echo "commit $(git rev-parse --short HEAD)"