#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — Confirmation avant suppression
# ═══════════════════════════════════════════════════════════════════════════
#
#  Le bouton « Supprimer » agissait au premier clic.
#
#  ─── Aucun nouveau composant ────────────────────────────────────────────
#
#  `ConfirmDialog` existe déjà (`trash-view/components/ConfirmDialog.tsx`) et
#  `EmptyBinButton` s'en sert. En écrire un second serait la troisième façon
#  de poser une question dans ce projet — le même travers que la troisième
#  fabrique d'URL de média qu'on vient d'éviter dans la corbeille.
#
#  ─── Deux questions, pas une ────────────────────────────────────────────
#
#  `deleteNodes` est ADAPTATIF : depuis la bibliothèque il met en corbeille,
#  depuis la corbeille il supprime définitivement. Les deux gestes n'ont pas
#  le même poids, la question ne peut donc pas être la même :
#
#    bibliothèque → « Envoyer à la corbeille ? » — réversible, on le dit.
#    corbeille    → « Supprimer définitivement ? » — irréversible, ton en
#                   rouge, et le libellé de confirmation le répète.
#
#  Une confirmation identique dans les deux cas serait pire qu'aucune : elle
#  entraînerait à cliquer « Confirmer » sans lire, et le jour où le geste est
#  irréversible, l'habitude serait déjà prise.
#
#  Pas de `requireTypedConfirmation` ici : `EmptyBinButton` le réserve à
#  « vider toute la corbeille d'un coup », qui est d'un autre ordre. Faire
#  taper un mot pour jeter une photo apprendrait juste à le taper vite.
#
#  ─── Ce que ça ne change pas ────────────────────────────────────────────
#
#  Le bouton de la barre de multi-sélection (`Finder.tsx:437`) agit toujours
#  au premier clic. C'est le doublon que je t'ai signalé et que tu n'as pas
#  tranché : je ne vais pas y ajouter une seconde confirmation avant de savoir
#  s'il doit survivre.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  PRÉREQUIS : step_delete_button.sh
#
#  USAGE
#  -----
#     bash step_delete_confirm.sh
#     AKFC_APPLY_ONLY=1 bash step_delete_confirm.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — confirmation avant suppression"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

F="apps/web/src/features/finder-core/components/Finder.tsx"
[ -f "$F" ] || { echo "✗ Introuvable : $F"; exit 1; }
[ -f "apps/web/src/features/trash-view/components/ConfirmDialog.tsx" ] \
  || { echo "✗ ConfirmDialog introuvable."; exit 1; }
grep -q "aria-label={deleteButtonLabel}" "$F" \
  || { echo "✗ step_delete_button.sh n'est pas appliqué."; exit 1; }

if grep -q "deleteConfirmOpen" "$F"; then
  echo "✓ Déjà appliqué."
  exit 0
fi

python3 - <<'PYEOF'
import io, re

F = "apps/web/src/features/finder-core/components/Finder.tsx"

def sub_once(old, new, label):
    global src
    n = src.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois (attendu 1)"
    src = src.replace(old, new, 1)
    print(f"  ✓ {label}")

with io.open(F, encoding="utf-8") as f:
    src = f.read()

# ── 1. Import du dialogue existant ───────────────────────────────────────
sub_once(
    'import StatusFilterBar from "@features/finder-core/components/StatusFilterBar";',
    'import StatusFilterBar from "@features/finder-core/components/StatusFilterBar";\n'
    '// Le dialogue de `trash-view`, celui dont `EmptyBinButton` se sert déjà.\n'
    '// En écrire un second serait la troisième façon de poser une question\n'
    '// dans ce projet.\n'
    'import ConfirmDialog from "@features/trash-view/components/ConfirmDialog";',
    "import de ConfirmDialog",
)

# ── 2. L'état d'ouverture, posé près de useNodeActions ───────────────────
sub_once(
    "  const { deleteNodes, deleteLabel } = useNodeActions();",
    "  const { deleteNodes, deleteLabel, inBin } = useNodeActions();\n"
    "\n"
    "  // Le bouton « Supprimer » n'agit plus au premier clic.\n"
    "  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);",
    "état deleteConfirmOpen",
)

