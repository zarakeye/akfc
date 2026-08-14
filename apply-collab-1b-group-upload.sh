#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 1b : dépôt dans l'espace d'un groupe.
#
# Ajoute la destination d'upload « group » et la GARDE d'écriture qui va avec.
# Un dépôt visant un groupe collaboratif est réservé à un ADMIN ou à un membre
# EDITOR de ce groupe (VIEWER / non-membre = refusé). La garde est posée au
# POINT DE PASSAGE COMMUN (les 4 procédures du router storage), donc couvre
# Cloudinary ET R2 — aucun angle mort.
#
# Fichiers touchés :
#   - contracts upload.schema.ts        : variante `group` (Cloudinary)
#   - storage/router.ts                 : variante `group` (R2) + garde ×4 + import
#   - resolvePendingUploadFolder        : branche `group` -> resolveGroupBaseFolder
#   - r2StorageAdapter                  : case `group` (rattachement par chemin)
#   - NOUVEAU assertCanWriteGroupSpace.service.ts : la garde partagée
#
# Prérequis : incrément 1a appliqué (isCollaborative + access + resolveGroupBaseFolder).
# Pas de migration ici (aucun changement de schéma Prisma).
#
# Usage normal (Stéphane), sur la branche du chantier, racine du repo :
#   bash apply-collab-1b-group-upload.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-collab-1b-group-upload.sh
#
set -euo pipefail

SCHEMA_C="packages/contracts/src/cloudinary/upload.schema.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
RESOLVE="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
R2ADAPTER="packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
GUARD="packages/backend/src/modules/memberGroups/assertCanWriteGroupSpace.service.ts"

for f in "package.json" "$SCHEMA_C" "$ROUTER" "$RESOLVE" "$R2ADAPTER"; do
  if [ ! -f "$f" ]; then echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine du repo)." >&2; exit 1; fi
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$SCHEMA_C" "$ROUTER" "$RESOLVE" "$R2ADAPTER" <<'PY'
import sys, pathlib
schema_c, router, resolve, r2 = (pathlib.Path(p) for p in sys.argv[1:5])

GUARD_SNIPPET = (
    '      if (input.destination.kind === "group") {\n'
    "        await assertCanWriteGroupSpace({\n"
    "          prisma: ctx.prisma,\n"
    "          userId: ctx.user.id,\n"
    "          groupId: input.destination.groupId,\n"
    "        });\n"
    "      }\n"
)

# ── 1) contracts : variante `group` (double quotes) ─────────────────────────
s = schema_c.read_text(encoding="utf-8")
if 'kind: z.literal("group")' in s:
    print("contracts déjà à jour")
else:
    OLD = ('  z.object({\n'
           '    kind: z.literal("event"),\n'
           '    eventId: z.number().int().positive(),\n'
           '    disciplineIds: z.array(z.number().int().positive()).default([]),\n'
           '  }),\n'
           ']);')
    NEW = ('  z.object({\n'
           '    kind: z.literal("event"),\n'
           '    eventId: z.number().int().positive(),\n'
           '    disciplineIds: z.array(z.number().int().positive()).default([]),\n'
           '  }),\n'
           '  // Espace d\'un groupe collaboratif : dépôt réservé aux éditeurs/admins\n'
           '  // (garde côté router). Rattachement par le chemin `groups/…`.\n'
           '  z.object({\n'
           '    kind: z.literal("group"),\n'
           '    groupId: z.string(),\n'
           '  }),\n'
           ']);')
    assert s.count(OLD) == 1, "ancre contracts (variante event) introuvable"
    s = s.replace(OLD, NEW)
    schema_c.write_text(s, encoding="utf-8")
    print("contracts patché (variante group)")

# ── 2) resolvePendingUploadFolder : import + branche group ──────────────────
s = resolve.read_text(encoding="utf-8")
if "resolveGroupBaseFolder" in s:
    print("resolvePendingUploadFolder déjà à jour")
