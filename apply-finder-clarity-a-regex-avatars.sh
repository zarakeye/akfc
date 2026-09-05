#!/usr/bin/env bash
#
# AKFC — FINDER clarté, LOT A : regexes EN + icône avatars.
#
# 1) Aligne les prédicats de détection d'espace du finder sur les noms EN que le
#    backend écrit DÉJÀ (inc 1 du flip appliqué) :
#      groups            → collaborative-group-spaces   (icône Users, ta règle 3)
#      persos            → personal-spaces              (icône User = 1 personne, ta règle 5)
#      common_repository → common-repository
#    Sans ça, le finder cherchait encore groups/persos et n'aurait pas reconnu
#    les nouveaux espaces (mauvaise icône, protection KO).
# 2) Ajoute une icône AVATARS distincte de personal-spaces : CircleUserRound
#    (personne dans un cercle = photo de profil), grille ET arbre (ta règle 6).
#
# NE fait PAS : la corbeille (lot B) ni les racines vides (lot C).
# Périmètre : FRONTEND finder-core. Un aller-retour = un typecheck.
#
# Usage : bash apply-finder-clarity-A-regex-avatars.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-clarity-A-regex-avatars.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
GUARD="apps/web/src/features/finder-core/utils/spaceFolderKind.ts"
if grep -q 'collaborative-group-spaces' "$GUARD" 2>/dev/null; then
  echo "— déjà appliqué (collaborative-group-spaces présent)"; exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

F = "apps/web/src/features/finder-core"

