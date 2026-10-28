#!/usr/bin/env bash
# LOGO un peu plus grand, contenants inchangés :
#   - header : logo ~+25 %, barre noire de MÊME hauteur (le rembourrage cède ce que le logo gagne) ;
#   - accueil : pastille noire de même taille, logo à 85 % de sa hauteur (avant 64-75 %) ; dessin du
#     logo mesuré : il ne toucherait le bord qu'au-delà de 96 % ; overflow-hidden en garantie.
# Usage (racine du repo) : bash apply-logo-size.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if grep -q "Pastille de taille INCHANG" "apps/web/src/app/(public)/page.tsx" 2>/dev/null; then echo "Déjà appliqué."; exit 0; fi
MODIFIED=("apps/web/src/features/app-shell/Header.tsx" "apps/web/src/app/(public)/page.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
trap 'restore' ERR


python3 - <<'PY'
import base64
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('apps/web/src/features/app-shell/Header.tsx', 'ICAgICAgICB7LyogVHJvaXMgcGFsaWVycyA6IGxlIGBweC0yMGAgZCdvcmlnaW5lIGNvw7t0YWl0IDE2MHB4IGRlIGNoYXF1ZQogICAgICAgICAgICBjw7R0w6ksIGNlIHF1ZSBsYSBiYXJyZSBuZSBwb3V2YWl0IHBhcyBzZSBwZXJtZXR0cmUgYXZhbnQgMTUzNnB4LiAqL30KICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iZmxleCBpdGVtcy1jZW50ZXIgcHgtNCBweS00IHhsOnB4LTYgeGw6cHktNiAyeGw6cHgtMjAgMnhsOnB5LTEwIj4KICAgICAgICAgIHtsb2dvVXJsID8gKAogICAgICAgICAgICAvLyBMb2dvIHBlcnNvbm5hbGlzw6kgKHLDqWdsYWdlcykg4oCUIDxpbWc+IHNpbXBsZSA6IFVSTCBkZSBwcm94eQo=',
    'ICAgICAgICB7LyogVHJvaXMgcGFsaWVycyA6IGxlIGBweC0yMGAgZCdvcmlnaW5lIGNvw7t0YWl0IDE2MHB4IGRlIGNoYXF1ZQogICAgICAgICAgICBjw7R0w6ksIGNlIHF1ZSBsYSBiYXJyZSBuZSBwb3V2YWl0IHBhcyBzZSBwZXJtZXR0cmUgYXZhbnQgMTUzNnB4LiAqL30KICAgICAgICB7LyogTG9nbyBhZ3JhbmRpICh+KzI1ICUpIFNBTlMgZ3JhbmRpciBsYSBiYXJyZSA6IGxlIHJlbWJvdXJyYWdlIHZlcnRpY2FsIGPDqGRlIGV4YWN0ZW1lbnQgY2UKICAgICAgICAgICAgcXVlIGxlIGxvZ28gZ2FnbmUgKGhhdXRldXIgZGUgYmFycmUgaW5jaGFuZ8OpZSA6IDkyIC8gMTEyIC8gMTgwIHB4IHNlbG9uIGxlIHBhbGllcikuICovfQogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IGl0ZW1zLWNlbnRlciBweC00IHB5LTIgeGw6cHgtNiB4bDpweS00IDJ4bDpweC0yMCAyeGw6cHktWzMwcHhdIj4KICAgICAgICAgIHtsb2dvVXJsID8gKAogICAgICAgICAgICAvLyBMb2dvIHBlcnNvbm5hbGlzw6kgKHLDqWdsYWdlcykg4oCUIDxpbWc+IHNpbXBsZSA6IFVSTCBkZSBwcm94eQo=')
sub('apps/web/src/features/app-shell/Header.tsx', 'ICAgICAgICAgICAgICBzcmM9e2xvZ29Vcmx9CiAgICAgICAgICAgICAgYWx0PXtgJHticmFuZH0gbG9nb2B9CiAgICAgICAgICAgICAgY2xhc3NOYW1lPSJoLTE1IHctYXV0byB4bDpoLTE2IDJ4bDpoLTI1IgogICAgICAgICAgICAvPgogICAgICAgICAgKSA6ICgK',
    'ICAgICAgICAgICAgICBzcmM9e2xvZ29Vcmx9CiAgICAgICAgICAgICAgYWx0PXtgJHticmFuZH0gbG9nb2B9CiAgICAgICAgICAgICAgY2xhc3NOYW1lPSJoLTE5IHctYXV0byB4bDpoLTIwIDJ4bDpoLTMwIgogICAgICAgICAgICAvPgogICAgICAgICAgKSA6ICgK')
sub('apps/web/src/features/app-shell/Header.tsx', 'ICAgICAgICAgICAgICBoZWlnaHQ9ezEwMH0KICAgICAgICAgICAgICBwcmlvcml0eQogICAgICAgICAgICAgIGNsYXNzTmFtZT0iaC0xNSB3LWF1dG8geGw6aC0xNiAyeGw6aC0yNSIKICAgICAgICAgICAgLz4KICAgICAgICAgICl9Cg==',
    'ICAgICAgICAgICAgICBoZWlnaHQ9ezEwMH0KICAgICAgICAgICAgICBwcmlvcml0eQogICAgICAgICAgICAgIGNsYXNzTmFtZT0iaC0xOSB3LWF1dG8geGw6aC0yMCAyeGw6aC0zMCIKICAgICAgICAgICAgLz4KICAgICAgICAgICl9Cg==')
sub('apps/web/src/app/(public)/page.tsx', 'ICAgICAgICAgICAgTGUgZGlzcXVlIChyb3VuZGVkLWZ1bGwgKyBiZy1ibGFjaykgZmFpdCBjYWRyZSA7IGxlIHBhZGRpbmcgZG9ubmUKICAgICAgICAgICAgbCdpbXByZXNzaW9uIHF1ZSBsZSBsb2dvIHMnaW5zY3JpdCBkZWRhbnMuICovfQogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJteC1hdXRvIG1iLTYgaC04MCB3LTgwIHJvdW5kZWQtZnVsbCBiZy1ibGFjayBwLTEwIHNtOmgtNTYgc206dy01NiBsZzpoLTgwIGxnOnctODAiPgogICAgICAgICAge3NpdGVTZXR0aW5ncz8ubG9nb0tleSA/ICgKICAgICAgICAgICAgLy8gbG9nbyBjdXN0b20gKFVSTCBkeW5hbWlxdWUgUjIpCg==',
    'ICAgICAgICAgICAgTGUgZGlzcXVlIChyb3VuZGVkLWZ1bGwgKyBiZy1ibGFjaykgZmFpdCBjYWRyZSA7IGxlIHBhZGRpbmcgZG9ubmUKICAgICAgICAgICAgbCdpbXByZXNzaW9uIHF1ZSBsZSBsb2dvIHMnaW5zY3JpdCBkZWRhbnMuICovfQogICAgICAgIHsvKiBQYXN0aWxsZSBkZSB0YWlsbGUgSU5DSEFOR8OJRSA7IGxlIGxvZ28geSBvY2N1cGUgODUgJSBkZSBsYSBoYXV0ZXVyIChhdmFudCA6IDY0IMOgIDc1ICUpLgogICAgICAgICAgICBNZXN1csOpIHN1ciAvQUtGQ19sb2dvLnN2ZyA6IHRvdXQgc29uIGRlc3NpbiB0aWVudCBkYW5zIHVuIGNlcmNsZSBkZSAwLDUyIMOXIHNhIGhhdXRldXIKICAgICAgICAgICAgYXV0b3VyIGRlIHNvbiBjZW50cmUg4oaSIGTDqWJvcmRlbWVudCBzZXVsZW1lbnQgYXUtZGVsw6AgZGUgOTYgJS4gTWFyZ2UgZ2FyZMOpZSwgZXQKICAgICAgICAgICAgYG92ZXJmbG93LWhpZGRlbmAgZ2FyYW50aXQgZW4gcGx1cyBxdSd1biBsb2dvIHBlcnNvbm5hbGlzw6kgbmUgZMOpcGFzc2UgamFtYWlzLiAqL30KICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ibXgtYXV0byBtYi02IGZsZXggaC04MCB3LTgwIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBvdmVyZmxvdy1oaWRkZW4gcm91bmRlZC1mdWxsIGJnLWJsYWNrIHNtOmgtNTYgc206dy01NiBsZzpoLTgwIGxnOnctODAiPgogICAgICAgICAge3NpdGVTZXR0aW5ncz8ubG9nb0tleSA/ICgKICAgICAgICAgICAgLy8gbG9nbyBjdXN0b20gKFVSTCBkeW5hbWlxdWUgUjIpCg==')
sub('apps/web/src/app/(public)/page.tsx', 'ICAgICAgICAgICAgICBzcmM9e2hlcm9Mb2dvU3JjfQogICAgICAgICAgICAgIGFsdD17YCR7c2l0ZVNldHRpbmdzPy5zaG9ydFRpdGxlID8/ICJBS0ZDIn0gbG9nb2B9CiAgICAgICAgICAgICAgY2xhc3NOYW1lPSJoLWZ1bGwgdy1mdWxsIG9iamVjdC1jb250YWluIgogICAgICAgICAgICAvPgogICAgICAgICAgKSA6ICgK',
    'ICAgICAgICAgICAgICBzcmM9e2hlcm9Mb2dvU3JjfQogICAgICAgICAgICAgIGFsdD17YCR7c2l0ZVNldHRpbmdzPy5zaG9ydFRpdGxlID8/ICJBS0ZDIn0gbG9nb2B9CiAgICAgICAgICAgICAgY2xhc3NOYW1lPSJoLVs4NSVdIHctWzg1JV0gb2JqZWN0LWNvbnRhaW4iCiAgICAgICAgICAgIC8+CiAgICAgICAgICApIDogKAo=')
sub('apps/web/src/app/(public)/page.tsx', 'ICAgICAgICAgICAgICBoZWlnaHQ9ezI1MH0KICAgICAgICAgICAgICBwcmlvcml0eQogICAgICAgICAgICAgIGNsYXNzTmFtZT0iaC1mdWxsIHctZnVsbCBvYmplY3QtY29udGFpbiIKICAgICAgICAgICAgLz4KICAgICAgICAgICl9Cg==',
    'ICAgICAgICAgICAgICBoZWlnaHQ9ezI1MH0KICAgICAgICAgICAgICBwcmlvcml0eQogICAgICAgICAgICAgIGNsYXNzTmFtZT0iaC1bODUlXSB3LVs4NSVdIG9iamVjdC1jb250YWluIgogICAgICAgICAgICAvPgogICAgICAgICAgKX0K')
print("  édits ok (6 substitutions, 0 fichiers créés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1
fi
echo "  ✅ check OK"
git add "${MODIFIED[@]}" "${CREATED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
style(logo): logo plus grand dans le header et la pastille de l'accueil

Header : logo ~+25 % à hauteur de barre constante (rembourrage réduit
d'autant). Accueil : pastille noire inchangée, logo à 85 % de sa hauteur
(dessin mesuré : contact avec le bord seulement au-delà de 96 %),
overflow-hidden en garantie pour un logo personnalisé.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Vérifier le header et la pastille de l'accueil (Cmd+Maj+R), en largeur téléphone et ordinateur."