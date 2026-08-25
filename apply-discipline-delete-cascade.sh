#!/usr/bin/env bash
#
# AKFC — Point 2 — cascade suppression de DISCIPLINE (backend).
#
# Aligne le delete discipline sur le modèle de suppression :
#  - garde les blocs métier Course/Stage/Event (refus si références) ;
#  - REMPLACE le check FK mediaAssetCount (défectueux : MediaAsset persiste
#    après vidage) par un check PHYSIQUE du DOSSIER via isSpaceEmpty ;
#  - détache les MediaAsset orphelines (disciplineId → null ; dossier vérifié
#    vide) dans la transaction, pour ne pas buter sur la FK ;
#  - supprime la ligne de registre Folder du dossier de la discipline ;
#  - messages en français (« Videz le dossier… avant de supprimer »).
#
# Prérequis : isSpaceEmpty (apply-isspace-empty-and-fix-group.sh).
# Non testable sur clone (router v2 collab) → assert count==1 (abort avant commit).
# Usage : bash apply-discipline-delete-cascade.sh
#
set -euo pipefail
F="packages/backend/src/modules/disciplines/router.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isSpaceEmpty" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# import slugify + isSpaceEmpty
s = sub(
'import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";\n',
'import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";\n'
'import { isSpaceEmpty } from "@backend/modules/storage/isSpaceEmpty.service";\n'
'import slugify from "slugify";\n',
"imports")

OLD_DELETE = '''  delete: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Pré-vérification des dépendances — on refuse plutôt que de cascader.
      // Étendue à Event (nouvelle entité v2) en plus de Course/Stage/MediaAsset.
      const [courseCount, stageCount, eventCount, mediaAssetCount] =
        await Promise.all([
          ctx.prisma.course.count({ where: { disciplineId: input.id } }),
          ctx.prisma.stage.count({ where: { disciplineId: input.id } }),
          // Via la jointure : compte aussi les événements multi-disciplines.
          ctx.prisma.eventDiscipline.count({
            where: { disciplineId: input.id },
          }),
          ctx.prisma.mediaAsset.count({ where: { disciplineId: input.id } }),
        ]);

      const deps: string[] = [];
      if (courseCount > 0) deps.push(`${courseCount} course(s)`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (eventCount > 0) deps.push(`${eventCount} event(s)`);
      if (mediaAssetCount > 0) deps.push(`${mediaAssetCount} media asset(s)`);

      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Cannot delete discipline: ${deps.join(
            ", ",
          )} still reference it. Migrate or delete them first.`,
        });
      }

      // Transaction : nettoyage des PageMediaReference avant le delete
      // physique de la discipline. Cohérent avec le pattern courses :
      // on libère les références AVANT pour ne pas laisser de rows
      // orphelines (la table n'a pas de FK DB sur `pageId`).
      return await ctx.prisma.$transaction(async (tx) => {
        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(input.id),
          newContent: null,
        });

        try {
          return await tx.discipline.delete({
            where: { id: input.id },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Discipline not found.",
            });
          }
          throw err;
        }
      });
    }),'''

NEW_DELETE = '''  delete: protectedProcedure
    .use(requirePermission("manage_disciplines"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Dépendances métier : on refuse plutôt que de cascader (Course/Stage/
      // Event). Le contenu du DOSSIER est traité à part, par un check PHYSIQUE
      // (isSpaceEmpty) — pas par les lignes MediaAsset, qui persistent après un
      // vidage et donneraient un faux « non vide ».
      const [courseCount, stageCount, eventCount] = await Promise.all([
        ctx.prisma.course.count({ where: { disciplineId: input.id } }),
        ctx.prisma.stage.count({ where: { disciplineId: input.id } }),
        ctx.prisma.eventDiscipline.count({ where: { disciplineId: input.id } }),
      ]);

      const deps: string[] = [];
      if (courseCount > 0) deps.push(`${courseCount} cours`);
      if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
      if (eventCount > 0) deps.push(`${eventCount} événement(s)`);
      if (deps.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Impossible de supprimer la discipline : ${deps.join(
            ", ",
          )} y font encore référence. Traitez-les d'abord.`,
        });
      }

      // Résout le dossier : `${appRoot}/<slug(cat.type)>/<slug(name)>`
      // (aligné sur resolvePendingUploadFolder / protectedDisciplineFolder).
      const disc = await ctx.prisma.discipline.findUnique({
        where: { id: input.id },
        select: { id: true, name: true, categoryId: true },
      });
      if (!disc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Discipline not found." });
      }
      const cat = await ctx.prisma.category.findUnique({
        where: { id: disc.categoryId },
        select: { type: true },
      });
      const slug = (v: string) => slugify(v, { lower: true, strict: true });
      const folderPath = cat
        ? `${ctx.appRoot}/${slug(cat.type)}/${slug(disc.name) || `disc-${disc.id}`}`
        : null;

      // Le dossier doit être VIDE (contrôle physique, cf. finder).
      if (
        folderPath &&
        !(await isSpaceEmpty({
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          path: folderPath,
        }))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Le dossier de la discipline « ${disc.name} » n'est pas vide. Videz-le (fichiers et sous-dossiers) avant de supprimer la discipline.`,
        });
      }

      // Transaction : refs média → détache les MediaAsset orphelines (dossier
      // vérifié vide, disciplineId nullable) → supprime la ligne Folder → delete.
      return await ctx.prisma.$transaction(async (tx) => {
        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(input.id),
          newContent: null,
        });

        await tx.mediaAsset.updateMany({
          where: { disciplineId: input.id },
          data: { disciplineId: null },
        });

        if (folderPath) {
          await tx.folder.deleteMany({
            where: { appRoot: ctx.appRoot, fullPath: folderPath },
          });
        }

        try {
          return await tx.discipline.delete({ where: { id: input.id } });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Discipline not found.",
            });
          }
          throw err;
        }
      });
    }),'''

s = sub(OLD_DELETE, NEW_DELETE, "bloc delete discipline")
p.write_text(s, encoding="utf-8")
print("cascade discipline appliquée")
PY

echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(disciplines): cascade suppression (check dossier physique + détache MediaAsset + supprime dossier) (point 2)" && echo "commit $(git rev-parse --short HEAD)"