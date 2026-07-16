#!/usr/bin/env bash
###############################################################################
# S2 — Badge « En attente » à l'œil nu
#
# Le statut n'étant plus lisible dans le fil d'Ariane une fois la strate
# supprimée, il doit se voir sur l'asset lui-même.
#
#   1. GridItem.tsx : badge orange « En attente », empilé sous le badge de
#      type (haut-droite). Le coin haut-gauche est pris par la checkbox.
#
# Choix de conception :
#   - Badge sur `pending` UNIQUEMENT. Publié est l'état d'aboutissement
#     normal : le badger aussi ferait du bruit et tuerait le repérage
#     instantané. L'ABSENCE de badge signifie publié.
#   - Orange, pas rouge : « en attente » est un état de travail, pas une
#     erreur.
#   - Rien sur la corbeille : elle a sa vue dédiée (FinderBinRootView).
#   - Source = `meta.status` (S1), fallback `statusFromPath` pour les
#     fichiers sans row DB.
#
# Requiert S1 appliqué.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
test -f "$GRID" || { echo "ERREUR: $GRID introuvable."; exit 1; }

if ! grep -q "status?: 'pending'" packages/contracts/src/finder/meta.types.ts 2>/dev/null; then
  echo "ERREUR: S1 absent. Applique stepS1_status_from_metadata.sh d'abord."; exit 1
fi
if grep -q "BADGE STATUT" "$GRID" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

python3 - << 'PY'
p = "apps/web/src/features/finder-core/components/GridItem.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

# 1. import de statusFromPath (fallback)
sub('''import { useLongPress } from '@features/finder-core/hooks/useLongPress';''',
'''import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { statusFromPath } from '@features/finder-core/utils/statusFolders';''',
"1.import")

# 2. calcul du statut, à côté des autres dérivations du rendu
sub('''  const kind = node.meta?.kind;
  const url = node.meta?.url;''',
'''  const kind = node.meta?.kind;
  const url = node.meta?.url;

  // Statut depuis la métadonnée (cf. MediaMeta.status) ; fallback sur le
  // chemin pour les fichiers sans row MediaAsset. Seul `pending` est badgé :
  // l'absence de badge signifie « publié ».
  const isPending =
    !isFolder && (node.meta?.status ?? statusFromPath(node.path)) === 'pending';''',
"2.compute")

# 3. le badge, empilé sous le badge de type (top-1.5 pris)
sub('''      {/* ---------------------------- CHECKBOX ---------------------------- */}''',
'''      {/* -------------------------- BADGE STATUT -------------------------- */}
      {/* Sous le badge de type (le coin haut-gauche est pris par la
          checkbox). Orange : état de travail, pas une erreur. */}
      {isPending && (
        <div
          className={clsx(
            'absolute right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold',
            extension && !isFolder ? 'top-7' : 'top-1.5',
            hasVisualThumb
              ? 'bg-amber-500/90 text-white shadow-sm backdrop-blur-sm'
              : 'bg-amber-100 text-amber-800 border border-amber-200',
          )}
        >
          En attente
        </div>
      )}

      {/* ---------------------------- CHECKBOX ---------------------------- */}''',
"3.badge")

open(p, "w", encoding="utf-8").write(s)
print("  [1] GridItem.tsx : badge « En attente » OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck web (serveur arrêté + .next vidé recommandé) =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(finder): pending badge on grid tiles"
echo "OK — S2 commité."