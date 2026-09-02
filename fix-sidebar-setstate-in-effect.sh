#!/usr/bin/env bash
#
# AKFC — ControlPanelSidebar : lever le warning react-hooks/set-state-in-effect.
#
# L'effet lit le localStorage AU MONTAGE pour restaurer l'état plié des sections.
# On NE peut pas passer par un initializer paresseux de useState : le serveur n'a
# pas localStorage → l'état initial diffèrerait entre SSR (vide) et client →
# mismatch d'hydratation. Le setState au montage est donc le pattern SSR-safe
# correct. On désactive la règle sur cette ligne précise, avec justification.
#
# Front seul, 1 ancre, typecheck web.
#
# Usage : bash fix-sidebar-setstate-in-effect.sh
#         AKFC_APPLY_ONLY=1 bash fix-sidebar-setstate-in-effect.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "eslint-disable-next-line react-hooks/set-state-in-effect" in s:
    print("déjà corrigé"); sys.exit(0)

old = (
    "  useEffect(() => {\n"
    "    try {\n"
    "      const raw = localStorage.getItem(COLLAPSE_KEY);\n"
    "      if (raw) setCollapsed(new Set<string>(JSON.parse(raw) as string[]));\n"
    "    } catch {\n"
    "      /* localStorage indisponible : on reste tout déplié. */\n"
    "    }\n"
    "  }, []);\n"
)
new = (
    "  useEffect(() => {\n"
    "    // Lecture unique au montage d'un état CLIENT-ONLY (localStorage). Pas\n"
    "    // d'initializer paresseux dans useState : le serveur n'a pas localStorage,\n"
    "    // l'état initial diffèrerait entre SSR (vide) et client → mismatch\n"
    "    // d'hydratation. Le setState au montage est donc le pattern SSR-safe.\n"
    "    try {\n"
    "      const raw = localStorage.getItem(COLLAPSE_KEY);\n"
    "      if (raw) {\n"
    "        // eslint-disable-next-line react-hooks/set-state-in-effect\n"
    "        setCollapsed(new Set<string>(JSON.parse(raw) as string[]));\n"
    "      }\n"
    "    } catch {\n"
    "      /* localStorage indisponible : on reste tout déplié. */\n"
    "    }\n"
    "  }, []);\n"
)
assert old in s, "ancre useEffect localStorage introuvable (colle-moi le bloc actuel)"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("sidebar : effet justifié, warning levé")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(sidebar): lève le warning set-state-in-effect (lecture localStorage au montage, SSR-safe justifiée)" \
  && echo "commit $(git rev-parse --short HEAD)"