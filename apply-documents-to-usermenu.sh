#!/usr/bin/env bash
#
# AKFC — « Documents » : renommage + déplacement dans le menu avatar.
#
# Avant : entrée de nav `/documents` (label « Documents »), rendue en SPÉCIAL via
# `DocumentsNavLink` (badge de non-lus) dans la barre ET le panneau burger.
#
# Après : l'entrée quitte la nav (barre + panneau) et rejoint le menu avatar
# (`UserMenu`), APRÈS « Mon profil », sous le libellé « Mes documents ». Le
# badge de non-lus suit (DocumentsNavLink réutilisé, withTooltip=false : pas de
# tooltip imbriqué dans un dropdown). `UserMenu` étant rendu en desktop ET dans
# le panneau mobile, l'accès mobile est préservé (même place que « Mon profil »).
#
# 4 fichiers touchés :
#   1. navEntries.ts        — suppression de l'entrée /documents
#   2. Header.tsx           — suppression des 2 cas spéciaux DocumentsNavLink
#                             + de son import (devenu orphelin)
#   3. UserMenu.tsx         — import + item « Mes documents » après « Mon profil »
#
# NB : le tooltip détaillé par famille (club/groupes/perso) de l'ancienne entrée
# barre est abandonné dans le déplacement (seul le total reste, en badge) — un
# tooltip dans un menu déroulant serait bancal. Dis-moi si tu veux le détail
# listé dans le dropdown.
#
# Front seul. Typecheck web.
#
# Usage : bash apply-documents-to-usermenu.sh
#         AKFC_APPLY_ONLY=1 bash apply-documents-to-usermenu.sh   (clone)
#
set -euo pipefail

NAV="apps/web/src/features/app-shell/navEntries.ts"
HEADER="apps/web/src/features/app-shell/Header.tsx"
MENU="apps/web/src/features/app-shell/UserMenu.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$NAV" "$HEADER" "$MENU"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. navEntries : retirer l'entrée /documents ─────────────────────────────
python3 - "$NAV" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
line = '  { kind: "link", href: "/documents", label: "Documents", requiresUser: true },\n'
if line not in s:
    print("entrée /documents déjà retirée"); sys.exit(0)
assert s.count(line) == 1, "ancre entrée /documents introuvable/multiple"
s = s.replace(line, "")
p.write_text(s, encoding="utf-8")
print("navEntries : entrée /documents retirée")
PY

# ── 2. Header : retirer les 2 cas spéciaux + l'import orphelin ───────────────
python3 - "$HEADER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "DocumentsNavLink" not in s:
    print("Header déjà nettoyé"); sys.exit(0)

# import
imp = 'import { DocumentsNavLink } from "@features/member-documents/DocumentsNavLink";\n'
assert s.count(imp) == 1, "ancre import DocumentsNavLink introuvable/multiple"
s = s.replace(imp, "")

# cas barre
bar_old = (
    '            const linkClass = `${NAV_GLOW} whitespace-nowrap text-[17px] 2xl:text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`;\n'
    '            if (entry.href === "/documents") {\n'
    '              return (\n'
    '                <DocumentsNavLink\n'
    '                  key={entry.href}\n'
    '                  href={entry.href}\n'
    '                  label={entry.label}\n'
    '                  className={linkClass}\n'
    '                />\n'
    '              );\n'
    '            }\n'
    '            return (\n'
)
assert s.count(bar_old) == 1, "ancre cas barre introuvable/multiple"
bar_new = (
    '            const linkClass = `${NAV_GLOW} whitespace-nowrap text-[17px] 2xl:text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`;\n'
    '            return (\n'
)
s = s.replace(bar_old, bar_new)

# cas panneau
panel_old = (
    '                  const linkClass = `block py-3 text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`;\n'
    '                  if (entry.href === "/documents") {\n'
    '                    return (\n'
    '                      <DocumentsNavLink\n'
    '                        key={entry.href}\n'
    '                        href={entry.href}\n'
    '                        label={entry.label}\n'
    '                        className={linkClass}\n'
    '                        withTooltip={false}\n'
    '                      />\n'
    '                    );\n'
    '                  }\n'
    '                  return (\n'
)
assert s.count(panel_old) == 1, "ancre cas panneau introuvable/multiple"
panel_new = (
    '                  const linkClass = `block py-3 text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`;\n'
    '                  return (\n'
)
s = s.replace(panel_old, panel_new)

p.write_text(s, encoding="utf-8")
print("Header : cas spéciaux + import retirés")
PY

# ── 3. UserMenu : import + item « Mes documents » après « Mon profil » ───────
python3 - "$MENU" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "Mes documents" in s:
    print("UserMenu déjà à jour"); sys.exit(0)

# import
imp_anchor = 'import { UserPortrait } from "@features/social/UserPortrait";\n'
assert s.count(imp_anchor) == 1, "ancre import UserPortrait introuvable/multiple"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { DocumentsNavLink } from "@features/member-documents/DocumentsNavLink";\n',
)

# item après « Mon profil »
profil = (
    '          <Link\n'
    '            href="/profil"\n'
    '            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"\n'
    '            onClick={() => setOpen(false)}\n'
    '          >\n'
    '            Mon profil\n'
    '          </Link>\n'
)
assert s.count(profil) == 1, "ancre « Mon profil » introuvable/multiple"
docs_item = (
    '          <div className="px-4 py-2 hover:bg-gray-100">\n'
    '            <DocumentsNavLink\n'
    '              href="/documents"\n'
    '              label="Mes documents"\n'
    '              withTooltip={false}\n'
    '              className="text-sm text-gray-700"\n'
    '            />\n'
    '          </div>\n'
)
s = s.replace(profil, profil + docs_item)

p.write_text(s, encoding="utf-8")
print("UserMenu : item « Mes documents » ajouté")
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
git commit -m "feat(header): « Documents » → « Mes documents » déplacé dans le menu avatar (retiré de la nav)" \
  && echo "commit $(git rev-parse --short HEAD)"