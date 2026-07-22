#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FIX rename — `adapter.move` est OPTIONNEL dans l'interface de l'adapter
# (comme `getNode?`), donc TypeScript refuse l'appel direct :
#     TS2722: Cannot invoke an object which is possibly 'undefined'.
#
# On ajoute la garde d'existence, symétrique de celle déjà posée sur getNode.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine."; exit 1; }
grep -q "rename: protectedProcedure" "$ROUTER" || { echo "✗ storage.rename absent — applique d'abord step_rename_backend.sh."; exit 1; }

if grep -q "ne supporte pas le déplacement" "$ROUTER"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/storage/router.ts")
src = p.read_text(encoding="utf-8")

OLD = """      await adapter.move({
        source: { type: input.type, path: input.path },
        target: { path: targetPath },
      });"""

NEW = """      // `move` est optionnel sur l'interface d'adapter : on garde avant
      // d'appeler, comme pour `getNode` plus haut.
      if (!adapter.move) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Ce provider ne supporte pas le déplacement.",
        });
      }

      await adapter.move({
        source: { type: input.type, path: input.path },
        target: { path: targetPath },
      });"""

n = src.count(OLD)
assert n == 1, f"ancre adapter.move trouvee {n}x, attendu 1"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("  ✓ garde ajoutée sur adapter.move")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi
git add -A && git commit -m "feat(storage): procedure rename (move vers le meme dossier)"
echo "✓ commité."