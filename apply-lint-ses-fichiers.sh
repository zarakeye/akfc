#!/usr/bin/env bash
# Lint : les deux problèmes présents dans TON repo seulement (fichiers venus d'autres sessions),
# qui bloquent apply-lint-passe-2.sh. À lancer AVANT de relancer apply-lint-passe-2.sh.
#  1. Footer.tsx : la requête `const disciplines = …` n'est plus utilisée → retirée, SI le nom
#     n'est employé nulle part ailleurs dans le fichier (sinon le script s'arrête sans rien toucher).
#  2. OnlineConsentForm.tsx : le lien vers /api/media/image-consent/prefilled télécharge un PDF
#     servi par une route d'API ; ce n'est pas une page, <Link> ne convient pas → exception
#     justifiée pour la règle @next/next/no-html-link-for-pages.
# Usage (racine du repo) : bash apply-lint-ses-fichiers.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
FOOTER="apps/web/src/features/app-shell/Footer.tsx"
CONSENT="apps/web/src/features/image-consent/OnlineConsentForm.tsx"
restore(){ git checkout -q -- "$FOOTER" "$CONSENT" 2>/dev/null || true; echo "  ↩ fichiers restaurés"; }
trap 'restore' ERR

python3 - "$FOOTER" "$CONSENT" <<'PY'
import re, sys
footer, consent = sys.argv[1], sys.argv[2]

# 1. Footer : retirer `const disciplines = …;` (instruction complète, parenthèses équilibrées).
s = open(footer, encoding="utf-8").read()
m = re.search(r"\n([ \t]*)const disciplines\s*=", s)
if m:
    start = m.start() + 1
    depth, i = 0, m.end()
    while i < len(s):
        c = s[i]
        if c in "([{": depth += 1
        elif c in ")]}": depth -= 1
        elif c == ";" and depth == 0: break
        i += 1
    assert i < len(s), "fin de l'instruction `const disciplines` introuvable"
    end = i + 1
    if end < len(s) and s[end] == "\n": end += 1
    rest = s[:start] + s[end:]
    # Les usages en commentaire (`{/* {disciplines.map(…)} */}`, `// …`) ne comptent pas.
    live = re.sub(r"\{/\*[\s\S]*?\*/\}|/\*[\s\S]*?\*/|//[^\n]*", "", rest)
    uses = re.findall(r"\{disciplines\b|\bdisciplines\s*[.\[?)]|\(disciplines\b|=\s*disciplines\b", live)
    assert not uses, f"`disciplines` est encore utilisé ailleurs ({uses[:3]}) : rien n'est retiré"
    # Le commentaire qui la présentait juste au-dessus (lignes `//` contiguës) part avec elle.
    before = rest[:start].rstrip("\n").split("\n")
    while before and before[-1].strip().startswith("//"):
        before.pop()
    rest = "\n".join(before) + "\n" + rest[start:]
    # Le bloc « Nos disciplines » mis en commentaire dans le JSX reste ; une note dit quoi rétablir.
    marker = "{/* {disciplines.length > 0 && ("
    if marker in rest and "rétablir la requête `disciplines`" not in rest:
        j = rest.index(marker)
        ls = rest.rfind("\n", 0, j) + 1
        ind = rest[ls:j]
        rest = rest[:ls] + f"{ind}{{/* Bloc désactivé. Pour le réactiver, rétablir la requête `disciplines` retirée du haut du composant (voir l'historique git de ce fichier). */}}\n" + rest[ls:]
    print("  Footer : retiré →", " ".join(s[start:end].split())[:110], "…")
    open(footer, "w", encoding="utf-8").write(rest)
else:
    print("  Footer : pas de `const disciplines` (rien à faire)")

# 2. OnlineConsentForm : exception justifiée juste avant le lien.
s = open(consent, encoding="utf-8").read()
tag = '<a href="/api/media/image-consent/prefilled"'
assert s.count(tag) == 1, f"lien {tag} trouvé {s.count(tag)} fois"
if "no-html-link-for-pages" not in s:
    i = s.index(tag)
    line_start = s.rfind("\n", 0, i) + 1
    indent = s[line_start:i]
    note = (
        f"{indent}// Téléchargement d'un PDF servi par une route d'API, pas une page : <Link> (navigation\n"
        f"{indent}// côté client) ne convient pas, un vrai lien <a> si.\n"
        f"{indent}// eslint-disable-next-line @next/next/no-html-link-for-pages\n"
    )
    s = s[:line_start] + note + s[line_start:]
    open(consent, "w", encoding="utf-8").write(s)
    print("  OnlineConsentForm : exception justifiée ajoutée")
PY
trap - ERR

echo "== lint de ces deux fichiers =="
if ! (cd apps/web && npx eslint --max-warnings 0 "src/features/app-shell/Footer.tsx" "src/features/image-consent/OnlineConsentForm.tsx") > /tmp/akfc_l.log 2>&1; then
  echo "❌ encore des erreurs :"; grep -vE "^$" /tmp/akfc_l.log | head -12; restore; exit 1
fi
echo "  ✅ lint OK"
echo "== typecheck =="
if ! pnpm typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck :"; grep -nE "error TS" /tmp/akfc_tc.log | head -10; restore; exit 1
fi
echo "  ✅ typecheck OK"
git add "$FOOTER" "$CONSENT"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD) — relance maintenant : bash apply-lint-passe-2.sh" || { echo "commit KO"; tail -3 /tmp/c.log; }
chore(lint): requête inutilisée du pied de page, lien de téléchargement du formulaire pré-rempli

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG