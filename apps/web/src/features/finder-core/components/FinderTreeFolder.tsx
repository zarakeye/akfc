'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';
import type { FileAdapter } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useTrashMap } from '@features/finder-core/state/TrashMapContext';
import {
  FINDER_DRAG_MIME,
  tryParsePayload,
  isDropAllowed,
  isDropEffective,
} from '@features/finder-core/dnd/payload';
import FinderTreeFile from '@features/finder-core/components/FinderTreeFile';

/**
 * FinderTreeFolder
 *
 * Composant récursif d'un dossier dans la TreeView.
 *
 * ─── Lazy loading ─────────────────────────────────────────────────────────
 *
 * À la première expansion d'un dossier dont les enfants ne sont pas déjà
 * chargés (cas où `node.children === undefined` à cause de la frontière de
 * `depth` du `getTree` initial), on appelle `adapter.getTree({ path, depth: 1 })`
 * pour rapatrier ses enfants directs. Le résultat est gardé localement
 * dans `loadedChildren` — une fois chargé, il ne sera pas re-fetché
 * (replier puis redéplier ne déclenche pas de nouvel appel).
 *
 * ─── Barre verticale ──────────────────────────────────────────────────────
 *
 * Le visuel "barre verticale fine" qui rattache les enfants à leur parent
 * est obtenu via `border-l` sur le conteneur des enfants, avec un padding
 * gauche qui décale le contenu. Cette technique se compose naturellement
 * sur la récursion : chaque sous-niveau ajoute sa propre barre.
 */

type Props = {
  node: FinderNode;
  adapter: FileAdapter;
  /**
   * Chemin actuellement sélectionné dans le finder. Utilisé pour mettre
   * en évidence le dossier ouvert dans la grille principale.
   */
  currentPath: string;
  /**
   * Callback déclenché quand l'utilisateur clique sur le LIBELLÉ du
   * dossier (par opposition au chevron qui gère seulement l'expansion).
   * C'est ce qui fait que la grille principale navigue vers ce dossier.
   */
  onOpen: (path: string) => void;
  /**
   * Set partagé des paths actuellement dépliés dans toute la TreeView.
   * Il est tenu par le composant racine `FinderTree`. Le composant lit
   * son état d'ouverture via `openPaths.has(node.path)` et notifie
   * `onToggleOpen` quand l'utilisateur change cet état.
   */
  openPaths: Set<string>;
  onToggleOpen: (path: string) => void;
};

export default function FinderTreeFolder({
  node,
  adapter,
  currentPath,
  onOpen,
  openPaths,
  onToggleOpen,
}: Props) {
  const isOpen = openPaths.has(node.path);
  const isActive = node.path === currentPath;

  // ─── Trash UI : skip `.trash` + rename uuids ──────────────────────────────
  //
  // Le storage Cloudinary réel a la structure :
  //   AKFC/bin/.trash/<uuid>/<contenu_original>
  //
  // L'arbre retourné par le backend EXPOSE cette structure telle quelle.
  // Le frontend masque le segment `.trash` et substitue chaque uuid par
  // son `displayName` pour donner à l'utilisateur l'impression d'une
  // hiérarchie naturelle :
  //   bin > "Mon dossier supprimé" > <contenu>
  //
  // Référence : le legacy Cloudinary-specific (depuis supprimé) faisait
  // exactement la même chose. On reproduit ici en profitant du Context
  // `TrashMapContext` provisionné par `FinderTree`.
  //
  // Détection :
  //   - inTrashStorage : le path du node passe par `bin/.trash/`
  //   - isTrashRootSkipNode : le name du node est `.trash` — détection
  //     volontairement SIMPLE pour éviter tout glitch lié à des variations
  //     de format du path (trailing slash, normalisation, etc.). En pratique
  //     un seul `.trash` existe par projet (sous `bin`), donc pas de risque
  //     de faux positif.
  //   - trashEntryForName : si le name est connu dans trashMap, on a une
  //     trashEntry → on substitue le label
  const trashMap = useTrashMap();

  const inTrashStorage = node.path.includes('/.trash/') || node.path.endsWith('/.trash');
  const isTrashRootSkipNode = node.name === '.trash';
  const trashEntryForName = trashMap.get(node.name);

  /**
   * Enfants chargés à la demande lors de la première expansion.
   * - `null` : pas encore chargé
   * - tableau (même vide) : chargement terminé
   *
   * Cet état n'est utilisé QUE quand `node.children === undefined`
   * (frontière de depth de l'appel initial). Si `node.children` est
   * déjà rempli au montage, on l'utilise tel quel.
   */
  const [loadedChildren, setLoadedChildren] = useState<FinderNode[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* ─── Auto-load des enfants du `.trash` ───────────────────────────────────
   *
   * Le node `.trash` est rendu invisible (skip pur), donc l'utilisateur ne
   * peut pas cliquer dessus pour déclencher l'expansion. Or au chargement
   * initial avec `getTree({ depth: 2 })`, on a `bin > .trash` mais PAS
   * encore `bin > .trash > <uuids>` (depth 3).
   *
   * Sans ce useEffect, déplier `bin` rend les enfants de `.trash` (qui
   * deviennent les enfants visuels de `bin`) MAIS ce tableau est vide
   * tant qu'on n'a pas chargé. Donc `bin` apparaît vide même s'il y a
   * du contenu dans la corbeille.
   *
   * Solution : dès qu'on monte un `.trash` skip node, on déclenche
   * automatiquement le chargement de ses enfants via `adapter.getTree`.
   * L'utilisateur ne voit pas de spinner (puisque le node `.trash` lui-
   * même n'est pas rendu), seulement le résultat final : les uuids
   * (renommés via trashMap) apparaissent sous `bin`.
   *
   * Guard `triggeredRef` pour éviter le re-trigger en boucle au cas où le
   * `node` change de référence (mais pas son path) après un re-render.
   */
  const autoLoadTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isTrashRootSkipNode) return;
    if (autoLoadTriggeredRef.current) return;
    if (node.children && node.children.length > 0) return; // déjà chargé
    if (loadedChildren !== null) return; // déjà chargé/en cours
    if (!adapter.getTree) return;

    // Check le cache partagé : peut-être que la GridView l'a déjà chargé
    const cached = useFinderStore.getState().contentCache.get(node.path);
    if (cached) {
      autoLoadTriggeredRef.current = true;
      setLoadedChildren([...cached.folders, ...cached.files]);
      return;
    }

    autoLoadTriggeredRef.current = true;
    setIsLoading(true);

    adapter
      .getTree({ path: node.path, depth: 1 })
      .then(({ root }) => {
        const children = root.children ?? [];
        setLoadedChildren(children);
        // Partage avec la GridView
        useFinderStore.getState().cacheChildrenAt(node.path, children);
      })
      .catch((err) => {
        console.error('[FinderTreeFolder] auto-load .trash failed', err);
        setLoadError('Erreur chargement contenu corbeille');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isTrashRootSkipNode, node.path, node.children, loadedChildren, adapter]);

  /**
   * Surbrillance "drop target hover".
   *
   * Le DnD natif HTML5 émet `dragenter`/`dragleave` sur chaque enfant
   * traversé : on évite le clignotement avec une vérification
   * `currentTarget.contains(relatedTarget)` dans `onDragLeave`.
   */
  const [isDragOver, setIsDragOver] = useState(false);

  // Pour rafraîchir la grille principale après un drop réussi.
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  // Pour clear la sélection après un drop : les items déplacés ne sont
  // plus dans le dossier courant, garder leurs ids dans roots est incohérent
  // (et fausserait le compteur de la MultiSelectToolbar).
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  /**
   * Source effective des enfants à afficher : priorité aux enfants
   * pré-chargés par l'appel initial, puis au lazy chargé localement.
   */
  const effectiveChildren: FinderNode[] | undefined =
    node.children !== undefined ? node.children : (loadedChildren ?? undefined);

  const hasChildren = node.hasChildren ?? (effectiveChildren?.length ?? 0) > 0;

  async function ensureChildrenLoaded(): Promise<void> {
    // Déjà chargés (par l'appel initial ou par un lazy précédent) : rien à faire.
    if (effectiveChildren !== undefined) return;

    // ─── Check du cache partagé store ────────────────────────────────────
    //
    // Si la GridView (`useFinderData`) a déjà chargé le contenu de ce path,
    // on le réutilise plutôt que de relancer une requête réseau. Inversement,
    // une fois qu'on aura chargé via getTree, on populera le cache pour que
    // la GridView puisse l'utiliser quand on navigue vers ce path.
    //
    // C'est ce qui réunit les deux vues : un seul fetch fait gagne pour
    // les deux côtés.
    const cached = useFinderStore.getState().contentCache.get(node.path);
    if (cached) {
      setLoadedChildren([...cached.folders, ...cached.files]);
      return;
    }

    if (!adapter.getTree) {
      setLoadError('Adapter sans getTree — impossible de déplier');
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const { root } = await adapter.getTree({ path: node.path, depth: 1 });
      const children = root.children ?? [];
      setLoadedChildren(children);
      // Partage avec la GridView : si l'utilisateur clique ensuite sur ce
      // path pour naviguer dedans, useFinderData verra le cache et skip le fetch.
      useFinderStore.getState().cacheChildrenAt(node.path, children);
    } catch (err) {
      console.error('[FinderTreeFolder] getTree failed', err);
      setLoadError('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleOpen(e: React.MouseEvent) {
    e.stopPropagation();

    // Si on s'apprête à ouvrir et que les enfants ne sont pas chargés,
    // on lance le fetch AVANT d'enregistrer l'état "ouvert" — comme ça,
    // le rendu "ouvert mais en chargement" est cohérent.
    if (!isOpen) {
      await ensureChildrenLoaded();
    }
    onToggleOpen(node.path);
  }

  function handleRowClick() {
    onOpen(node.path);
  }

  /* -------------------------------------------------------------------------- */
  /*                                  DnD TARGET                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Filtre : seuls les drags qui portent notre MIME sont acceptés.
   * Pendant `dragover`, `dataTransfer.getData()` retourne `""` pour des
   * raisons de sécurité — on ne peut tester que la présence du MIME via
   * `dataTransfer.types`. C'est suffisant pour décider d'activer ou non
   * le visuel et de `preventDefault` (nécessaire pour autoriser le drop).
   */
  function isFinderDrag(e: React.DragEvent): boolean {
    return e.dataTransfer.types.includes(FINDER_DRAG_MIME);
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
    // Sans cet appel, onDrop ne se déclenchera jamais.
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Le DOM émet dragleave à chaque traversée d'un enfant : on l'ignore
    // tant qu'on est encore dans le sous-arbre de currentTarget.
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setIsDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData(FINDER_DRAG_MIME);
    const payload = tryParsePayload(raw);
    if (!payload) return;

    const items = payload.items;
    const targetPath = node.path;

    // Garde-fous (cf. payload.ts pour les règles précises) :
    //   - pas de drop sur soi-même ou dans un descendant → drop invalide
    //   - drop dans le parent direct → no-op silencieux, on évite le réseau
    if (!isDropAllowed(targetPath, items)) return;
    if (!isDropEffective(targetPath, items)) return;

    if (!adapter.moveItems) {
      console.warn('[FinderTreeFolder] adapter.moveItems unavailable, drop ignoré');
      return;
    }

    try {
      await adapter.moveItems({
        items,
        target: { type: 'folder', path: targetPath },
      });
      // Refresh de la grille principale : les items déplacés ne sont plus
      // dans le dossier courant. La TreeView, elle, ne se recharge pas
      // automatiquement (sera revu en 4.5 si besoin).
      reloadFolderContent();
      // Sort du mode multi-select et vide la sélection. Idempotent en mode
      // normal (set false → false). Évite des ids orphelins dans roots.
      exitMultiSelect();
    } catch (err) {
      console.error('[FinderTreeFolder] drop failed', err);
    }
  }

  // Chevron : caché si le dossier n'a aucun enfant (cas hasChildren explicite à false)
  // ou si on a chargé et trouvé un tableau vide.
  const showChevron = hasChildren && (effectiveChildren?.length ?? 1) > 0;

  // ─── Skip visuel du node `.trash` ─────────────────────────────────────────
  //
  // Le node `.trash` lui-même n'est PAS rendu (ni sa ligne ni son container
  // indenté). À la place, on rend uniquement ses enfants au niveau du parent
  // — comme si `.trash` n'existait pas dans la hiérarchie côté UI.
  //
  // Note technique : les enfants de `.trash` (les uuids) ont déjà été
  // chargés par le `getTree({ depth: 2 })` initial puisqu'ils sont à 2
  // niveaux sous le rootPath (`AKFC > bin > .trash > <uuid>`). Donc
  // `effectiveChildren` est généralement disponible sans lazy load.
  //
  // L'indentation visuelle est PRÉSERVÉE : les uuids apparaîtront indentés
  // d'un niveau (celui de `bin`), pas deux. C'est exactement ce qu'on veut.
  if (isTrashRootSkipNode) {
    return (
      <>
        {effectiveChildren?.map((child) =>
          child.type === 'folder' ? (
            <FinderTreeFolder
              key={child.path}
              node={child}
              adapter={adapter}
              currentPath={currentPath}
              onOpen={onOpen}
              openPaths={openPaths}
              onToggleOpen={onToggleOpen}
            />
          ) : (
            <FinderTreeFile key={child.path} node={child} />
          ),
        )}
      </>
    );
  }

  // ─── Substitution du label uuid → displayName ─────────────────────────────
  //
  // Si on est dans le storage trash ET que le name du node est connu dans le
  // trashMap, on remplace l'uuid affiché par le `displayName` plus lisible.
  // Sinon (cas hors trash, ou trashId pas encore chargé), on garde le nom
  // brut. La fallback `'Élément supprimé'` apparaît si on est dans `.trash`
  // sans match dans trashMap (cas rare : le listing en cours de chargement,
  // ou un orphelin DB).
  let displayLabel = node.name;
  if (inTrashStorage && trashEntryForName) {
    displayLabel = trashEntryForName.displayName;
  } else if (inTrashStorage && !trashEntryForName && node.path.match(/\/bin\/\.trash\/[^/]+$/)) {
    // Le node est un dossier-uuid mais pas (encore) dans trashMap.
    // Affichage de secours : `'Élément supprimé'` au lieu de l'uuid technique.
    displayLabel = 'Élément supprimé';
  }

  return (
    <div className="select-none">
      {/* Ligne du dossier : chevron + icône + nom — c'est aussi la drop zone */}
      <div
        onClick={handleRowClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        // Attribut lu par le ghost manager pour calculer le badge allowed/forbidden
        // via document.elementFromPoint pendant le tracking du drag.
        data-finder-drop-path={node.path}
        className={clsx(
          'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm',
          isActive && !isDragOver && 'bg-accent text-accent-foreground font-medium',
          !isActive && !isDragOver && 'hover:bg-accent/40',
          // Surbrillance drop-target : prend le pas sur isActive pour bien signaler la cible
          isDragOver && 'bg-blue-100 ring-1 ring-blue-300',
        )}
        title={node.path}
      >
        {/* Chevron — zone de clic indépendante pour ne pas confondre avec le clic-pour-ouvrir-le-dossier */}
        {showChevron ? (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={isOpen ? 'Replier' : 'Déplier'}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          // Espacement constant pour aligner les noms quand pas de chevron
          <span className="inline-block h-4 w-4" />
        )}

        {/* Icône dossier (ouvert / fermé) */}
        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {/* Nom du dossier — `displayLabel` substitue les uuids trash par leur displayName */}
        <span className="truncate capitalize">{displayLabel}</span>
      </div>

      {/* Erreur de chargement (cas rare, on garde la place visuellement) */}
      {loadError && isOpen && (
        <div className="ml-3 pl-3 border-l border-border">
          <div className="px-2 py-1 text-xs text-destructive">{loadError}</div>
        </div>
      )}

      {/* Enfants — barre verticale + indentation */}
      {isOpen && effectiveChildren && effectiveChildren.length > 0 && (
        <div className="ml-3 pl-3 border-l border-border">
          {effectiveChildren.map((child) =>
            child.type === 'folder' ? (
              <FinderTreeFolder
                key={child.path}
                node={child}
                adapter={adapter}
                currentPath={currentPath}
                onOpen={onOpen}
                openPaths={openPaths}
                onToggleOpen={onToggleOpen}
              />
            ) : (
              <FinderTreeFile key={child.path} node={child} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
