#!/usr/bin/env bash
#
# AKFC — Corbeille, LOT B1 : retrait du code mort `.trash` de l'arbre.
#
# La corbeille est déjà une FEUILLE (bin-leaf) → la 2e arborescence n'apparaît
# plus. Ce script SUPPRIME la machinerie devenue injoignable :
#   FinderTreeFolder : import useTrashMap, flags .trash, effet auto-load,
#                      clause isMaterializing, bloc de skip visuel, branches
#                      displayLabel corbeille.
#   FinderTree       : requête trash.listBin + trashMap + TrashMapProvider,
#                      imports devenus inutiles (trpc, APP_ROOT, useMemo,
#                      TrashEntryDTO, TrashMap).
#
# Le compte d'éléments (icône vide/pleine) reviendra en B2 via un composant
# BinIcon autonome. Gate = tsc seul (pas de noUnusedLocals) → les états
# isLoading/loadError restent déclarés mais morts, sans casser le typecheck.
#
# Périmètre : FRONTEND. Un aller-retour = un typecheck.
# Usage : bash apply-finder-clarity-B1-bin-cleanup.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
GUARD="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
if ! grep -q 'isTrashRootSkipNode' "$GUARD" 2>/dev/null; then
  echo "— déjà appliqué (plus de isTrashRootSkipNode)"; exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

FTF = "apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
FT  = "apps/web/src/features/finder-core/components/FinderTree.tsx"

EDITS = []

# ─────────── FinderTreeFolder.tsx ───────────
EDITS.append((FTF,
r'''import { useTrashMap } from "@features/finder-core/state/TrashMapContext";
''', "", 1))

EDITS.append((FTF,
r'''  const trashMap = useTrashMap();

  const inTrashStorage =
    node.path.includes("/.trash/") || node.path.endsWith("/.trash");
  const isTrashRootSkipNode = node.name === ".trash";

  const isTrashWrapperNode = Boolean(node.path.match(/\/bin\/\.trash\/[^/]+$/));

  const trashEntryForName = trashMap.get(node.name);
''', "", 1))

EDITS.append((FTF,
r'''  useEffect(() => {
    if (!isTrashRootSkipNode && !isTrashWrapperNode) return;
    if (autoLoadTriggeredRef.current) return;
    if (node.children && node.children.length > 0) return;
    if (loadedChildren !== null) return;
    if (!adapter.getTree) return;

    async function autoLoad() {
      const cached = useFinderStore.getState().contentCache.get(node.path);
      if (cached) {
        autoLoadTriggeredRef.current = true;
        setLoadedChildren([...cached.folders, ...cached.files]);
        return;
      }

      autoLoadTriggeredRef.current = true;
      setIsLoading(true);

      try {
        const { root } = await adapter.getTree!({ path: node.path, depth: 1 });
        const children = root.children ?? [];
        setLoadedChildren(children);
        useFinderStore.getState().cacheChildrenAt(node.path, children);
      } catch (err) {
        console.error("[FinderTreeFolder] auto-load skip-node failed", err);
        setLoadError("Erreur chargement contenu corbeille");
      } finally {
        setIsLoading(false);
      }
    }

    void autoLoad();
  }, [
    isTrashRootSkipNode,
    isTrashWrapperNode,
    node.path,
    node.children,
    loadedChildren,
    adapter,
  ]);
''', "", 1))

EDITS.append((FTF,
r'''    loadedChildren === null &&
    !isTrashRootSkipNode &&
    !isTrashWrapperNode;''',
r'''    loadedChildren === null;''', 1))

EDITS.append((FTF,
r'''  // ─── Skip visuel du `.trash` ET des wrappers uuid ────────────────────────
  if (isTrashRootSkipNode || isTrashWrapperNode) {
    return (
      <>
        {effectiveChildren?.map((child) =>
          child.type === "folder" ? (
            <FinderTreeFolder
              key={child.path}
              node={child}
              adapter={adapter}
              currentPath={currentPath}
              onOpen={onOpen}
              openPaths={openPaths}
              onToggleOpen={onToggleOpen}
              onDragStart={onDragStart}
              onLongPress={onLongPress}
              pickMode={pickMode}
              isInCart={isInCart}
              onPickToggle={onPickToggle}
            />
          ) : (
            <FinderTreeFile
              key={child.path}
              node={child}
              onDragStart={onDragStart}
              onLongPress={onLongPress}
              pickMode={pickMode}
              isInCart={isInCart}
              onPickToggle={onPickToggle}
            />
          ),
        )}
      </>
    );
  }

''', "", 1))

EDITS.append((FTF,
r'''  let displayLabel = friendlySpaceFolderLabel(node.name, node.path) ?? node.name;
  if (inTrashStorage && trashEntryForName) {
    displayLabel = trashEntryForName.displayName;
  } else if (
    inTrashStorage &&
    !trashEntryForName &&
    node.path.match(/\/bin\/\.trash\/[^/]+$/)
  ) {
    displayLabel = "Élément supprimé";
  }''',
r'''  const displayLabel =
    friendlySpaceFolderLabel(node.name, node.path) ?? node.name;''', 1))

# ─────────── FinderTree.tsx ───────────
EDITS.append((FT,
r'''import type { TrashEntryDTO } from '@contracts/trash/trash.dto';
''', "", 1))

EDITS.append((FT,
r'''import {
  TrashMapProvider,
  type TrashMap,
} from '@features/finder-core/state/TrashMapContext';
''', "", 1))

EDITS.append((FT,
"import { useEffect, useMemo, useState } from 'react';",
"import { useEffect, useState } from 'react';", 1))

EDITS.append((FT,
r'''import { trpc } from '@trpc/trpcClient';
''', "", 1))

EDITS.append((FT,
r'''import { APP_ROOT } from '@config/app';
''', "", 1))

EDITS.append((FT,
r'''  const { data: trashListData } = trpc.trash.listBin.useQuery(
    { appRoot: APP_ROOT, limit: 100 },
    { refetchOnWindowFocus: false, staleTime: 10_000 }
  );

''', "", 1))

EDITS.append((FT,
r'''  const trashMap: TrashMap = useMemo(() => {
    const map = new Map() as TrashMap;
    const items: TrashEntryDTO[] = trashListData?.items ?? [];
    for (const entry of items) {
      map.set(entry.id, { displayName: entry.displayName, kind: entry.kind });
    }
    return map;
  }, [trashListData]);

''', "", 1))

EDITS.append((FT,
r'''    <TrashMapProvider value={trashMap}>
      {/* `min-h-full` : sans hauteur, le vide sous l'arbre appartiendrait au
          panneau et non à ce div — le clic n'y serait jamais capté. */}
      <div className="space-y-0.5 min-h-full" onClick={onVoidClick}>''',
r'''      <div className="space-y-0.5 min-h-full" onClick={onVoidClick}>''', 1))

EDITS.append((FT,
r'''      </div>
    </TrashMapProvider>
  );''',
r'''      </div>
  );''', 1))

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
print("Lot B1 appliqué.")
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
if git commit -m "refactor(finder): retire le code mort .trash de l'arbre (corbeille = feuille)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi