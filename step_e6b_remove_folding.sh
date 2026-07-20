#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 6 — VAGUE B (cœur) : retirer StatusFoldingReadView des 4 lectures.
#
# Le pliage interrogeait 3 chemins physiques (P, P/pending, P/published) et
# fusionnait. Depuis la migration, tout est à plat sous P : les 2 strates sont
# vides, le merge ne sert plus à rien. On remplace `reader = logical ? fold :
# backend` par `reader = backend` sur les 4 procédures de lecture.
#
# ─── Pourquoi c'est SÛR (audité) ─────────────────────────────────────────────
#
#   - tout le contenu est à plat (32 assets vérifiés) → rien à fusionner ;
#   - le front envoie des chemins logiques = physiques (plats) → backend.list
#     les trouve directement ;
#   - setStatus utilise storagePathOf(node), qui a le fallback `?? node.path` :
#     même sans le pliage remplissant meta.storagePath, il renvoie node.path
#     (plat = correct). Le code avait PRÉVU ce jour (doc "transitoire, étape 5").
#
# On NE touche PAS : le flag `logical` (toléré/ignoré ce tour), le move
# (toPhysicalMoveIntents, ligne 319 = vague C), les 8 sites front.
#
# Retrait de code — juge = typecheck. À lancer depuis la RACINE du repo.
# AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine."; exit 1; }

# Garde anti-double : si plus aucun 'reader = input.logical', c'est fait.
if ! grep -q "const reader = input.logical" "$ROUTER"; then
  echo "→ pliage déjà retiré des lectures, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/storage/router.ts")
src = p.read_text(encoding="utf-8")

# Les 4 blocs de lecture sont identiques mot pour mot. On les remplace TOUS.
OLD = """      const reader = input.logical
        ? new StatusFoldingReadView(backend, ctx.appRoot)
        : backend;"""

NEW = """      // Pliage retiré (étape 6) : les binaires sont à plat, plus de strate à
      // fusionner. On lit directement le backend. Le flag `logical` est
      // désormais sans effet sur la lecture.
      const reader = backend;"""

count = src.count(OLD)
assert count == 4, f"attendu 4 blocs de lecture identiques, trouvé {count}"
src = src.replace(OLD, NEW)
print(f"  ✓ {count} lectures débranchées du pliage")

# L'import StatusFoldingReadView devient orphelin : le move (ligne ~319)
# utilise toPhysicalMoveIntents, pas cette classe. Les seules occurrences
# restantes sont l'import + des commentaires. On vérifie qu'aucun USAGE
# de code ne subsiste (new StatusFoldingReadView), puis on retire l'import.
usage = src.count("new StatusFoldingReadView")
assert usage == 0, f"StatusFoldingReadView encore INSTANCIÉ {usage}x — retrait de l'import annulé"
import_line = "import { StatusFoldingReadView } from \"@backend/modules/storage/statusFoldingReadView\";\n"
if import_line in src:
    src = src.replace(import_line, "")
    print("  ✓ import StatusFoldingReadView retiré (plus aucun usage, seulement des commentaires)")

p.write_text(src, encoding="utf-8")
PYEOF

echo
echo "→ contrôle : plus de 'reader = input.logical' dans les lectures"
if grep -q "const reader = input.logical" "$ROUTER"; then
  echo "  ✗ il en reste"; exit 1
fi
echo "  ✓ propre"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "refactor(storage): retire StatusFoldingReadView des lectures — chemins plats (etape 6, vague B)"
echo "✓ commité."