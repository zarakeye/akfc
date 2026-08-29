#!/usr/bin/env bash
#
# AKFC — Réorg header (1/n) : Dashboard sort de la barre → dropdown avatar (admin).
#
# Dashboard est réservé ADMIN et déjà accessible via l'icône disque dur. On le
# retire de la barre publique et on le met dans le menu avatar, conditionné au
# rôle admin (second accès pratique, et rangé avec les destinations « compte »).
#
#   1. navEntries.ts — retire l'entrée { href:"/dashboard", label:"Dashboard" }.
#   2. UserMenu.tsx  — `isAdmin` + lien « Dashboard » affiché si admin, après
#                      « Mon profil ».
#
# 2 fichiers front, typecheck web.
#
# Usage : bash apply-header-1-dashboard-to-usermenu.sh
#         AKFC_APPLY_ONLY=1 bash apply-header-1-dashboard-to-usermenu.sh   (clone)
#
set -euo pipefail

NAV="apps/web/src/features/app-shell/navEntries.ts"
MENU="apps/web/src/features/app-shell/UserMenu.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$NAV" ]         || { echo "ERREUR: $NAV introuvable." >&2; exit 1; }
[ -f "$MENU" ]        || { echo "ERREUR: $MENU introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. navEntries : retirer Dashboard de la barre ────────────────────────────
python3 - "$NAV" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
line = '  { kind: "link", href: "/dashboard", label: "Dashboard", requiresUser: true },\n'
if line not in s:
    print("Dashboard déjà absent de navEntries"); sys.exit(0)
assert s.count(line) == 1, "ancre entrée Dashboard introuvable/multiple"
s = s.replace(line, "")
p.write_text(s, encoding="utf-8")
print("navEntries : Dashboard retiré de la barre")
PY

# ── 2. UserMenu : isAdmin + lien Dashboard (admin) ──────────────────────────
python3 - "$MENU" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'href="/dashboard"' in s:
    print("UserMenu contient déjà le lien Dashboard"); sys.exit(0)

# 2a. isAdmin après le garde de connexion
guard = "  if (!user) return null;\n"
assert s.count(guard) == 1, "ancre `if (!user) return null;` introuvable/multiple"
s = s.replace(
    guard,
    guard + '\n  const isAdmin = user.role?.name === "ADMIN";\n',
)

# 2b. lien Dashboard (admin) après « Mon profil »
profil = (
    '          <Link\n'
    '            href="/profil"\n'
    '            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"\n'
    '            onClick={() => setOpen(false)}\n'
    '          >\n'
    '            Mon profil\n'
    '          </Link>\n'
)
assert s.count(profil) == 1, "ancre lien « Mon profil » introuvable/multiple (colle-moi ton UserMenu.tsx)"
dashboard = (
    '          {isAdmin && (\n'
    '            <Link\n'
    '              href="/dashboard"\n'
    '              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"\n'
    '              onClick={() => setOpen(false)}\n'
    '            >\n'
    '              Dashboard\n'
    '            </Link>\n'
    '          )}\n'
)
s = s.replace(profil, profil + dashboard)

p.write_text(s, encoding="utf-8")
print("UserMenu : lien Dashboard (admin) ajouté")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(header): Dashboard quitte la barre pour le dropdown avatar (admin only)" \
  && echo "commit $(git rev-parse --short HEAD)"