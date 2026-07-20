#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 6 — VAGUE A : retrait du paramètre `adapter` MORT de useStatusChange.
#
# Depuis le flip (étape 3), useStatusChange n'utilise plus `adapter` (0 usage
# de `adapter.` dans son corps). Le paramètre et sa prop en cascade sont du
# code mort. On les retire, du hook jusqu'au JSX de Finder.
#
# Chaîne (bornée, vérifiée) :
#   useStatusChange(adapter)  → useStatusChange()
#   StatusRadioGroup prop      → retirée
#   Finder.tsx <StatusRadioGroup adapter={adapter}> → adapter retiré
# Finder garde `adapter` (7 autres usages) — on ne touche qu'à cette prop.
#
# Retrait pur : le test n'est pas « ça marche » mais « rien n'a bougé ». Le
# typecheck est le juge — il signalera tout usage résiduel qu'on aurait raté.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HOOK="apps/web/src/features/finder-core/hooks/useStatusChange.ts"
RADIO="apps/web/src/features/finder-core/components/StatusRadioGroup.tsx"
FINDER="apps/web/src/features/finder-core/components/Finder.tsx"

for f in "$HOOK" "$RADIO" "$FINDER"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done
grep -q "trpc.media.setStatus.useMutation" "$HOOK" \
  || { echo "✗ le flip (étape 3) n'est pas en place — abandon."; exit 1; }

# Garde anti-double : si la signature n'a plus d'adapter, c'est déjà fait.
if grep -q "export function useStatusChange()" "$HOOK"; then
  echo "→ paramètre adapter déjà retiré, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def sub(path, old, new, label):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    assert src.count(old) == 1, f"[{label}] ancre trouvee {src.count(old)} fois, attendu 1"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

HOOK   = "apps/web/src/features/finder-core/hooks/useStatusChange.ts"
RADIO  = "apps/web/src/features/finder-core/components/StatusRadioGroup.tsx"
FINDER = "apps/web/src/features/finder-core/components/Finder.tsx"

# ── 1) le hook : signature ──────────────────────────────────────────────────
sub(HOOK,
    "export function useStatusChange(adapter: FileAdapter): {",
    "export function useStatusChange(): {",
    "useStatusChange : signature sans adapter")

# L'import FileAdapter devient orphelin dans le hook. On le retire du import.
# Deux formes possibles — on tente la plus courante, sinon on signale.
hook = pathlib.Path(HOOK)
src = hook.read_text(encoding="utf-8")
if "FileAdapter" in src:
    # retire FileAdapter d'une liste d'import { A, FileAdapter, B }
    import re
    before = src
    # cas : "{ FileAdapter, X }" ou "{ X, FileAdapter }" ou "{ FileAdapter }"
    src = re.sub(r"FileAdapter,\s*", "", src)
    src = re.sub(r",\s*FileAdapter", "", src)
    src = re.sub(r"import\s+type\s*\{\s*\}\s*from[^\n]*\n", "", src)  # import vide
    if src != before:
        hook.write_text(src, encoding="utf-8")
        print("  ✓ useStatusChange : import FileAdapter retiré")
    else:
        print("  ⚠ useStatusChange : FileAdapter encore présent — à retirer à la main si tsc râle")

# ── 2) StatusRadioGroup : prop + appel ──────────────────────────────────────
sub(RADIO,
    "  const { setStatus, isPending, error } = useStatusChange(adapter);",
    "  const { setStatus, isPending, error } = useStatusChange();",
    "StatusRadioGroup : appel sans adapter")

# retire la prop de la signature du composant
radio = pathlib.Path(RADIO)
src = radio.read_text(encoding="utf-8")
import re
before = src
src = src.replace("  adapter,\n", "", 1)          # destructuration
src = src.replace("  adapter: FileAdapter;\n", "", 1)  # type de la prop
# import FileAdapter orphelin
src = re.sub(r"FileAdapter,\s*", "", src)
src = re.sub(r",\s*FileAdapter", "", src)
src = re.sub(r"import\s+type\s*\{\s*\}\s*from[^\n]*\n", "", src)
assert src != before, "[StatusRadioGroup] aucune prop adapter retirée — ancre à revoir"
radio.write_text(src, encoding="utf-8")
print("  ✓ StatusRadioGroup : prop adapter retirée")

# ── 3) Finder.tsx : le JSX ──────────────────────────────────────────────────
sub(FINDER,
    """                  <StatusRadioGroup
                    adapter={adapter}
                    selectedNodes={selectedNodes}
                  />""",
    """                  <StatusRadioGroup
                    selectedNodes={selectedNodes}
                  />""",
    "Finder.tsx : prop adapter retirée du JSX")
PYEOF

echo
echo "→ contrôle : plus aucun 'adapter' lié à useStatusChange"
grep -n "useStatusChange(adapter)" "$RADIO" && { echo "  ✗ appel non nettoyé"; exit 1; } || true
echo "  ✓ propre"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "refactor(finder): retire le parametre adapter mort de useStatusChange (etape 6, vague A)"
echo "✓ commité."