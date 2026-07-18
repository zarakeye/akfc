#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RÉPARATION 4b : l'import manquant `buildUploadFileName` dans le routeur.
#
# Le script 4b a détecté à tort que l'import existait (il confondait l'USAGE,
# fraîchement inséré, avec un IMPORT) et l'a omis → TS2304. Et son garde de
# commit a laissé passer un commit sur typecheck rouge. Ce script répare les
# deux : il ajoute l'import, et son propre garde bloque VRAIMENT le commit si
# le typecheck échoue.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
NAMER="packages/backend/src/modules/storage/services/buildUploadFileName.service.ts"

test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine du repo."; exit 1; }
test -f "$NAMER"  || { echo "✗ $NAMER absent — le script 4b n'a pas tourné."; exit 1; }
grep -q "buildUploadFileName(input.originalFileName)" "$ROUTER" \
  || { echo "✗ l'usage de buildUploadFileName est absent — état inattendu, ne rien forcer."; exit 1; }

# ── Garde anti-double-application : un IMPORT (pas un simple usage) ──────────
if grep -qE "^import .*buildUploadFileName" "$ROUTER"; then
  echo "→ import déjà présent, rien à réparer côté import."
else
  python3 - <<'PYEOF'
import pathlib
p = pathlib.Path("packages/backend/src/modules/storage/router.ts")
src = p.read_text(encoding="utf-8")
lines = src.split("\n")

IMPORT = "import { buildUploadFileName } from '@backend/modules/storage/services/buildUploadFileName.service';"

# La condition correcte : une LIGNE qui importe le symbole, pas sa présence.
already = any(l.startswith("import") and "buildUploadFileName" in l for l in lines)
assert not already, "import deja present — le grep aurait du l'attraper"

# On l'insère juste après l'import de resolvePendingUploadFolder (même famille).
anchor = next(
    (i for i, l in enumerate(lines)
     if l.startswith("import") and "resolvePendingUploadFolder" in l),
    None,
)
if anchor is None:
    anchor = max(i for i, l in enumerate(lines) if l.startswith("import "))
lines.insert(anchor + 1, IMPORT)
p.write_text("\n".join(lines), encoding="utf-8")
print("  ✓ import buildUploadFileName ajouté")
PYEOF
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

# ── Garde de commit RÉPARÉ : chaque typecheck bloque, séparément ────────────
# (l'ancienne forme `A && B && commit` a laissé passer un rouge ; ici chaque
#  étape est testée pour de bon, et le commit n'est atteint que si les deux
#  sortent 0.)
echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend ROUGE — aucun commit."
  exit 1
fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then
  echo "✗ typecheck racine ROUGE — aucun commit."
  exit 1
fi

git add -A && git commit -m "fix(storage): import manquant buildUploadFileName (repare 4b)"
echo "✓ commité — cette fois sur du vert."