#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FIX déplacement — `storage.move` attend l'intention ENVELOPPÉE :
#     { intent: { source, target }, provider?, logical? }
# et non `{ source, target }` à plat. D'où :
#     TS2353: 'source' does not exist in type '{ intent: {...}; ... }'
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HOOK="apps/web/src/features/finder-core/hooks/useNodeActions.ts"
test -f "$HOOK" || { echo "✗ $HOOK introuvable — lance depuis la racine."; exit 1; }
grep -q "moveMutation" "$HOOK" || { echo "✗ moveNodes absent — applique d'abord step_move_action.sh."; exit 1; }

if grep -q "intent: {" "$HOOK"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("apps/web/src/features/finder-core/hooks/useNodeActions.ts")
src = p.read_text(encoding="utf-8")

OLD = """        await moveMutation.mutateAsync({
          source,
          target: { type: 'folder', path: destination },
        });"""

NEW = """        await moveMutation.mutateAsync({
          intent: {
            source,
            target: { type: 'folder', path: destination },
          },
        });"""

n = src.count(OLD)
assert n == 1, f"ancre mutateAsync move trouvee {n}x, attendu 1"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("  ✓ payload enveloppé dans `intent`")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): action Deplacer avec selection du dossier de destination"
echo "✓ commité."