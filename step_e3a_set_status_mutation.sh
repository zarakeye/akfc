#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — incrément A′ (BACKEND SEUL) : la mutation `media.setStatus`
#
# ⚠️ REMPLACE `step_e3a_set_status_mutation.sh`, qui ne traitait que les
#    fichiers et aurait LEVÉ sur « publier un dossier » — une fonctionnalité
#    qui marche aujourd'hui. Ne pas lancer l'ancien.
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

# ── Gardes de prérequis ─────────────────────────────────────────────────────
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine du repo."; exit 1; }
test -f packages/backend/src/modules/storage/logicalPath.ts \
  || { echo "✗ logicalPath.ts absent — le pliage n'est pas en place."; exit 1; }
grep -q "physicalCandidates" "$ROUTER" \
  || { echo "✗ physicalCandidates n'est pas importé dans $ROUTER — vérifier l'état du repo."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if grep -q "setStatus: protectedProcedure" "$ROUTER"; then
  echo "→ media.setStatus déjà présent, rien à faire."
  echo "  (Si c'est l'ANCIEN script A qui l'a posé — celui sans dossiers —"
  echo "   annule son commit puis relance celui-ci.)"
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
   * ─── Pourquoi `sources` et pas `paths` ───────────────────────────────────
   *
   * Parce qu'on publie aussi des DOSSIERS, et qu'un dossier n'a pas de
   * `MediaAsset`. Les deux cas ne se matchent pas de la même façon :
   *
   *   - `file`   → le chemin est un LOCALISATEUR. L'appelant front doit passer
   *                `storagePathOf(node)` — le chemin physique, celui qui matche
   *                `MediaAsset.fullPath`. Un chemin logique ne matcherait rien
   *                et cette mutation lèverait. (Tolérance d'extension : cf. la
   *                doc en tête de fichier.)
   *
   *   - `folder` → le chemin n'est PAS un localisateur : un dossier logique vit
   *                dans 1..N strates. C'est le backend qui résout, via
   *                `physicalCandidates` — la même règle que le pliage, pas une
   *                copie. On met à jour tout ce qui vit SOUS l'un des candidats.
   *
   * Forme alignée sur `trash.trashToBin` (`sources` + `logical`), qui tranche
   * déjà exactement le même problème. Une règle, un endroit.
   *
   * ─── Zéro ligne touchée : lever ou pas ? ─────────────────────────────────
   *
   * Pour un `file`, zéro ligne est une ANOMALIE : le statut n'a pas pris et
   * personne ne le saurait. On lève. C'est le mode d'échec qui avait éteint
   * le picker en silence.
   * Pour un `folder`, zéro ligne est LÉGITIME : un dossier vide n'a rien à
   * publier. On ne lève pas.
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
        sources: z
          .array(
            z.object({
              kind: z.enum(["file", "folder"]),
              path: z.string().min(1),
            }),
          )
          .min(1),
        status: z.enum(["pending", "published"]),
        /** Les `folder.path` sont des chemins LOGIQUES à résoudre. */
        logical: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const results = await Promise.all(
        input.sources.map(async (source) => {
          if (source.kind === "file") {
            const { count } = await ctx.prisma.mediaAsset.updateMany({
              where: {
                appRoot: input.appRoot,
                OR: [
                  { fullPath: source.path },
                  { fullPath: { startsWith: `${source.path}.` } },
                ],
              },
              data: { status: input.status },
            });
            return { source, count };
          }

          // Dossier : on ratisse chaque strate où il peut vivre. Le `/` final
          // n'est pas cosmétique — sans lui, publier `cours` publierait aussi
          // `cours-avance`. C'est la collision de préfixe déjà rencontrée dans
          // `trashToBin.folder.deleteMany`.
          const prefixes = input.logical
            ? physicalCandidates(source.path, input.appRoot)
            : [source.path];

          const { count } = await ctx.prisma.mediaAsset.updateMany({
            where: {
              appRoot: input.appRoot,
              OR: prefixes.map((prefix) => ({
                fullPath: { startsWith: `${prefix}/` },
              })),
            },
            data: { status: input.status },
          });
          return { source, count };
        }),
      );

      const silent = results.filter(
        (r) => r.source.kind === "file" && r.count === 0,
      );
      if (silent.length > 0) {
        throw new Error(
          `Aucune MediaAsset trouvée pour : ` +
            `${silent.map((r) => r.source.path).join(", ")}. ` +
            `Vérifier que l'appelant passe des chemins PHYSIQUES ` +
            `(storagePathOf), pas des chemins logiques. ` +
            `Si ce sont des fichiers R2 historiques, lancer le backfill ` +
            `via /api/admin/backfill-r2-assets.`,
        );
      }

      return {
        ok: true,
        updated: results.reduce((n, r) => n + r.count, 0),
      };
    }),
});"""

assert src.count(OLD) == 1, f"ancre trouvee {src.count(OLD)} fois, attendu 1"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("✓ media.setStatus (fichiers + dossiers) inséré")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(media): setStatus (fichiers + dossiers) — publier devient un UPDATE (etape 3, increment A)"
echo "✓ commité."