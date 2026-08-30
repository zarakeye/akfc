#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE E1a : requirePermission(...) → isAdmin.
#
# Les 11 permissions étant toutes ADMIN-only, `requirePermission("x")` ≡ `isAdmin`.
# On remplace chaque site d'appel `.use(requirePermission("…"))` par `.use(isAdmin)`
# et on recompose l'import middleware de chaque fichier (retire requirePermission,
# ajoute isAdmin). Par REGEX → tolérant à la dérive, pas d'ancrage exact.
#
# L'export `requirePermission` reste dans middleware.ts (désormais inutilisé) — il
# sera retiré au dernier balayage, pour garder cette étape robuste et verte.
#
# Backend seul, typecheck backend.
#
# Usage : bash apply-auth-phaseE1a-requirepermission.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseE1a-requirepermission.sh   (clone)
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

python3 - <<'PY'
import re, pathlib

BACKEND = pathlib.Path("packages/backend/src")
MID = BACKEND / "trpc" / "middleware.ts"

call_re = re.compile(r'requirePermission\(\s*"[^"]+"\s*\)')
# import { ... } from "...middleware"
imp_re = re.compile(r'import\s*\{([^}]*)\}\s*from\s*("(?:[^"]*)middleware")\s*;')

def fix_import(m: "re.Match[str]") -> str:
    names = [n.strip() for n in m.group(1).split(",") if n.strip()]
    names = [n for n in names if n != "requirePermission"]
    if "isAdmin" not in names:
        names.append("isAdmin")
    return "import { " + ", ".join(names) + " } from " + m.group(2) + ";"

changed = []
for p in BACKEND.rglob("*.ts"):
    if p == MID:
        continue
    s = p.read_text(encoding="utf-8")
    if "requirePermission(" not in s:
        continue
    s2 = call_re.sub("isAdmin", s)
    if s2 == s:
        continue
    # recompose l'import depuis le middleware
    if imp_re.search(s2):
        s2 = imp_re.sub(fix_import, s2, count=1)
    else:
        print(f"!! {p}: pas d'import middleware détecté — à vérifier à la main")
    p.write_text(s2, encoding="utf-8")
    n = len(call_re.findall(s))
    changed.append((str(p), n))

if not changed:
    print("aucun site requirePermission — déjà migré ?")
else:
    tot = sum(n for _, n in changed)
    print(f"{tot} sites requirePermission → isAdmin, sur {len(changed)} fichiers :")
    for path, n in changed:
        print(f"  {n:>3}  {path}")

# garde-fou : plus aucun appel requirePermission ne doit subsister (hors middleware.ts)
residual = []
for p in BACKEND.rglob("*.ts"):
    if p == MID:
        continue
    if "requirePermission(" in p.read_text(encoding="utf-8"):
        residual.append(str(p))
if residual:
    print("ATTENTION, appels restants :", residual)
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(auth): phase E1a — requirePermission(...) remplacé par isAdmin (97 sites)" \
  && echo "commit $(git rev-parse --short HEAD)"