# ── 3. Le bouton ouvre le dialogue au lieu d'agir ────────────────────────
sub_once(
    """              onClick={() => {
                void deleteNodes(selectedNodes);
              }}""",
    """              onClick={() => setDeleteConfirmOpen(true)}""",
    "le bouton ouvre le dialogue",
)

# ── 4. Le dialogue, monté en fin de composant ────────────────────────────
#
# On l'accroche à la balise fermante du dernier JSX retourné. `Finder.tsx`
# ayant plusieurs `return`, on vise la FIN du fichier : la dernière
# fermeture de fragment/div avant le `);` final du composant.
marker = "\n      {/* ═══ Fin du Finder ═══ */}\n"
assert marker not in src

# Repère : le dialogue doit vivre là où `selectedNodes` est en scope, donc
# dans le même JSX que le bouton. On l'insère juste après le bloc du bouton.
anchor = """              <Trash2 className="h-4 w-4" />
            </button>
          );
        })()}"""
dialog = anchor + """

        {/* ─── La question dépend du geste ───────────────────────────────
            `deleteNodes` est adaptatif : mise en corbeille depuis la
            bibliothèque, suppression définitive depuis la corbeille. Poser
            la même question dans les deux cas serait pire que rien — ça
            entraînerait à confirmer sans lire, et l'habitude serait déjà
            prise le jour où le geste est irréversible. */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          title={inBin ? "Supprimer définitivement" : "Envoyer à la corbeille"}
          description={
            inBin
              ? `${selectedCount} élément${selectedCount > 1 ? "s" : ""} ${
                  selectedCount > 1 ? "seront supprimés" : "sera supprimé"
                } définitivement. Cette opération est irréversible.`
              : `${selectedCount} élément${selectedCount > 1 ? "s" : ""} ${
                  selectedCount > 1 ? "seront envoyés" : "sera envoyé"
                } à la corbeille. Tu pourras ${
                  selectedCount > 1 ? "les" : "le"
                } restaurer ensuite.`
          }
          confirmLabel={
            inBin ? "Supprimer définitivement" : "Envoyer à la corbeille"
          }
          destructive={inBin}
          onConfirm={() => {
            setDeleteConfirmOpen(false);
            void deleteNodes(selectedNodes);
          }}
          onCancel={() => setDeleteConfirmOpen(false)}
        />"""
sub_once(anchor, dialog, "montage du dialogue")

# ── 5. Garde : `useState` doit être importé ──────────────────────────────
#
# Il l'est déjà (`import React, { JSX, useCallback, useEffect, useMemo,
# useState } from "react"`). On ne le rajoute donc pas — on vérifie, pour que
# le script échoue ici plutôt que de laisser tsc trouver la panne trois fichiers
# plus loin si cet import bouge un jour.
assert re.search(r'^import .*\buseState\b.* from "react";$', src, re.MULTILINE), (
    "[react] `useState` n'est pas importé dans Finder.tsx — ajoute-le à "
    "l'import react avant de relancer."
)
print("  ✓ useState déjà importé (vérifié)")

with io.open(F, "w", encoding="utf-8") as f:
    f.write(src)
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
git commit -m "feat(finder): confirmation avant suppression

Le bouton Supprimer agissait au premier clic.

Réutilise ConfirmDialog (trash-view), celui dont EmptyBinButton se sert déjà.
En écrire un second aurait été la troisième façon de poser une question dans
ce projet.

La question dépend du geste, parce que deleteNodes est adaptatif : mise en
corbeille depuis la bibliothèque (réversible, on le dit), suppression
définitive depuis la corbeille (irréversible, ton destructif). Une
confirmation identique dans les deux cas serait pire qu'aucune : elle
entraînerait à confirmer sans lire, et l'habitude serait déjà prise le jour où
le geste ne se rattrape pas.

Pas de requireTypedConfirmation : EmptyBinButton le réserve à « vider toute la
corbeille », qui est d'un autre ordre. Faire taper un mot pour jeter une photo
apprendrait juste à le taper vite.

Le bouton de la barre de multi-sélection agit toujours au premier clic — c'est
le doublon en attente d'arbitrage."

echo "✅ Confirmation appliquée, typechecké et commité."