EDITS = [
  # ── spaceFolderKind.ts : commentaire + regexes + nouveau prédicat avatars ──
  (f"{F}/utils/spaceFolderKind.ts",
   " *   - espace de GROUPE : `${appRoot}/groups/<slug>-<cuid>`\n"
   " *   - espace PERSO     : `${appRoot}/persos/<slug>-<cuid>`\n"
   " *   - conteneurs       : `${appRoot}/groups` et `${appRoot}/persos`\n",
   " *   - espace de GROUPE : `${appRoot}/collaborative-group-spaces/<slug>-<cuid>`\n"
   " *   - espace PERSO     : `${appRoot}/personal-spaces/<slug>-<cuid>`\n"
   " *   - conteneurs       : collaborative-group-spaces, personal-spaces, avatars\n", 1),

  (f"{F}/utils/spaceFolderKind.ts",
   r"const GROUP_SPACE_PATH = /\/groups\/[^/]+-c[a-z0-9]{24}$/;",
   r"const GROUP_SPACE_PATH = /\/collaborative-group-spaces\/[^/]+-c[a-z0-9]{24}$/;", 1),
  (f"{F}/utils/spaceFolderKind.ts",
   r"const PERSO_SPACE_PATH = /\/persos\/[^/]+-c[a-z0-9]{24}$/;",
   r"const PERSO_SPACE_PATH = /\/personal-spaces\/[^/]+-c[a-z0-9]{24}$/;", 1),
  (f"{F}/utils/spaceFolderKind.ts",
   r"const GROUPS_CONTAINER = /^[^/]+\/groups$/;",
   r"const GROUPS_CONTAINER = /^[^/]+\/collaborative-group-spaces$/;", 1),
  (f"{F}/utils/spaceFolderKind.ts",
   r"const PERSOS_CONTAINER = /^[^/]+\/persos$/;",
   r"const PERSOS_CONTAINER = /^[^/]+\/personal-spaces$/;", 1),
  (f"{F}/utils/spaceFolderKind.ts",
   r"const COMMON_REPOSITORY_CONTAINER = /^[^/]+\/common_repository$/;",
   r"const COMMON_REPOSITORY_CONTAINER = /^[^/]+\/common-repository$/;", 1),

  (f"{F}/utils/spaceFolderKind.ts",
   "export function isPersosContainer(path: string): boolean {\n"
   "  return PERSOS_CONTAINER.test(path);\n"
   "}\n",
   "export function isPersosContainer(path: string): boolean {\n"
   "  return PERSOS_CONTAINER.test(path);\n"
   "}\n\n"
   "export function isAvatarsContainer(path: string): boolean {\n"
   "  return AVATARS_CONTAINER.test(path);\n"
   "}\n", 1),

  # ── spaceFolderLabel.ts : commentaire + regex racine d'espace ──
  (f"{F}/utils/spaceFolderLabel.ts",
   " * Chemin d'un espace : `${appRoot}/groups|persos/<slug>-<cuid>` (cuid = id DB,",
   " * Chemin d'un espace : `${appRoot}/collaborative-group-spaces|personal-spaces/<slug>-<cuid>` (cuid = id DB,", 1),
  (f"{F}/utils/spaceFolderLabel.ts",
   r"const SPACE_ROOT_PATH = /\/(groups|persos)\/[^/]+$/;",
   r"const SPACE_ROOT_PATH = /\/(collaborative-group-spaces|personal-spaces)\/[^/]+$/;", 1),

  # ── GridItem.tsx : import lucide + import prédicat + branche avatars ──
  (f"{F}/components/GridItem.tsx",
   "import { Folder, Users, User, Music, Check, FileText, Play } from 'lucide-react';",
   "import { Folder, Users, User, CircleUserRound, Music, Check, FileText, Play } from 'lucide-react';", 1),
  (f"{F}/components/GridItem.tsx",
   "import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isProtectedEntityFolder } from '@features/finder-core/utils/spaceFolderKind';",
   "import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isProtectedEntityFolder } from '@features/finder-core/utils/spaceFolderKind';", 1),
  (f"{F}/components/GridItem.tsx",
   '          <User className="w-16 h-16" strokeWidth={1.5} />\n'
   '        ) : (\n'
   '          <Folder className="w-16 h-16" strokeWidth={1.5} />',
   '          <User className="w-16 h-16" strokeWidth={1.5} />\n'
   '        ) : isAvatarsContainer(node.path) ? (\n'
   '          <CircleUserRound className="w-16 h-16" strokeWidth={1.5} />\n'
   '        ) : (\n'
   '          <Folder className="w-16 h-16" strokeWidth={1.5} />', 1),

  # ── FinderTreeFolder.tsx : import lucide + import prédicat + branche avatars ──
  (f"{F}/components/FinderTreeFolder.tsx",
   "  User,\n  Loader2,\n} from \"lucide-react\";",
   "  User,\n  CircleUserRound,\n  Loader2,\n} from \"lucide-react\";", 1),
  (f"{F}/components/FinderTreeFolder.tsx",
   'import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isProtectedEntityFolder } from "@features/finder-core/utils/spaceFolderKind";',
   'import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isProtectedEntityFolder } from "@features/finder-core/utils/spaceFolderKind";', 1),
  (f"{F}/components/FinderTreeFolder.tsx",
   '          <User className="h-4 w-4 text-muted-foreground shrink-0" />\n'
   '        ) : isOpen ? (',
   '          <User className="h-4 w-4 text-muted-foreground shrink-0" />\n'
   '        ) : isAvatarsContainer(node.path) ? (\n'
   '          <CircleUserRound className="h-4 w-4 text-muted-foreground shrink-0" />\n'
   '        ) : isOpen ? (', 1),
]

byfile = {}
for (p, o, n, c) in EDITS:
    byfile.setdefault(p, []).append((o, n, c))
for p, lst in byfile.items():
    fp = pathlib.Path(p)
    if not fp.exists():
        raise SystemExit(f"ERREUR: fichier introuvable : {p}")
    s = fp.read_text(encoding="utf-8")
    for (old, new, cnt) in lst:
        found = s.count(old)
        assert found == cnt, f"{p}: attendu {cnt}, trouvé {found} pour : {old[:60]!r}"
        s = s.replace(old, new)
    fp.write_text(s, encoding="utf-8")
    print(f"  ok  {p}  ({len(lst)} édition(s))")
print("Lot A appliqué.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "feat(finder): prédicats d'espace EN + icône avatars distincte (CircleUserRound)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi