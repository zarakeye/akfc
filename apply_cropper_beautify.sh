#!/usr/bin/env bash
#
# AKFC — Cropper : lifting léger des boutons et curseurs.
#
# Boutons cohérents avec l'identité du projet (emerald, arrondi) au lieu des
# couleurs ad hoc (bg-red-500 / bg-blue-600 / boutons nus) ; curseurs
# zoom/rotation stylés (`accent-emerald-600`) avec un libellé ; copie mise au
# français (« Cropper » → « Recadrer », « Reset all » → « Tout réinitialiser »,
# « undo/reset » → « Défaire/Réinit. »).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-cropper-beautify.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-cropper-beautify.sh
#
set -euo pipefail

SVC="apps/web/src/features/gallery-crop/components/Cropper.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "accent-emerald-600" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

edits = []

# ── Groupe Zoom ─────────────────────────────────────────────────────────────
edits.append(('''          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.01}
              value={zoom.value}
              onMouseDown={zoom.startInteraction}
              onMouseUp={zoom.endInteraction}
              onChange={(e) => zoom.set(Number(e.target.value))}
            />
            <button type="button" onClick={zoom.undo}>
              undo
            </button>
            <button type="button" onClick={zoom.reset}>
              reset
            </button>
          </div>''',
'''          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs font-medium text-gray-500">
              Zoom
            </span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.01}
              value={zoom.value}
              onMouseDown={zoom.startInteraction}
              onMouseUp={zoom.endInteraction}
              onChange={(e) => zoom.set(Number(e.target.value))}
              className="h-1.5 w-36 cursor-pointer accent-emerald-600"
            />
            <button
              type="button"
              onClick={zoom.undo}
              className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
            >
              Défaire
            </button>
            <button
              type="button"
              onClick={zoom.reset}
              className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
            >
              Réinit.
            </button>
          </div>'''))

# ── Groupe Rotation ─────────────────────────────────────────────────────────
edits.append(('''          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation.value}
              onMouseDown={rotation.startInteraction}
              onMouseUp={rotation.endInteraction}
              onChange={(e) => rotation.set(Number(e.target.value))}
            />
            <button type="button" onClick={rotation.undo}>
              undo
            </button>
            <button type="button" onClick={rotation.reset}>
              reset
            </button>
          </div>''',
'''          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs font-medium text-gray-500">
              Rotation
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation.value}
              onMouseDown={rotation.startInteraction}
              onMouseUp={rotation.endInteraction}
              onChange={(e) => rotation.set(Number(e.target.value))}
              className="h-1.5 w-36 cursor-pointer accent-emerald-600"
            />
            <button
              type="button"
              onClick={rotation.undo}
              className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
            >
              Défaire
            </button>
            <button
              type="button"
              onClick={rotation.reset}
              className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
            >
              Réinit.
            </button>
          </div>'''))

# ── Reset all ───────────────────────────────────────────────────────────────
edits.append(('''          <button
            onClick={resetAll}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Reset all
          </button>''',
'''          <button
            type="button"
            onClick={resetAll}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Tout réinitialiser
          </button>'''))

# ── Annuler ─────────────────────────────────────────────────────────────────
edits.append(('''          <button type="button" onClick={onCancel}>
            Annuler
          </button>''',
'''          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Annuler
          </button>'''))

# ── Recadrer (ex « Cropper ») ───────────────────────────────────────────────
edits.append(('''          <button
            type="button"
            onClick={handleCrop}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Cropper
          </button>''',
'''          <button
            type="button"
            onClick={handleCrop}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Recadrer
          </button>'''))

for old, new in edits:
    assert s.count(old) == 1, f"ancre introuvable/multiple — abandon :\n{old[:70]}"
    s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("patch Cropper OK (boutons + curseurs embellis)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "style(cropper): boutons cohérents (emerald/arrondi) + curseurs stylés + copie FR" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi