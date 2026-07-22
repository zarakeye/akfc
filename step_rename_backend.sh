#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RENOMMER — incrément 1/2 : la procédure backend.
#
# Un renommage est un `move` vers le MÊME dossier avec un nouveau nom. La
# procédure `move` existante ne convient pas : sa cible `folder` conserve le
# nom source (`resolveTargetPath` fait `${target.path}/${tail}`). D'où une
# procédure dédiée qui compose la destination explicitement et s'appuie sur
# `adapter.move({ source, target: { path } })`.
#
# ─── Deux garde-fous qui comptent ────────────────────────────────────────────
#
#   1) CONVENTION D'EXTENSION PRÉSERVÉE. Le `path` d'une image Cloudinary est
#      son public_id, SANS extension — alors que l'utilisateur voit
#      « photo.jpg » (reconstruit par `displayName`). On ne renomme donc que
#      la BASE, et on réapplique l'extension de la source telle quelle :
#          source "…/photo"      + "vacances" → "…/vacances"
#          source "…/doc.pdf"    + "facture"  → "…/facture.pdf"
#      Sans ça, un renommage poserait un public_id avec extension et
#      aggraverait l'incohérence déjà connue en base.
#
#   2) COLLISION REFUSÉE. Si un élément porte déjà le nom cible, on lève
#      plutôt que d'écraser un binaire.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine."; exit 1; }

if grep -q "rename: protectedProcedure" "$ROUTER"; then
  echo "→ déjà appliqué (storage.rename présent), rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/storage/router.ts")
src = p.read_text(encoding="utf-8")

def sub(old, new, label, count=1):
    global src
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    src = src.replace(old, new)
    print(f"  ✓ {label}")

# ── 1) import TRPCError ─────────────────────────────────────────────────────
sub('import { z } from "zod";',
    'import { z } from "zod";\nimport { TRPCError } from "@trpc/server";',
    "import TRPCError")

# ── 2) procédure rename, insérée avant move ─────────────────────────────────
sub("""  move: protectedProcedure""",
    '''  /**
   * Renomme un fichier ou un dossier — c'est-à-dire un `move` vers le même
   * parent sous un nouveau nom.
   *
   * `newBaseName` est le nom SANS extension : le client n'édite que la base
   * (l'extension affichée est reconstruite par `displayName` et n'appartient
   * pas toujours au path réel, cf. les public_id Cloudinary). L'extension de
   * la source est réappliquée telle quelle, ce qui préserve la convention du
   * provider.
   */
  rename: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        type: z.enum(["file", "folder"]).default("file"),
        newBaseName: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cleanName = input.newBaseName.trim();
      if (!cleanName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nom ne peut pas être vide.",
        });
      }
      if (cleanName.includes("/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nom ne peut pas contenir « / ».",
        });
      }

      const segments = input.path.split("/");
      const currentName = segments.pop() ?? "";
      const parent = segments.join("/");
      if (!parent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de renommer un élément racine.",
        });
      }

      // Extension de la SOURCE, réappliquée telle quelle (voir doc ci-dessus).
      const dot = currentName.lastIndexOf(".");
      const extension = dot > 0 ? currentName.slice(dot) : "";
      const targetPath = `${parent}/${cleanName}${extension}`;

      // Renommage en son propre nom : rien à faire, mais pas une erreur.
      if (targetPath === input.path) {
        return { success: true, path: input.path };
      }

      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      // On n'écrase jamais un élément existant.
      if (adapter.getNode) {
        const collision = await adapter.getNode(targetPath);
        if (collision) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un élément porte déjà ce nom dans ce dossier.",
          });
        }
      }

      await adapter.move({
        source: { type: input.type, path: input.path },
        target: { path: targetPath },
      });

      return { success: true, path: targetPath };
    }),

  move: protectedProcedure''',
    "procédure storage.rename")

p.write_text(src, encoding="utf-8")
PYEOF

p_check() { grep -q "$1" "$ROUTER" && echo "  ✓ $2" || { echo "  ✗ $2"; exit 1; }; }
echo
echo "→ contrôle"
p_check "rename: protectedProcedure" "procédure présente"
p_check "TRPCError" "TRPCError importé"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi
git add -A && git commit -m "feat(storage): procedure rename (move vers le meme dossier)"
echo "✓ commité."