else:
    IMP_OLD = 'import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";'
    IMP_NEW = (IMP_OLD + "\n"
               'import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";')
    assert s.count(IMP_OLD) == 1, "ancre import resolvePersoBaseFolder introuvable"
    s = s.replace(IMP_OLD, IMP_NEW)

    PERSO_OLD = ('  /* ── Destination personnelle de l\'admin (dérivée de userId) ── */\n'
                 '  if (destination.kind === "perso") {\n'
                 "    const base = await resolvePersoBaseFolder({ prisma, appRoot, userId });\n"
                 "    // Les photos vivent dans le sous-dossier `photos/` de l'espace perso, pour\n"
                 "    // une structure homogène avec les futures zones R2 (documents/, audio/).\n"
                 "    return `${base}/photos`;\n"
                 "  }")
    PERSO_NEW = (PERSO_OLD + "\n\n"
                 "  /* ── Destination espace d'un groupe collaboratif (dérivée du groupe) ── */\n"
                 '  if (destination.kind === "group") {\n'
                 "    // resolveGroupBaseFolder valide l'existence + le caractère collaboratif.\n"
                 "    return resolveGroupBaseFolder({ prisma, appRoot, groupId: destination.groupId });\n"
                 "  }")
    assert s.count(PERSO_OLD) == 1, "ancre branche perso introuvable"
    s = s.replace(PERSO_OLD, PERSO_NEW)
    resolve.write_text(s, encoding="utf-8")
    print("resolvePendingUploadFolder patché (branche group)")

# ── 3) r2StorageAdapter : case group dans le switch exhaustif ───────────────
s = r2.read_text(encoding="utf-8")
if 'case "group":' in s:
    print("r2StorageAdapter déjà à jour")
else:
    E_OLD = ('        case "event":\n'
             "          // Contenus d'un événement : ni catégorie ni discipline unique — le\n"
             "          // rattachement se fait par `eventId` (côté Cloudinary) et par les\n"
             "          // liens de disciplines de l'événement.\n"
             "          break;\n"
             '        case "perso":')
    E_NEW = ('        case "event":\n'
             "          // Contenus d'un événement : ni catégorie ni discipline unique — le\n"
             "          // rattachement se fait par `eventId` (côté Cloudinary) et par les\n"
             "          // liens de disciplines de l'événement.\n"
             "          break;\n"
             '        case "group":\n'
             "          // Espace de groupe collaboratif : rattachement par le chemin\n"
             "          // (`groups/…`), sans catégorie ni discipline (comme `general`).\n"
             "          break;\n"
             '        case "perso":')
    assert s.count(E_OLD) == 1, "ancre switch r2 (case event/perso) introuvable"
    s = s.replace(E_OLD, E_NEW)
    r2.write_text(s, encoding="utf-8")
    print("r2StorageAdapter patché (case group)")

# ── 4) storage/router : import garde + variante group R2 + garde ×4 ─────────
s = router.read_text(encoding="utf-8")
if "assertCanWriteGroupSpace" in s:
    print("router storage déjà à jour")
else:
    # import
    RI_OLD = "import { resolvePendingUploadFolder } from '@backend/modules/cloudinary/services/resolvePendingUploadFolder.service';"
    RI_NEW = (RI_OLD + "\n"
              "import { assertCanWriteGroupSpace } from '@backend/modules/memberGroups/assertCanWriteGroupSpace.service';")
    assert s.count(RI_OLD) == 1, "ancre import resolvePendingUploadFolder (router) introuvable"
    s = s.replace(RI_OLD, RI_NEW)

    # variante group dans r2UploadDestinationSchema (single quotes)
    R2S_OLD = ("  // Contenus d'un événement (parité avec `general`).\n"
               "  z.object({\n"
               "    kind: z.literal('event'),\n"
               "    eventId: z.number().int().positive(),\n"
               "    disciplineIds: z.array(z.number().int().positive()).default([]),\n"
               "  }),\n"
               "]);")
    R2S_NEW = ("  // Contenus d'un événement (parité avec `general`).\n"
               "  z.object({\n"
               "    kind: z.literal('event'),\n"
               "    eventId: z.number().int().positive(),\n"
               "    disciplineIds: z.array(z.number().int().positive()).default([]),\n"
               "  }),\n"
               "  // Espace d'un groupe collaboratif (dépôt gardé côté procédure).\n"
               "  z.object({\n"
               "    kind: z.literal('group'),\n"
               "    groupId: z.string(),\n"
               "  }),\n"
               "]);")
    assert s.count(R2S_OLD) == 1, "ancre r2UploadDestinationSchema (event) introuvable"
    s = s.replace(R2S_OLD, R2S_NEW)

    # garde ×4 (une ancre unique par procédure)
    A_OLD = ("        ...createUploadSignaturesSchema.shape,\n"
             "      })\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };")
    A_NEW = ("        ...createUploadSignaturesSchema.shape,\n"
             "      })\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             + GUARD_SNIPPET +
             "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };")
    assert s.count(A_OLD) == 1, "ancre createUploadAuthorization introuvable"
    s = s.replace(A_OLD, A_NEW)

    B_OLD = ("        ...registerUploadedAssetsSchema.shape,\n"
             "      })\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };")
    B_NEW = ("        ...registerUploadedAssetsSchema.shape,\n"
             "      })\n"
             "    )\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             + GUARD_SNIPPET +
             "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };")
    assert s.count(B_OLD) == 1, "ancre registerUploadedAsset introuvable"
    s = s.replace(B_OLD, B_NEW)

    C_OLD = ("  createR2Upload: protectedProcedure\n"
             "    .input(createR2UploadAuthorizationSchema)\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             "      // Le chemin se calcule ICI, une seule fois, avec la même règle que")
    C_NEW = ("  createR2Upload: protectedProcedure\n"
             "    .input(createR2UploadAuthorizationSchema)\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             + GUARD_SNIPPET +
             "      // Le chemin se calcule ICI, une seule fois, avec la même règle que")
    assert s.count(C_OLD) == 1, "ancre createR2Upload introuvable"
    s = s.replace(C_OLD, C_NEW)

    D_OLD = ("  registerR2Upload: protectedProcedure\n"
             "    .input(registerR2UploadInputSchema)\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             '      const adapter = getAdapter("r2", {')
    D_NEW = ("  registerR2Upload: protectedProcedure\n"
             "    .input(registerR2UploadInputSchema)\n"
             "    .mutation(async ({ ctx, input }) => {\n"
             + GUARD_SNIPPET +
             '      const adapter = getAdapter("r2", {')
    assert s.count(D_OLD) == 1, "ancre registerR2Upload introuvable"
    s = s.replace(D_OLD, D_NEW)

    router.write_text(s, encoding="utf-8")
    print("router storage patché (import + variante group R2 + garde ×4)")
PY

# ── 5) Garde partagée (nouveau fichier) ─────────────────────────────────────
if [ ! -f "$GUARD" ]; then
  cat > "$GUARD" <<'TS'
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

/**
 * Garde d'ÉCRITURE dans l'espace d'un groupe collaboratif : autorise un ADMIN
 * (au-dessus des groupes) OU un membre EDITOR du groupe. Un VIEWER ou un
 * non-membre est refusé (FORBIDDEN).
 *
 * À appeler dans CHAQUE procédure d'upload dès que la destination vise un
 * groupe (`destination.kind === "group"`), quel que soit le fournisseur
 * (Cloudinary / R2) : c'est le point de passage commun, donc pas d'angle mort.
 */
export async function assertCanWriteGroupSpace(params: {
  prisma: PrismaClient;
  userId: string;
  groupId: string;
}): Promise<void> {
  const { prisma, userId, groupId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (user?.role?.name === "ADMIN") return;

  const membership = await prisma.memberGroupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { access: true },
  });

  if (!membership || membership.access !== "EDITOR") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Dépôt réservé aux éditeurs de ce groupe.",
    });
  }
}
TS
  echo "garde écrite : $GUARD"
else
  echo "garde déjà présente"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(groups): destination 'group' + garde d'écriture éditeur/admin (Cloudinary + R2)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi