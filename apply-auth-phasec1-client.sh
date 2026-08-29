#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE C1 (client) : les sites UI lisent user.isAdmin.
#
# 10 fichiers front qui dérivaient l'admin de `...role?.name === "ADMIN"` lisent
# désormais `...isAdmin` (la source groupe, déjà sur la session). Neutre (isAdmin
# == ancien role-admin). Chaque remplacement est SCOPÉ à son fichier — l'expression
# `user?.role?.name === "ADMIN"` existe aussi côté backend (services memberGroups)
# avec une autre sémantique, donc surtout pas de remplacement global.
#
# Backend (ctx + services) = phases C2/C3, séparées.
#
# Front seul, typecheck web.
#
# Usage : bash apply-auth-phaseC1-client.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseC1-client.sh   (clone)
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
import pathlib, sys

WEB = "apps/web/src"

# (chemin relatif à WEB, ancien, nouveau)
EDITS = [
    ("features/finder-core/components/FinderTreeFile.tsx",
     "st.session?.user?.role?.name === 'ADMIN'",
     "(st.session?.user?.isAdmin ?? false)"),
    ("features/finder-core/components/GridItem.tsx",
     "st.session?.user?.role?.name === 'ADMIN'",
     "(st.session?.user?.isAdmin ?? false)"),
    ("features/finder-core/components/FinderCompactRow.tsx",
     "st.session?.user?.role?.name === 'ADMIN'",
     "(st.session?.user?.isAdmin ?? false)"),
    ("features/finder-core/components/FinderTableRow.tsx",
     "st.session?.user?.role?.name === 'ADMIN'",
     "(st.session?.user?.isAdmin ?? false)"),
    ("features/app-shell/DraftPageBadge.tsx",
     's.session?.user?.role?.name === "ADMIN"',
     "(s.session?.user?.isAdmin ?? false)"),
    ("features/editorial/editorialGate.tsx",
     'session?.user?.role?.name === "ADMIN"',
     "(session?.user?.isAdmin ?? false)"),
    ("features/admin/library/forms/DragNDropForm.tsx",
     "user?.role?.name === 'ADMIN'",
     "(user?.isAdmin ?? false)"),
    ("features/app-shell/NotificationBell.tsx",
     'user?.role?.name === "ADMIN"',
     "(user?.isAdmin ?? false)"),
    ("features/app-shell/UserMenu.tsx",
     'const isAdmin = user.role?.name === "ADMIN";',
     "const isAdmin = user.isAdmin;"),
    # ControlPanelSidebar v2 : role n'est utilisé que pour isAdmin → on le supprime.
    ("features/app-shell/ControlPanelSidebar.tsx",
     '  const role = useSessionStore((state) => state.session?.user?.role);\n'
     '  const isAdmin = role?.name === "ADMIN";',
     "  const isAdmin = useSessionStore(\n"
     "    (state) => state.session?.user?.isAdmin ?? false,\n"
     "  );"),
]

for rel, old, new in EDITS:
    p = pathlib.Path(WEB) / rel
    if not p.exists():
        print(f"ERREUR: {rel} introuvable", file=sys.stderr); sys.exit(1)
    s = p.read_text(encoding="utf-8")
    if old not in s:
        # déjà migré (ou dérive) : on ne casse rien, on signale.
        print(f"— {rel} : ancre absente (déjà migré ?)")
        continue
    assert s.count(old) == 1, f"ancre multiple dans {rel}"
    s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")
    print(f"✓ {rel}")
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
git commit -m "feat(auth): phase C1 — sites UI lisent session.user.isAdmin (groupe) au lieu du rôle" \
  && echo "commit $(git rev-parse --short HEAD)"