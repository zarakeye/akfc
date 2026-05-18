'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import type { FinderNode } from '@contracts/finder';
import type { FileAdapter } from '@contracts/finder';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

import FinderTreeFolder from './FinderTreeFolder';
import FinderTreeFile from './FinderTreeFile';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import {
  TrashMapProvider,
  type TrashMap,
} from '@features/finder-core/state/TrashMapContext';

/**
 * FinderTree
 *
 * Composant racine de la TreeView du finder.
 *
 * ─── Stratégie de chargement ──────────────────────────────────────────────
 *
 * Au montage, on appelle `adapter.getTree({ path: rootPath, depth: 2 })`
 * pour récupérer deux niveaux d'avance (les enfants du rootPath et leurs
 * propres enfants directs). Ça suffit pour rendre fluide la navigation
 * "premier niveau d'expansion" sans round-trip supplémentaire.
 *
 * Les niveaux plus profonds sont chargés à la demande dans chaque
 * `FinderTreeFolder` lorsqu'il est déplié pour la première fois (cf.
 * `ensureChildrenLoaded` dans ce composant fils).
 *
 * ─── État d'expansion ─────────────────────────────────────────────────────
 *
 * Le set des paths dépliés est tenu ICI (au niveau racine) plutôt que
 * dans chaque FinderTreeFolder, pour deux raisons :
 *   1) Permet de fermer toute la TreeView en un geste (ex: bouton "tout
 *      replier" ultérieur)
 *   2) Permet à des cas futurs (synchronisation avec la grille principale,
 *      ex: quand l'utilisateur navigue vers `cours/12` dans la grille on
 *      veut que la branche `cours` se déplie dans la TreeView) d'être
 *      ajoutés sans toucher à FinderTreeFolder.
 */

type Props = {
  adapter: FileAdapter;
  /** Chemin racine de l'arbre — typiquement l'`appRoot` du projet. */
  rootPath: string;
  /** Path actuellement ouvert dans la grille principale (highlight). */
  currentPath: string;
  /** Callback quand un dossier est cliqué — déclenche la navigation. */
  onOpen: (path: string) => void;
};

export default function FinderTree({
  adapter,
  rootPath,
  currentPath,
  onOpen,
}: Props) {
  const [rootNode, setRootNode] = useState<FinderNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openPaths, setOpenPaths] = useState<Set<string>>(() => new Set());

  function toggleOpen(path: string) {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  // ─── Chargement du trashMap (uuid → displayName) ─────────────────────────
  //
  // On charge `trash.listBin` côté front pour pouvoir, dans la TreeView,
  // substituer les noms d'uuid par leur `displayName`. Cette query est
  // toujours active (pas d'enabled conditionnel) parce que :
  //   - elle est légère (juste la liste plate, pas le contenu de chaque entry)
  //   - on ne sait pas a priori dans quelle branche l'utilisateur va naviguer
  //   - le cache React Query évite les re-fetch
  //
  // Si la query échoue (admin manquant, network), on tombe sur une Map vide :
  // le rendu reste cohérent (les uuids apparaîtront tels quels), sans crasher.
  const { data: trashListData } = trpc.trash.listBin.useQuery(
    { appRoot: APP_ROOT, limit: 100 },
    { refetchOnWindowFocus: false, staleTime: 10_000 }
  );

  const trashMap: TrashMap = useMemo(() => {
    const map = new Map() as TrashMap;
    const items: TrashEntryDTO[] = trashListData?.items ?? [];
    for (const entry of items) {
      map.set(entry.id, { displayName: entry.displayName, kind: entry.kind });
    }
    return map;
  }, [trashListData]);

  // Détection du changement de deps fetch — on reset le state SYNCHRONIQUEMENT
  // dans le render path (pas dans le useEffect), ce qui évite le warning
  // React 19 "react-hooks/set-state-in-effect" et donne un comportement plus
  // prévisible : le reset du loading est visible au MÊME render que le
  // déclenchement du nouveau fetch.
  //
  // Pattern officiellement documenté par React :
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const prevRootPath = useRef(rootPath);
  const prevAdapter = useRef(adapter);

  if (prevRootPath.current !== rootPath || prevAdapter.current !== adapter) {
    prevRootPath.current = rootPath;
    prevAdapter.current = adapter;
    setIsLoading(true);
    setLoadError(null);
  }

  // Chargement initial : 2 niveaux d'avance.
  useEffect(() => {
    let cancelled = false;

    if (!adapter.getTree) {
      setLoadError('Adapter sans getTree — la TreeView ne peut pas s\'afficher');
      setIsLoading(false);
      return;
    }

    adapter
      .getTree({ path: rootPath, depth: 2 })
      .then(({ root }) => {
        if (cancelled) return;
        setRootNode(root);

        // ─── Préchauffage du cache partagé store ─────────────────────────
        //
        // L'arbre initial contient les children de plusieurs niveaux
        // (rootPath, ses enfants, et les petits-enfants pour depth=2).
        // On parcourt récursivement et on cache les children de chaque
        // node folder.
        //
        // Bénéfice : si l'utilisateur clique sur `bin` ou `pending/Cours`
        // dans la TreeView, la GridView a déjà la donnée en cache et
        // affiche le contenu instantanément sans spinner.
        const cacheChildrenAt = useFinderStore.getState().cacheChildrenAt;
        function walk(node: FinderNode) {
          if (node.type === 'folder' && node.children !== undefined) {
            cacheChildrenAt(node.path, node.children);
            for (const child of node.children) {
              walk(child);
            }
          }
        }
        walk(root);
      })
      .catch((err) => {
        console.error('[FinderTree] getTree initial failed', err);
        if (cancelled) return;
        setLoadError('Erreur de chargement de l\'arborescence');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adapter, rootPath]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Chargement de l&apos;arborescence...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-2 py-2 text-sm text-destructive" role="alert">
        {loadError}
      </div>
    );
  }

  if (!rootNode || !rootNode.children || rootNode.children.length === 0) {
    return (
      <div className="px-2 py-2 text-sm text-muted-foreground italic">
        Aucun élément
      </div>
    );
  }

  // Choix B2 validé : on affiche les ENFANTS du rootPath directement (et
  // non le rootPath lui-même comme un nœud cliquable). Pour AKFC, ces
  // enfants sont les status-folders pending / published / bin, mais on
  // affiche aussi les éventuels fichiers présents directement à la racine.
  const topLevelChildren = rootNode.children;

  return (
    <TrashMapProvider value={trashMap}>
      <div className="space-y-0.5">
        {topLevelChildren.map((child) =>
          child.type === 'folder' ? (
            <FinderTreeFolder
              key={child.path}
              node={child}
              adapter={adapter}
              currentPath={currentPath}
              onOpen={onOpen}
              openPaths={openPaths}
              onToggleOpen={toggleOpen}
            />
          ) : (
            <FinderTreeFile key={child.path} node={child} />
          ),
        )}
      </div>
    </TrashMapProvider>
  );
}
