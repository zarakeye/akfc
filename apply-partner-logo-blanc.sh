#!/usr/bin/env bash
# Logos des partenaires (pied de page, page « S'inscrire ») : pastille TOUJOURS blanche.
# `bg-white` est réorienté vers un fond sombre en mode sombre par styles/dark-legacy.css ;
# `bg-[#fff]` ne l'est pas. Gère les deux états du fichier (bg-white d'origine, ou bg-[#fff]
# déjà modifié à la main sans commit) et ajoute un commentaire qui explique le choix.
# Usage (racine du repo) : bash apply-partner-logo-blanc.sh   puis git push, pull et rebuild sur le serveur.
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
F="apps/web/src/features/partners/PartnerLogo.tsx"
if git show HEAD:"$F" 2>/dev/null | grep -qF "pas bg-white : réorienté"; then echo "Déjà appliqué (commité)."; exit 0; fi
restore(){ git checkout -q -- "$F" 2>/dev/null || true; echo "  ↩ fichier restauré"; }
trap 'restore' ERR

python3 - "$F" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
line_old = None
for cand in ("rounded-md bg-white p-2 shadow-sm ring-1 ring-black/5", "rounded-md bg-[#fff] p-2 shadow-sm ring-1 ring-black/5"):
    if s.count(cand) == 1:
        line_old = cand
assert line_old, "classe de la pastille introuvable"
anchor = "  const inner = (\n"
assert s.count(anchor) == 1, "ancre « const inner » introuvable"
s = s.replace(line_old, "rounded-md bg-[#fff] p-2 shadow-sm ring-1 ring-black/5")
s = s.replace(anchor, "  // Pastille blanche dans les deux thèmes : `bg-[#fff]` et pas bg-white : réorienté vers un fond\n  // sombre en mode sombre par styles/dark-legacy.css, il rendrait les logos (texte sombre) illisibles.\n" + anchor)
open(p, "w", encoding="utf-8").write(s)
print("  édit ok")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== typecheck =="
if ! pnpm typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS" /tmp/akfc_tc.log | head -10; restore; exit 1
fi
echo "  ✅ typecheck OK"
git add "$F"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD) — reste : git push, puis sur le serveur git pull + docker compose up -d --build akfc" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(partners): pastille des logos blanche aussi en mode sombre

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG