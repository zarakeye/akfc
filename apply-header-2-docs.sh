#!/usr/bin/env bash
#
# AKFC — Réorg header (2/n) : Documentation rangée par audience.
#
#   1. navEntries.ts        — le menu « Documentation » (3 enfants) → un simple
#                             lien public « Aide » → /docs (doc utilisateur).
#                             « Doc admin » et « Dev doc » quittent la barre.
#   2. ControlPanelSidebar  — « Doc admin » (/docs/admin) et « Dev doc »
#                             (/docs/dev) ajoutés au panneau admin, après
#                             « Utilisateurs ».
#
# Résultat : la barre publique perd un menu à 3 entrées (dont 2 hors-sujet pour
# un visiteur) au profit d'un lien « Aide » clair ; la doc technique rejoint son
# public dans le panneau admin.
#
# 2 fichiers front, typecheck web.
#
# Usage : bash apply-header-2-docs.sh
#         AKFC_APPLY_ONLY=1 bash apply-header-2-docs.sh   (clone)
#
set -euo pipefail

NAV="apps/web/src/features/app-shell/navEntries.ts"
SIDE="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$NAV" ]         || { echo "ERREUR: $NAV introuvable." >&2; exit 1; }
[ -f "$SIDE" ]        || { echo "ERREUR: $SIDE introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. navEntries : Documentation (menu) → Aide (lien) ──────────────────────
python3 - "$NAV" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'label: "Aide"' in s:
    print("navEntries : « Aide » déjà présent"); sys.exit(0)

old = (
    '  {\n'
    '    kind: "menu",\n'
    '    label: "Documentation",\n'
    '    activePrefix: "/docs",\n'
    '    children: [\n'
    '      { href: "/docs", label: "Doc utilisateur" },\n'
    '      { href: "/docs/admin", label: "Doc admin" },\n'
    '      { href: "/docs/dev", label: "Dev doc" },\n'
    '    ],\n'
    '  },\n'
)
assert s.count(old) == 1, "ancre menu Documentation introuvable/multiple (colle-moi navEntries.ts)"
s = s.replace(old, '  { kind: "link", href: "/docs", label: "Aide" },\n')
p.write_text(s, encoding="utf-8")
print("navEntries : Documentation → lien « Aide »")
PY

# ── 2. ControlPanelSidebar : Doc admin + Dev doc (après Utilisateurs) ────────
python3 - "$SIDE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'router.push("/docs/admin")' in s:
    print("sidebar : doc admin/dev déjà présents"); sys.exit(0)

# ancre : fin de l'item « Utilisateurs » (alt unique)
anchor = (
    '                    alt="Ajouter un utilisateur"\n'
    '                    width={16}\n'
    '                    height={16}\n'
    '                  />\n'
    '                </button>\n'
    '              </div>\n'
    '            </li>\n'
)
assert s.count(anchor) == 1, "ancre item Utilisateurs introuvable/multiple (colle-moi ControlPanelSidebar.tsx)"

glow = ("w-full pl-1 text-left cursor-pointer transition duration-300 "
        "hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]")
docs = (
    "\n"
    "            {/* Documentation technique */}\n"
    "            <li>\n"
    "              <button\n"
    f'                className="{glow}"\n'
    "                onClick={() => {\n"
    '                  router.push("/docs/admin");\n'
    "                }}\n"
    "              >\n"
    "                Doc admin\n"
    "              </button>\n"
    "            </li>\n"
    "            <li>\n"
    "              <button\n"
    f'                className="{glow}"\n'
    "                onClick={() => {\n"
    '                  router.push("/docs/dev");\n'
    "                }}\n"
    "              >\n"
    "                Dev doc\n"
    "              </button>\n"
    "            </li>\n"
)
s = s.replace(anchor, anchor + docs)
p.write_text(s, encoding="utf-8")
print("sidebar : Doc admin + Dev doc ajoutés")
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
git commit -m "refactor(header): Documentation rangée par audience (Aide public ; doc admin/dev dans le panneau admin)" \
  && echo "commit $(git rev-parse --short HEAD)"