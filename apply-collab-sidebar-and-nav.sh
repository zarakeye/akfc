#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif (front) : le « + » manquant de la sidebar +
# le lien membre vers /mes-espaces.
#
#   - ControlPanelSidebar.tsx : l'item « Groupes de membres » n'avait QUE son
#     libellé ; on lui ajoute le bouton « + » (Image add_circle.svg →
#     /dashboard/groups/create), exactement comme les autres items.
#   - navEntries.ts : ajoute un lien membre « Mes espaces » → /mes-espaces
#     (requiresUser), à côté de « Documents » — pour rendre le finder membre
#     atteignable depuis la navbar.
#
# FRONT non testé ici → à valider à l'écran. Prérequis : 1f + 2a appliqués. Pas de migration.
# Usage : bash apply-collab-sidebar-and-nav.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-sidebar-and-nav.sh   (clone)
#
set -euo pipefail

SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"
NAV="apps/web/src/features/app-shell/navEntries.ts"

for f in "package.json" "$SIDEBAR" "$NAV"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$SIDEBAR" "$NAV" <<'PY'
import sys, pathlib
sidebar, nav = (pathlib.Path(p) for p in sys.argv[1:3])

# ── Sidebar : + sur l'item Groupes ──────────────────────────────────────────
s = sidebar.read_text(encoding="utf-8")
if "/dashboard/groups/create" in s:
    print("sidebar déjà à jour")
else:
    OLD = (
        '            {/* Groupes de membres */}\n'
        '            <li>\n'
        '              <div className="flex">\n'
        '                <button\n'
        '                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"\n'
        '                  onClick={() => router.push("/dashboard/groups")}\n'
        '                >\n'
        '                  Groupes de membres\n'
        '                </button>\n'
        '              </div>\n'
        '            </li>'
    )
    NEW = (
        '            {/* Groupes de membres */}\n'
        '            <li>\n'
        '              <div className="flex">\n'
        '                <button\n'
        '                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"\n'
        '                  onClick={() => router.push("/dashboard/groups")}\n'
        '                >\n'
        '                  Groupes de membres\n'
        '                </button>\n'
        '                <button\n'
        '                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"\n'
        '                  onClick={() => {\n'
        '                    router.push("/dashboard/groups/create");\n'
        '                  }}\n'
        '                >\n'
        '                  <Image\n'
        '                    src="/add_circle.svg"\n'
        '                    alt="Créer un groupe de membres"\n'
        '                    width={16}\n'
        '                    height={16}\n'
        '                  />\n'
        '                </button>\n'
        '              </div>\n'
        '            </li>'
    )
    assert s.count(OLD) == 1, "ancre item Groupes (sidebar) introuvable"
    s = s.replace(OLD, NEW)
    sidebar.write_text(s, encoding="utf-8")
    print("sidebar patchée (bouton + sur Groupes)")

# ── navEntries : lien membre Mes espaces ────────────────────────────────────
n = nav.read_text(encoding="utf-8")
if '/mes-espaces' in n:
    print("navEntries déjà à jour")
else:
    OLD = '  { kind: "link", href: "/documents", label: "Documents", requiresUser: true },'
    NEW = (OLD + "\n"
           '  { kind: "link", href: "/mes-espaces", label: "Mes espaces", requiresUser: true },')
    assert n.count(OLD) == 1, "ancre entrée Documents (navEntries) introuvable"
    n = n.replace(OLD, NEW)
    nav.write_text(n, encoding="utf-8")
    print("navEntries patché (lien Mes espaces)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(groups): bouton + sidebar (Groupes) + lien navbar Mes espaces" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider à l'écran (sidebar dashboard + navbar membre)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi