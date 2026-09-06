#!/usr/bin/env bash
#
# AKFC — Corbeille, LOT B2 : icône vide / pleine (SVG maison).
#
# Crée BinIcon (couvercle fermé quand VIDE, papiers qui dépassent quand PLEINE),
# autonome : elle interroge elle-même `trash.listBin` (React Query dédoublonne
# entre arbre et grille). Branchée sur le nœud `bin` en grille ET dans l'arbre.
#
# À lancer APRÈS le lot A (icône avatars) et B1 (nettoyage). NB : FinderTreeFolder
# a déjà une variable locale `isBinRoot` (bin-leaf) → on la réutilise (pas
# d'import qui collisionnerait) ; GridItem importe le prédicat isBinRoot.
#
# Périmètre : FRONTEND. Un aller-retour = un typecheck.
# Usage : bash apply-finder-clarity-B2-bin-icon.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
BININ="apps/web/src/features/finder-core/components/BinIcon.tsx"
if [ -f "$BININ" ]; then echo "— déjà appliqué (BinIcon.tsx existe)"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1) Composant BinIcon (nouveau fichier) ──────────────────────────────────
cat > "$BININ" <<'EOF'
"use client";

import { trpc } from "@trpc/trpcClient";
import { APP_ROOT } from "@config/app";

/**
 * Icône de corbeille commutée sur l'état RÉEL de la corbeille :
 *   - VIDE  : couvercle fermé, propre ;
 *   - PLEINE : papiers qui dépassent + contenu.
 *
 * Elle interroge elle-même `trash.listBin` (limit 1 : on ne veut qu'un booléen
 * « y a-t-il quelque chose ? »). React Query dédoublonne l'appel entre l'arbre
 * et la grille, donc l'appelant n'a qu'à la poser sur le nœud `bin`.
 */
export function BinIcon({ className }: { className?: string }) {
  const { data } = trpc.trash.listBin.useQuery(
    { appRoot: APP_ROOT, limit: 1 },
    { refetchOnWindowFocus: false, staleTime: 10_000 },
  );
  const full = (data?.items?.length ?? 0) > 0;

  const svg = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (full) {
    return (
      <svg {...svg} className={className}>
        <path d="M4 7h16" />
        <path d="M6.3 7l.85 12.5A2 2 0 0 0 9.15 21.4h5.7a2 2 0 0 0 2-1.9L17.7 7" />
        {/* contenu qui déborde du bord */}
        <path d="M6.5 7q1.4-2.2 2.9 0 1.4-2.2 2.9 0 1.4-2.2 2.9 0" />
        <path d="M10.5 11.5v5.5" />
        <path d="M13.5 11.5v5.5" />
      </svg>
    );
  }

  return (
    <svg {...svg} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4.6A1.6 1.6 0 0 1 10.6 3h2.8A1.6 1.6 0 0 1 15 4.6V7" />
      <path d="M6.3 7l.85 12.5A2 2 0 0 0 9.15 21.4h5.7a2 2 0 0 0 2-1.9L17.7 7" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
EOF
echo "  créé  $BININ"

# ── 2) Prédicat isBinRoot + branchements ────────────────────────────────────
python3 - <<'PY'
import pathlib

F = "apps/web/src/features/finder-core"

EDITS = [
  # spaceFolderKind : regex BIN_ROOT + prédicat isBinRoot (pour la grille)
  (f"{F}/utils/spaceFolderKind.ts",
   r"const AVATAR_FOLDER = /\/avatars\/[^/]+$/;",
   "const AVATAR_FOLDER = /\\/avatars\\/[^/]+$/;\nconst BIN_ROOT = /^[^/]+\\/bin$/;", 1),
  (f"{F}/utils/spaceFolderKind.ts",
   "export function isAvatarsContainer(path: string): boolean {\n"
   "  return AVATARS_CONTAINER.test(path);\n"
   "}\n",
   "export function isAvatarsContainer(path: string): boolean {\n"
   "  return AVATARS_CONTAINER.test(path);\n"
   "}\n\n"
   "export function isBinRoot(path: string): boolean {\n"
   "  return BIN_ROOT.test(path);\n"
   "}\n", 1),

  # GridItem : import prédicat + import BinIcon + branche bin en tête
  (f"{F}/components/GridItem.tsx",
   "import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isProtectedEntityFolder } from '@features/finder-core/utils/spaceFolderKind';",
   "import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isBinRoot, isProtectedEntityFolder } from '@features/finder-core/utils/spaceFolderKind';\n"
   "import { BinIcon } from '@features/finder-core/components/BinIcon';", 1),
  (f"{F}/components/GridItem.tsx",
   "        {isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (\n"
   '          <Users className="w-16 h-16" strokeWidth={1.5} />',
   "        {isBinRoot(node.path) ? (\n"
   '          <BinIcon className="w-16 h-16" />\n'
   "        ) : isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (\n"
   '          <Users className="w-16 h-16" strokeWidth={1.5} />', 1),

  # FinderTreeFolder : import BinIcon (isBinRoot local existe déjà) + branche bin
  (f"{F}/components/FinderTreeFolder.tsx",
   'import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isProtectedEntityFolder } from "@features/finder-core/utils/spaceFolderKind";',
   'import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer, isAvatarsContainer, isProtectedEntityFolder } from "@features/finder-core/utils/spaceFolderKind";\n'
   'import { BinIcon } from "@features/finder-core/components/BinIcon";', 1),
  (f"{F}/components/FinderTreeFolder.tsx",
   '        {isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (\n'
   '          <Users className="h-4 w-4 text-muted-foreground shrink-0" />',
   '        {isBinRoot ? (\n'
   '          <BinIcon className="h-4 w-4 text-muted-foreground shrink-0" />\n'
   '        ) : isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (\n'
   '          <Users className="h-4 w-4 text-muted-foreground shrink-0" />', 1),
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
        assert found == cnt, f"{p}: attendu {cnt}, trouvé {found} pour : {old[:55]!r}"
        s = s.replace(old, new)
    fp.write_text(s, encoding="utf-8")
    print(f"  ok  {p}  ({len(lst)} édition(s))")
print("Lot B2 appliqué.")
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
if git commit -m "feat(finder): icône corbeille vide/pleine (BinIcon commuté sur trash.listBin)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi