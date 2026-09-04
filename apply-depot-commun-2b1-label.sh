#!/usr/bin/env bash
#
# AKFC — Dépôt commun, 2b-1 : libellé humain accentué (stockage + select).
#
# Option (2) : le libellé est posé par le FRONT après un dépôt réussi (une seule
# mutation pour tout le lot, images+documents, pas de conteneur fantôme). Le path
# du conteneur est recalculé côté serveur via un helper PARTAGÉ avec le resolver
# (donc pose/lecture sur le même chemin, jamais de divergence).
#
#   1. schema.prisma        : modèle CommonRepositoryLabel { path @id, label, updatedAt }
#   2. helper partagé       : commonRepositoryContainerPath({ prisma, appRoot, userId, subject })
#      + resolver refactorisé pour l'utiliser (branche common_repository)
#   3. mutation             : storage.setCommonRepositoryLabel({ subject, label }) — scopée user
#   4. query enrichie       : listMyCommonRepositoryContainers renvoie { subject, label }
#   5. front                : appel setLabel après dépôt réussi + select affiche label ?? subject
#
# ⚠️ Migration destructive ? NON — ajout d'une table. `prisma migrate deploy`
# (local puis distant). Ce script écrit le code + le modèle + génère le client ;
# la migration se lance à la main ensuite.
#
# Backend + contract + front. typecheck backend + web (après prisma generate).
#
# Usage : bash apply-depot-commun-2b1-label.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-2b1-label.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
RESOLVE="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
HELPER="packages/backend/src/modules/media/services/commonRepositoryContainerPath.service.ts"
LISTSVC="packages/backend/src/modules/media/services/listMyCommonRepositoryContainers.service.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
COMP="apps/web/src/features/common-repository/CommonRepositoryUpload.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$SCHEMA" "$RESOLVE" "$LISTSVC" "$ROUTER" "$COMP"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Modèle Prisma ─────────────────────────────────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "model CommonRepositoryLabel" in s:
    print("— modèle déjà présent"); sys.exit(0)
s = s.rstrip() + "\n\n" + (
    "model CommonRepositoryLabel {\n"
    "  // path physique du conteneur (ex. AKFC/common_repository/{sujet}_{personne}-{cuid})\n"
    "  path      String   @id\n"
    "  // libellé humain saisi par le déposant (accents/casse préservés)\n"
    "  label     String\n"
    "  updatedAt DateTime @updatedAt\n"
    "}\n"
)
p.write_text(s, encoding="utf-8"); print("✓ schema : CommonRepositoryLabel")
PY

# ── 2. Helper partagé + resolver refactorisé ─────────────────────────────────
cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;
export function slugForContainer(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Chemin physique du conteneur d'un dépôt commun, pour un utilisateur + un sujet.
 * SOURCE UNIQUE : utilisé par le resolver (à l'upload) ET par setCommonRepositoryLabel
 * (pose du libellé) → jamais de divergence de chemin.
 *
 * Format : `${appRoot}/common_repository/{slug(sujet)}_{personSlug}-{userId}`,
 * ou `depot_{personSlug}-{userId}` si le sujet est vide.
 */
export async function commonRepositoryContainerPath(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
  subject?: string | null;
}): Promise<string> {
  const { prisma, appRoot, userId, subject } = params;
  const person = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, pseudo: true },
  });
  const personName =
    [person?.firstName, person?.lastName].filter(Boolean).join(" ").trim() ||
    person?.pseudo ||
    "";
  const personSlug = slugForContainer(personName) || `user-${userId}`;
  const personSegment = `${personSlug}-${userId}`;
  const subjectSlug = subject ? slugForContainer(subject) : "";
  const segment = subjectSlug
    ? `${subjectSlug}_${personSegment}`
    : `depot_${personSegment}`;
  return `${appRoot}/common_repository/${segment}`;
}
TS
echo "créé  $HELPER"

# resolver : remplacer sa branche common_repository par un appel au helper
python3 - "$RESOLVE" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "commonRepositoryContainerPath" in s:
    print("— resolver déjà refactorisé"); sys.exit(0)

# import
s = s.replace(
    'import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";\n',
    'import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";\n'
    'import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";\n',
)

# remplacer tout le corps de la branche common_repository par l'appel helper
start = s.index('  if (destination.kind === "common_repository") {')
end = s.index("\n  }\n", start) + len("\n  }\n")
block = s[start:end]
new_block = (
    '  if (destination.kind === "common_repository") {\n'
    "    // Chemin du conteneur = source unique partagée avec setCommonRepositoryLabel.\n"
    "    return commonRepositoryContainerPath({\n"
    "      prisma,\n"
    "      appRoot,\n"
    "      userId,\n"
    "      subject: destination.containerName,\n"
    "    });\n"
    "  }\n"
)
s = s[:start] + new_block + s[end:]
p.write_text(s, encoding="utf-8")
print("✓ resolver : branche common_repository via helper")
PY

# ── 3. listMyCommonRepositoryContainers : joindre le label ───────────────────
python3 - "$LISTSVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "CommonRepositoryLabel" in s or "label" in s:
    print("— listSvc déjà enrichi ?"); 
# renvoyer { subject, label? } : on résout le label via le path conteneur.
old_ret = (
    "  return [...subjects]\n"
    '    .sort((a, b) => a.localeCompare(b, "fr"))\n'
    "    .map((subject) => ({ subject }));\n"
)
new_ret = (
    "  const subjectList = [...subjects].sort((a, b) => a.localeCompare(b, \"fr\"));\n"
    "\n"
    "  // Libellés humains (accentués), s'ils existent, joints par path conteneur.\n"
    "  const withLabels = await Promise.all(\n"
    "    subjectList.map(async (subject) => {\n"
    "      const path = await commonRepositoryContainerPath({\n"
    "        prisma,\n"
    "        appRoot,\n"
    "        userId,\n"
    "        subject,\n"
    "      });\n"
    "      const row = await prisma.commonRepositoryLabel.findUnique({\n"
    "        where: { path },\n"
    "        select: { label: true },\n"
    "      });\n"
    "      return { subject, label: row?.label };\n"
    "    }),\n"
    "  );\n"
    "  return withLabels;\n"
)
if old_ret in s:
    s = s.replace(old_ret, new_ret)
    # import helper
    if "commonRepositoryContainerPath" not in s.split(new_ret)[0]:
        s = s.replace(
            'import { physicalCandidates } from "@backend/modules/storage/logicalPath";\n',
            'import { physicalCandidates } from "@backend/modules/storage/logicalPath";\n'
            'import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";\n',
        )
    # signature de retour
    s = s.replace(
        "}): Promise<{ subject: string }[]> {",
        "}): Promise<{ subject: string; label?: string }[]> {",
    )
    p.write_text(s, encoding="utf-8")
    print("✓ listSvc : label joint")
else:
    print("!! ancre retour listSvc introuvable — colle-moi le fichier"); sys.exit(1)
PY

# ── 4. mutation setCommonRepositoryLabel (router) ────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "setCommonRepositoryLabel" in s:
    print("— mutation déjà présente"); sys.exit(0)

# import du helper
imp_anchor = 'import { listMyCommonRepositoryContainers } from "@backend/modules/media/services/listMyCommonRepositoryContainers.service";\n'
assert imp_anchor in s, "ancre import listMyCommonRepositoryContainers introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";\n',
)

