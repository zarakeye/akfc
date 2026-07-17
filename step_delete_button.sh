#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — Le bouton « Corbeille » devient « Supprimer »
# ═══════════════════════════════════════════════════════════════════════════
#
#  Il naviguait vers la corbeille. La corbeille est déjà dans l'arbre et dans
#  le fil d'Ariane — le bouton faisait double emploi et occupait la place
#  d'une action utile.
#
#  Désormais : envoie la sélection à la corbeille, grisé quand rien n'est
#  sélectionné. Il s'appuie sur `deleteNodes` de `useNodeActions`, qui gère
#  déjà le dispatch (corbeille vs suppression définitive selon l'emplacement)
#  et toutes les invalidations de cache.
#
#  ─── Ce que ce script laisse en l'état, et qui mérite ta décision ───────
#
#  La barre de multi-sélection a DÉJÀ son propre bouton de suppression
#  (Finder.tsx:437). En mode multi-sélection, tu auras donc deux boutons qui
#  font la même chose. Je ne l'ai pas retiré : c'est un choix d'UI, pas une
#  correction, et tu es le seul à savoir si la barre de multi-sélection doit
#  rester autonome.
#
#  ─── La navigation vers la corbeille ────────────────────────────────────
#
#  Elle survit : `AKFC/bin` est un dossier de l'arbre (le pliage le préserve
#  explicitement) et le fil d'Ariane en sort. Le bouton n'était pas le seul
#  chemin.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  USAGE
#  -----
#     bash step_delete_button.sh
#     AKFC_APPLY_ONLY=1 bash step_delete_button.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — bouton « Supprimer »"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

F="apps/web/src/features/finder-core/components/Finder.tsx"
[ -f "$F" ] || { echo "✗ Introuvable : $F"; exit 1; }

if grep -q 'aria-label={deleteButtonLabel}' "$F"; then
  echo "✓ Déjà appliqué."
  exit 0
fi

python3 - <<'PYEOF'
import io

F = "apps/web/src/features/finder-core/components/Finder.tsx"
with io.open(F, encoding="utf-8") as f:
    s = f.read()

old = '''        {(() => {
          const inBin =
            currentPath === `${APP_ROOT}/bin` ||
            currentPath.startsWith(`${APP_ROOT}/bin/`);
          return (
            <button
              type="button"
              onClick={() => setPath(inBin ? rootPath : `${APP_ROOT}/bin`)}
              aria-label={
                inBin ? "Quitter la corbeille" : "Ouvrir la corbeille"
              }
              aria-pressed={inBin}
              title="Corbeille"
              className={
                inBin
                  ? "shrink-0 rounded p-1 text-red-600 bg-red-50 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                  : "shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          );
        })()}'''

new = '''        {(() => {
          // Ce bouton naviguait vers la corbeille. Elle est déjà atteignable
          // par l'arbre (`AKFC/bin` y est un dossier, le pliage le préserve)
          // et par le fil d'Ariane : il occupait la place d'une action utile
          // pour dupliquer un chemin qui existait déjà.
          //
          // `deleteNodes` connaît déjà le dispatch — mise en corbeille depuis
          // la bibliothèque, suppression définitive depuis la corbeille — et
          // porte les invalidations de cache. `deleteLabel` en donne le
          // libellé exact, y compris le pluriel.
          const canDelete = selectedCount > 0;
          const deleteButtonLabel = canDelete
            ? deleteLabel(selectedCount, selectedNodes)
            : "Supprimer";

          return (
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => {
                void deleteNodes(selectedNodes);
              }}
              aria-label={deleteButtonLabel}
              title={
                canDelete
                  ? deleteButtonLabel
                  : "Sélectionne un contenu ou un dossier"
              }
              className={
                canDelete
                  ? "shrink-0 rounded p-1 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                  : "shrink-0 rounded p-1 text-gray-300 cursor-not-allowed transition-colors"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          );
        })()}'''

n = s.count(old)
assert n == 1, f"[bouton] ancre trouvée {n} fois (attendu 1)"
with io.open(F, "w", encoding="utf-8") as f:
    f.write(s.replace(old, new, 1))
print("  ✓ Finder — le bouton corbeille devient Supprimer")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "feat(finder): le bouton corbeille devient Supprimer

Il naviguait vers la corbeille. Or elle est déjà atteignable par l'arbre
(AKFC/bin y est un dossier, que le pliage préserve explicitement) et par le
fil d'Ariane : le bouton occupait la place d'une action utile pour dupliquer
un chemin qui existait déjà.

Il envoie désormais la sélection à la corbeille, et reste grisé tant que rien
n'est sélectionné — contenu ou dossier indifféremment.

S'appuie sur deleteNodes/deleteLabel de useNodeActions, qui portent déjà le
dispatch (mise en corbeille depuis la bibliothèque, suppression définitive
depuis la corbeille), le libellé et les invalidations de cache. Rien de
nouveau n'est écrit ici.

Note : la barre de multi-sélection garde son propre bouton de suppression.
Les deux coexistent en mode multi-sélection. C'est un choix d'UI à trancher,
pas une correction."

echo "✅ Bouton Supprimer appliqué, typechecké et commité."