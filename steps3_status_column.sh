#!/usr/bin/env bash
###############################################################################
# S3 — Colonne « Statut » en vue tableau
#
# Complète S2 : le repérage à l'œil nu doit marcher dans les DEUX vues. En
# tableau, un badge en overlay n'a pas de sens — c'est une colonne.
#
#   1. FinderTableRow.tsx : cellule statut (pastille « En attente », vide
#      sinon — cohérent avec S2 : l'absence signifie publié).
#   2. Finder.tsx : entête « Statut » + `span` des lignes de groupe ajusté
#      (4/5 → 5/6). Les deux DOIVENT bouger ensemble, sinon les entêtes de
#      groupe cessent de couvrir toute la largeur.
#
# Requiert S1 (meta.status).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

ROW="apps/web/src/features/finder-core/components/FinderTableRow.tsx"
FINDER="apps/web/src/features/finder-core/components/Finder.tsx"
test -f "$ROW" || { echo "ERREUR: $ROW introuvable."; exit 1; }

if ! grep -q "status?: 'pending'" packages/contracts/src/finder/meta.types.ts 2>/dev/null; then
  echo "ERREUR: S1 absent."; exit 1
fi
if grep -q "Statut" "$FINDER" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. FinderTableRow : cellule statut                                          #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/finder-core/components/FinderTableRow.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

sub(''' * Affichage : colonnes Nom / Type / Taille avec icônes.''',
''' * Affichage : colonnes Nom / Type / Statut / Taille avec icônes.''',
"1.doc")

# Cellule statut, insérée entre Type et Taille.
sub('''      <td className="px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </td>''',
'''      <td className="px-3 py-2 text-sm whitespace-nowrap">
        {!isFolder &&
        (node.meta?.status ?? statusFromPath(node.path)) === 'pending' ? (
          <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
            En attente
          </span>
        ) : null}
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </td>''',
"1.cell")

# Import du fallback — on teste la présence de l'IMPORT, pas de
# l'identifiant (que la cellule insérée ci-dessus contient déjà).
import re
if "utils/statusFolders" not in s:
    imports = list(re.finditer(r"^import [^\n]*;\n", s, re.M))
    assert imports, "[1.import] aucun import trouvé."
    last = imports[-1]
    s = (s[:last.end()]
         + "import { statusFromPath } from '@features/finder-core/utils/statusFolders';\n"
         + s[last.end():])
assert "utils/statusFolders" in s, "[1.import] import non posé."

open(p, "w", encoding="utf-8").write(s)
print("  [1] FinderTableRow.tsx : cellule statut OK")
PY

# --------------------------------------------------------------------------- #
# 2. Finder : entête + span                                                   #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/finder-core/components/Finder.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

sub('''                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-right">Taille</th>''',
'''                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Statut</th>
                        <th className="px-3 py-2 text-right">Taille</th>''',
"2.th")

# Le colSpan des entêtes de groupe doit suivre le nombre de colonnes.
sub('''                        const span = multiSelectActive ? 5 : 4;''',
'''                        const span = multiSelectActive ? 6 : 5;''',
"2.span")

open(p, "w", encoding="utf-8").write(s)
print("  [2] Finder.tsx : entête Statut + colSpan ajusté OK")
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
git commit -m "feat(finder): status column in table view"
echo "OK — S3 commité."