# la mutation, après la query listMyCommonRepositoryContainers (bloc fermant `}),`)
q_anchor = (
    "  listMyCommonRepositoryContainers: protectedProcedure.query(async ({ ctx }) => {\n"
    "    return listMyCommonRepositoryContainers({\n"
    "      prisma: ctx.prisma,\n"
    "      appRoot: ctx.appRoot,\n"
    "      userId: ctx.user.id,\n"
    "    });\n"
    "  }),\n"
)
assert q_anchor in s, "ancre query listMyCommonRepositoryContainers introuvable"
mutation = (
    "\n"
    "  // Pose le libellé humain d'un conteneur de dépôt (appelé par le front après\n"
    "  // un dépôt réussi). Le path est dérivé de ctx.user.id → un membre ne peut\n"
    "  // labelliser QUE ses propres conteneurs.\n"
    "  setCommonRepositoryLabel: protectedProcedure\n"
    "    .input(z.object({ subject: z.string().trim().min(1).max(120), label: z.string().trim().min(1).max(200) }))\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      const path = await commonRepositoryContainerPath({\n"
    "        prisma: ctx.prisma,\n"
    "        appRoot: ctx.appRoot,\n"
    "        userId: ctx.user.id,\n"
    "        subject: input.subject,\n"
    "      });\n"
    "      await ctx.prisma.commonRepositoryLabel.upsert({\n"
    "        where: { path },\n"
    "        update: { label: input.label },\n"
    "        create: { path, label: input.label },\n"
    "      });\n"
    "      return { ok: true };\n"
    "    }),\n"
)
s = s.replace(q_anchor, q_anchor + mutation)
p.write_text(s, encoding="utf-8")
print("✓ router : setCommonRepositoryLabel")
PY

# ── 5. front : poser le label après dépôt + afficher label dans le select ────
python3 - "$COMP" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "setCommonRepositoryLabel" in s:
    print("— front déjà patché"); sys.exit(0)

# mutation
s = s.replace(
    "  const { data: myContainers = [] } =\n"
    "    trpc.storage.listMyCommonRepositoryContainers.useQuery();\n",
    "  const { data: myContainers = [], refetch: refetchContainers } =\n"
    "    trpc.storage.listMyCommonRepositoryContainers.useQuery();\n"
    "  const setLabel = trpc.storage.setCommonRepositoryLabel.useMutation();\n",
)

# après succès : poser le libellé humain (le containerName saisi) si présent
s = s.replace(
    "      setState(\"done\");\n"
    "      setMessage(\n"
    "        `${nCloud + r2.length} fichier(s) déposé(s) dans le Dépôt commun.`,\n"
    "      );\n",
    "      // Libellé humain accentué du conteneur (le texte saisi), pour l'affichage.\n"
    "      const typed = containerName.trim();\n"
    "      if (typed) {\n"
    "        try {\n"
    "          await setLabel.mutateAsync({ subject: typed, label: typed });\n"
    "          await refetchContainers();\n"
    "        } catch {\n"
    "          /* le libellé est cosmétique : on n'échoue pas le dépôt pour ça. */\n"
    "        }\n"
    "      }\n"
    "      setState(\"done\");\n"
    "      setMessage(\n"
    "        `${nCloud + r2.length} fichier(s) déposé(s) dans le Dépôt commun.`,\n"
    "      );\n",
)

# select : afficher label ?? subject
s = s.replace(
    "              <option key={c.subject} value={c.subject}>\n"
    "                {c.subject}\n"
    "              </option>\n",
    "              <option key={c.subject} value={c.subject}>\n"
    "                {c.label ?? c.subject}\n"
    "              </option>\n",
)
p.write_text(s, encoding="utf-8")
print("✓ front : label posé après dépôt + affiché dans le select")
PY

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "generate KO :"; tail -15 /tmp/akfc_gen.log; exit 1; }
echo "OK generate"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|commonRepositoryLabel|CommonRepositoryLabel|containerPath" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|setCommonRepositoryLabel" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

echo
echo "════════ MIGRATION (ajout de table, non destructif) ════════"
echo "Local :   pnpm prisma migrate dev --name add_common_repository_label"
echo "  (migrate dev remarche depuis le baseline ; sinon migration manuelle + deploy)"
echo "Puis commit. Distant : migrate deploy (recette PG_IP)."
echo
echo "NB : pas de commit auto ici — la table doit être migrée avant."