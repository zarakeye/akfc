#!/usr/bin/env bash
#
# AKFC — Finder : BREADCRUMB (points 2+3 des retours).
#
#  (2) Noms CONVIVIAUX au lieu du cuid : map `path → name` via
#      `storage.myCollaborativeSpaces` (renvoie les espaces de l'utilisateur —
#      les siens en membre, tous via la passerelle en admin) ; un segment dont
#      le path est un espace affiche le nom du groupe.
#  (3) Racine RELATIVE au finder : `Breadcrumb` reçoit `rootPath`.
#      - admin (rootPath = APP_ROOT) : fil normal depuis akfc.
#      - membre (rootPath = racine VIRTUELLE ≠ APP_ROOT) : 1er crumb
#        « Mes espaces » (→ racine virtuelle), puis les segments À PARTIR de
#        l'espace (on masque akfc/groups auxquels le membre n'a pas accès).
#
# Prérequis : passerelle/3b-spaces (myCollaborativeSpaces) + brique 4 (rootPath
# virtuel côté membre). Front NON testé → valider. Pas de migration.
# Usage : bash apply-collab-breadcrumb-friendly.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-breadcrumb-friendly.sh   (clone)
#
set -euo pipefail

BC="apps/web/src/features/finder-core/components/Breadcrumb.tsx"
F="apps/web/src/features/finder-core/components/Finder.tsx"

for f in "package.json" "$BC" "$F"; do
  [ -f "$f" ] || { echo "ERREUR: fichier manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── Breadcrumb.tsx ──────────────────────────────────────────────────────────
python3 - "$BC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "rootPath" in s:
    print("Breadcrumb déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label} (breadcrumb)"
    return s.replace(old, new)

# prop rootPath
s = sub(
    "  adapter: FileAdapter;\n};",
    "  adapter: FileAdapter;\n"
    "  /**\n"
    "   * Racine du finder. APP_ROOT côté admin ; racine VIRTUELLE côté membre —\n"
    "   * le fil s'y adapte (voir plus bas).\n"
    "   */\n"
    "  rootPath: string;\n};",
    "prop rootPath")

# destructuration
s = sub(
    "export default function Breadcrumb({ adapter }: Props): JSX.Element {",
    "export default function Breadcrumb({ adapter, rootPath }: Props): JSX.Element {",
    "destructure")

# segments : noms conviviaux + racine relative au finder
s = sub(
    "  const segments = buildPathSegments(currentPath);",
    "  // Noms conviviaux des espaces (cuid → nom du groupe). myCollaborativeSpaces\n"
    "  // renvoie les espaces de l'utilisateur courant (les siens en membre, tous\n"
    "  // via la passerelle en admin).\n"
    "  const { data: mySpaces } = trpc.storage.myCollaborativeSpaces.useQuery();\n"
    "  const nameByPath = new Map(\n"
    "    (mySpaces ?? []).map((sp) => [sp.path, sp.name] as const),\n"
    "  );\n"
    "\n"
    "  const rawSegments = buildPathSegments(currentPath);\n"
    "  // Racine relative au finder. Membre = racine virtuelle (≠ APP_ROOT) : on\n"
    "  // n'affiche pas akfc/groups (hors de sa portée), mais « Mes espaces » puis\n"
    "  // le fil À PARTIR de l'espace courant.\n"
    "  const isMemberRoot = rootPath !== APP_ROOT;\n"
    "  let segments = rawSegments;\n"
    "  if (isMemberRoot) {\n"
    "    const virtualRoot = { name: 'Mes espaces', path: rootPath };\n"
    "    if (currentPath === rootPath) {\n"
    "      segments = [virtualRoot];\n"
    "    } else {\n"
    "      const spaceIdx = rawSegments.findIndex((sg) => nameByPath.has(sg.path));\n"
    "      const kept = spaceIdx >= 0 ? rawSegments.slice(spaceIdx) : rawSegments;\n"
    "      segments = [virtualRoot, ...kept];\n"
    "    }\n"
    "  }\n"
    "  segments = segments.map((sg) => ({\n"
    "    ...sg,\n"
    "    name: nameByPath.get(sg.path) ?? sg.name,\n"
    "  }));",
    "segments")

p.write_text(s, encoding="utf-8")
print("Breadcrumb patché (noms conviviaux + racine relative)")
PY

# ── Finder.tsx : passer rootPath au Breadcrumb ──────────────────────────────
python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "<Breadcrumb adapter={adapter} rootPath=" in s:
    print("Finder déjà à jour (Breadcrumb rootPath)"); sys.exit(0)
old = "<Breadcrumb adapter={adapter} />"
assert s.count(old) == 1, "ancre <Breadcrumb> introuvable"
s = s.replace(old, "<Breadcrumb adapter={adapter} rootPath={rootPath} />")
p.write_text(s, encoding="utf-8")
print("Finder patché (rootPath passé au Breadcrumb)")
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
if git commit -m "feat(finder): breadcrumb — noms conviviaux + racine relative au finder (akfc admin / Mes espaces membre)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : admin → akfc/groups/<Nom>/… ; membre → Mes espaces/<Nom>/… (plus de cuid, pas d'akfc)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi