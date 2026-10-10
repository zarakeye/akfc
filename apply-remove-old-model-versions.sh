#!/usr/bin/env bash
# AKFC — Suppression des anciennes versions des modèles (hors schema.prisma, qui n'en contient pas)
# et des titres vestiges du schéma.
#  - prisma/DOMAIN.md      : ancien modèle de domaine (Stage, StageSession…), contredit par le schéma documenté
#  - .prisma/              : seed compilé + ANCIEN client Prisma généré (modèles Role, Permission…)
#  - prisma/seed.js.bak    : ancien seed (prisma.role, prisma.permission, prisma.cloudinaryFolder)
#  - package.json          : "prisma.seed" pointait vers prisma/seed.js, qui n'existe pas
#  - schema.prisma         : titres vestiges (« À coller dans prisma/schema.prisma… », « 2) Nouveaux modèles. »…)
# GARDES : aucune référence aux fichiers supprimés (revérifié), schéma : code identique hors commentaires,
# prisma validate, pnpm check. Échec → tout est restauré. Suppressions par git rm (réversibles).
# Usage : bash apply-remove-old-model-versions.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
S="prisma/schema.prisma"
DEAD=(prisma/DOMAIN.md .prisma prisma/seed.js.bak)

TODO=0; for f in "${DEAD[@]}"; do [ -e "$f" ] && TODO=1; done
grep -q "À coller dans prisma/schema.prisma" "$S" && TODO=1
grep -q '"seed": "node prisma/seed.js"' package.json && TODO=1
[ "$TODO" = 0 ] && { echo "— déjà appliqué"; exit 0; }

echo "== GARDES : aucune référence aux fichiers morts =="
fail(){ echo "  ❌ $1"; echo "ARRÊT — rien n'a été modifié."; exit 1; }
for pat in "DOMAIN\.md" "seed-dist" "\.prisma/" "seed\.js\.bak"; do
  hits=$(grep -rnE "$pat" --include=*.ts --include=*.tsx --include=*.js --include=*.mjs --include=*.cjs --include=*.json --include=*.yml --include=*.yaml --include=Dockerfile --include=*.md --include=*.toml . 2>/dev/null \
    | grep -v node_modules | grep -vE "^\./prisma/DOMAIN\.md:|^\./\.prisma/" || true)
  [ -z "$hits" ] || fail "référence trouvée pour « $pat » :
$hits"
done
[ -e prisma/seed.js ] && fail "prisma/seed.js existe : la déclaration de seed n'est pas morte"
echo "  ✅ aucune référence"

BK=/tmp/akfc_oldver_backup; rm -rf "$BK"; mkdir -p "$BK"; cp "$S" "$BK/schema.prisma"; cp package.json "$BK/package.json"
restore(){ cp "$BK/schema.prisma" "$S"; cp "$BK/package.json" package.json; git checkout -q HEAD -- "${DEAD[@]}" 2>/dev/null || true; echo "↩ tout est restauré (aucun commit)."; }

echo "== suppressions =="
for f in "${DEAD[@]}"; do
  if [ -e "$f" ]; then git rm -rq "$f" 2>/dev/null || rm -rf "$f"; echo "  ok  supprimé : $f"; fi
done

python3 - "$S" <<'PY' || { restore; exit 1; }
import sys, json, pathlib
S = sys.argv[1]
# package.json : bloc "prisma" qui ne contient QUE le seed mort
p = pathlib.Path("package.json"); d = json.loads(p.read_text(encoding="utf-8"))
if d.get("prisma") == {"seed": "node prisma/seed.js"}:
    raw = p.read_text(encoding="utf-8")
    import re
    raw2, n = re.subn(r'\n\s*"prisma":\s*\{\s*"seed":\s*"node prisma/seed\.js"\s*\},?', "", raw)
    assert n == 1, f"package.json : bloc prisma ×{n}"
    json.loads(raw2)  # doit rester du JSON valide
    p.write_text(raw2, encoding="utf-8"); print("  ok  package.json : déclaration de seed morte retirée")
elif "prisma" in d:
    print(f"  — package.json : bloc prisma différent de prévu ({d['prisma']}), laissé intact")
# schéma : titres vestiges
s = pathlib.Path(S).read_text(encoding="utf-8")
def rep(old, new, label):
    global s
    n = s.count(old)
    if n == 0: print(f"  — {label} : déjà propre"); return
    assert n == 1, f"{label} : ancre ×{n}"
    s = s.replace(old, new); print(f"  ok  {label}")
rep("// ─────────────────────────────────────────────────────────────────────────\n//  AJOUTS AU SCHÉMA — feature Galerie/Carousel\n//  À coller dans prisma/schema.prisma (à la racine du monorepo).\n// ─────────────────────────────────────────────────────────────────────────\n",
    "// ============================================================================\n// GALERIES\n// ============================================================================\n", "titre « À coller… » → GALERIES")
rep("// 2) Nouveaux modèles.\n\n", "", "« 2) Nouveaux modèles. » retiré")
rep("// OCCURRENCES\n", "// COURS ET SÉMINAIRES\n", "« OCCURRENCES » → COURS ET SÉMINAIRES")
rep("// POSTS / COMMENTS / LIKES\n", "// MUR : POSTS, COMMENTAIRES, RÉACTIONS, SONDAGES\n", "« POSTS / COMMENTS / LIKES » → MUR")
pathlib.Path(S).write_text(s, encoding="utf-8")
PY

echo "== PREUVE : schéma sans commentaires identique =="
python3 - "$BK/schema.prisma" "$S" <<'PY' || { restore; exit 1; }
import sys
def code(path):
    out = []
    for line in open(path, encoding="utf-8"):
        res, q, i = [], False, 0
        while i < len(line):
            c = line[i]
            if c == '"' and (i == 0 or line[i-1] != "\\"): q = not q
            if not q and line.startswith("//", i): break
            res.append(c); i += 1
        t = " ".join("".join(res).split())
        if t: out.append(t)
    return out
a, b = code(sys.argv[1]), code(sys.argv[2])
if a != b: print("  ❌ le code du schéma a changé"); sys.exit(1)
print(f"  ✅ {len(a)} lignes de code strictement identiques")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
PRISMA(){ pnpm exec prisma "$@" 2>/dev/null || pnpm --filter @workspace/backend exec prisma "$@"; }
PRISMA validate --schema "$S" > /tmp/akfc_v.log 2>&1 || { tail -6 /tmp/akfc_v.log; restore; exit 1; }
echo "  ✅ prisma validate"
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -12; restore; exit 1; fi
echo "  ✅ check OK"
git add -A
git commit -m "chore: supprime les anciennes versions des modèles (DOMAIN.md, .prisma/seed-dist, seed.js.bak), seed mort de package.json, titres vestiges du schéma" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }