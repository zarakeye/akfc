#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — incrément A (BACKEND SEUL) : la mutation `media.setStatus`
#
# Publier devient un UPDATE. Cet incrément pose la mutation et RIEN D'AUTRE :
# aucun appelant, aucun comportement changé. Le flip côté front (useStatusChange)
# et le retrait de l'écriture de `status` dans reconcileMovedAsset partent dans
# l'incrément B — ensemble, parce qu'aujourd'hui c'est reconcileMovedAsset qui
# publie.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/media/router.ts"

# ── Garde de prérequis : on est bien à la racine, après le pliage ────────────
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine du repo."; exit 1; }
test -f packages/backend/src/modules/storage/statusFoldingReadView.ts \
  || { echo "✗ statusFoldingReadView.ts absent — le pliage n'est pas en place."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if grep -q "setStatus: protectedProcedure" "$ROUTER"; then
  echo "→ media.setStatus déjà présent, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/media/router.ts")
src = p.read_text(encoding="utf-8")

OLD = """      return { ok: true, updatedAt: new Date().toISOString() };
    }),
});"""

NEW = """      return { ok: true, updatedAt: new Date().toISOString() };
    }),

  /**
   * 🔀 Changement de statut — **publier n'est plus un déplacement**.
   *
   * ─── Ce que cette mutation remplace ──────────────────────────────────────
   *
   * Avant : publier appelait `storage.move` vers `{type:'status-folder'}`.
   * Le binaire traversait le provider, `reconcileMovedAsset` relisait l'asset
   * à son nouveau chemin pour en redériver `status`, et deux mécanismes de
   * synchro devaient tomber d'accord. Un `catch` silencieux de trop et le
   * `publicId` décrochait.
   *
   * Après : un UPDATE. Atomique, sans aller-retour provider, sans binaire qui
   * bouge. `MediaAsset.status` cesse d'être un cache dérivé du chemin pour
   * devenir la source de vérité — c'est l'inversion que tout le chantier vise.
   *
   * ─── ⚠️ `paths` attend des chemins PHYSIQUES ─────────────────────────────
   *
   * Le matching se fait sur `MediaAsset.fullPath`, qui est le chemin où vit
   * réellement le binaire — donc celui qui porte encore `pending/` ou
   * `published/`. Un appelant front DOIT passer par `storagePathOf(node)`,
   * jamais par `node.path` (logique, plié, sans strate) : le chemin logique ne
   * matcherait aucune ligne, et cette mutation lèverait. C'est exactement le
   * piège qui avait éteint le picker en silence.
   *
   * Tolérance d'extension : cf. la doc en tête de fichier (publicId Cloudinary
   * extensionless vs `fullPath` DB suffixé du format).
   *
   * ─── Pourquoi `bin` n'est pas dans l'enum ────────────────────────────────
   *
   * La corbeille garde son système propre (quarantaine physique + TrashEntry).
   * Y entrer n'est pas un changement de statut : c'est `trash.trashToBin`.
   */
  setStatus: protectedProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        paths: z.array(z.string().min(1)).min(1),
        status: z.enum(["pending", "published"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const counts = await Promise.all(
        input.paths.map((path) =>
          ctx.prisma.mediaAsset.updateMany({
            where: {
              appRoot: input.appRoot,
              OR: [
                { fullPath: path },
                { fullPath: { startsWith: `${path}.` } },
              ],
            },
            data: { status: input.status },
          }),
        ),
      );

      // On lève sur le moindre path muet plutôt que de rendre un succès
      // partiel : un statut qui n'a pas pris doit se voir, pas s'éteindre.
      const missing = input.paths.filter((_, i) => counts[i].count === 0);
      if (missing.length > 0) {
        throw new Error(
          `Aucune MediaAsset trouvée pour : ${missing.join(", ")}. ` +
            `Vérifier que l'appelant passe des chemins PHYSIQUES ` +
            `(storagePathOf), pas des chemins logiques. ` +
            `Si ce sont des fichiers R2 historiques, lancer le backfill ` +
            `via /api/admin/backfill-r2-assets.`,
        );
      }

      const updated = counts.reduce((n, c) => n + c.count, 0);
      if (updated > input.paths.length) {
        console.warn(
          `[media.setStatus] ${updated} lignes pour ${input.paths.length} path(s) ` +
            `— un path matche plusieurs MediaAssets. À investiguer.`,
        );
      }

      return { ok: true, updated };
    }),
});"""

assert src.count(OLD) == 1, f"ancre trouvee {src.count(OLD)} fois, attendu 1"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("✓ media.setStatus inséré")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(media): mutation setStatus — publier devient un UPDATE (etape 3, increment A)"
echo "✓ commité."