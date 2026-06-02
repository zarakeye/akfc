'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';
import type { FileAdapter } from '@contracts/finder';

import { APP_ROOT } from '@config/app';
import { trpc } from '@trpc/trpcClient';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import { useTrashMap } from '@features/finder-core/state/TrashMapContext';
import { isStatusFolder } from '@features/finder-core/utils/statusFolders';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';
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
  /**
   * Callback déclenché au début d'un drag depuis ce dossier. Optionnel —
   * si non fourni, le dossier n'est pas drag-source (mais reste drop-target).
   * Identique au handler passé aux `GridItem`.
   */
  onDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  /**
   * Callback déclenché au long-press (>= 500ms) sur ce dossier.
   * Active le mode multi-select dans le store partagé.
   */
  onLongPress?: (node: FinderNode) => void;
};

export default function FinderTreeFolder({
  node,
  adapter,
  currentPath,
  onOpen,
  openPaths,
  onToggleOpen,
  onDragStart,
  onLongPress,
}: Props) {
  const isOpen = openPaths.has(node.path);
  const isActive = node.path === currentPath;

  // Détection : ce node est-il un dossier de statut (pending/published/bin) ?
  // Si oui, il est exclu des actions destructives ET des actions de sélection
  // (cf. doc dans utils/statusFolders.ts).
  const isStatus = isStatusFolder(node.path);

  // Hook longpress : instancié inconditionnellement (rules of hooks).
  // Le callback no-op silencieusement si c'est un status folder OU si le
  // parent n'a pas fourni `onLongPress`.
  const longPress = useLongPress(() => {
    if (isStatus) return;
    if (onLongPress) onLongPress(node);
  });

  // Drag-source désactivé sur les status folders (intouchables).
  const isDraggable = Boolean(onDragStart) && !isStatus;

  // ─── Context menu (right-click) ─────────────────────────────────────────
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    return [
      {
        label: deleteLabel(targetNodes.length, targetNodes),
        destructive: true,
        onClick: () => {
          void deleteNodes(targetNodes);
        },
      },
    ];
  }

  // Mutation tRPC pour envoyer du contenu vers la corbeille.
  //
  // ─── Pourquoi cette mutation est définie ici ─────────────────────────
  //
  // Quand l'utilisateur drop un fichier sur le node `bin`, le comportement
  // attendu n'est PAS un move "normal" (qui placerait juste le fichier
  // dans `bin/`), mais le mécanisme **trashToBin** complet :
  //   - Génère un uuid
  //   - Move le fichier vers `bin/.trash/<uuid>/<filename>`
  //   - Crée une `TrashEntry` en DB avec `previousPath`, `displayName`,
  //     `sizeBytes`, `cloudinaryCreatedAt`, etc.
  //
  // Sans cette procédure dédiée, la TrashEntry n'est pas créée → la vue
  // bin (FinderBinRootView) reste vide ou affiche des "dossiers uuids"
  // sans displayName. Et la restauration depuis le bin devient impossible
  // (pas de previousPath stocké).
  //
  // C'est exactement le pattern de la version legacy `cloudinary-finder`,
  // qu'on récupère ici en câblant le UI au router trash.
  const trashToBinMutation = trpc.trash.trashToBin.useMutation();

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

  // ─── 🪟 Wrapper de TrashEntry : à skip aussi visuellement ────────────────
  //
  // Le storage Cloudinary structure la corbeille en `bin/.trash/<uuid>/...`.
  // Le segment `<uuid>` est un **wrapper technique** : il existe seulement
  // pour gérer les collisions de noms (2× `photo.jpg` trashés à des
  // moments différents peuvent coexister sous deux uuids distincts).
  //
  // Côté UX, ce wrapper n'a aucune valeur : pour l'utilisateur, "un fichier
  // est un fichier, un dossier est un dossier". Voir un dossier intermédiaire
  // "Mon-fichier.jpg/" qui contient juste "Mon-fichier.jpg" est aberrant.
  //
  // La règle : tout node directement sous `.trash/` est un wrapper et doit
  // être skip — on rend directement son contenu au niveau parent (= bin
  // dans la TreeView, après skip du `.trash` lui-même).
  //
  // Détection : le path matche `<...>/bin/.trash/<uuid>` (rien après le uuid).
  // Cette regex existe déjà ligne ~473 pour le fallback displayName, on la
  // promote au niveau de la décision de skip.
  const isTrashWrapperNode = Boolean(
    node.path.match(/\/bin\/\.trash\/[^/]+$/),
  );

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

  /* ─── Auto-load des enfants des nodes skippés ─────────────────────────────
   *
   * Le node `.trash` ET les wrappers uuid sont rendus invisibles (skip pur),
   * donc l'utilisateur ne peut pas cliquer dessus pour déclencher l'expansion.
   * Or au chargement initial avec `getTree({ depth: 2 })`, on a uniquement
   * `bin > .trash` (et avec un coup de chance les uuids juste en dessous),
   * mais pas le contenu des wrappers (depth 4+).
   *
   * Sans cet auto-load, les enfants du wrapper (le vrai fichier qu'on a
   * mis à la corbeille) ne sont jamais chargés tant que personne ne clique
   * sur le wrapper — sauf qu'on ne le rend même pas comme cible cliquable.
   * Le bin apparaîtrait visuellement vide alors qu'il contient des items.
   *
   * Solution : dès qu'on monte un node skip (`.trash` OU wrapper uuid),
   * on déclenche automatiquement le chargement de ses enfants via
   * `adapter.getTree`. L'utilisateur ne voit pas de spinner (puisque le
   * node skip lui-même n'est pas rendu), seulement le résultat final :
   * le contenu du bin apparaît directement sous `bin/`.
   *
   * Guard `triggeredRef` pour éviter le re-trigger en boucle au cas où le
   * `node` change de référence (mais pas son path) après un re-render.
   */
  /* ─── Invalidation TreeView au reloadKey ──────────────────────────────────
   *
   * Le store `useFinderStore` expose un `reloadKey` qui est incrémenté à
   * chaque mutation (move, trashToBin, restore…) via `reloadFolderContent()`.
   *
   * Sans observation explicite, la TreeView garde son `loadedChildren`
   * local et n'affiche pas les changements (un fichier déplacé reste
   * visible à son ancien emplacement jusqu'au reload manuel de la page).
   *
   * Cet effet vide `loadedChildren` + reset le flag d'auto-load chaque
   * fois que `reloadKey` change. Le useEffect d'auto-load (plus haut) se
   * redéclenche alors si on est sur un node skip (`.trash` ou wrapper),
   * et pour les autres folders ouverts, leur prochain rendu provoque
   * un re-fetch via `loadChildrenLazy` au prochain toggle/expand.
   *
   * Note : on skip volontairement le PREMIER run du useEffect (au mount),
   * pour ne pas casser le chargement initial. Le premier `reloadKey` n'est
   * pas un signal d'invalidation, c'est juste la valeur de départ.
   */
  const reloadKey = useFinderStore((s) => s.reloadKey);
  const isFirstReloadKeyRef = useRef(true);
  const autoLoadTriggeredRef = useRef(false);

  useEffect(() => {
    if (isFirstReloadKeyRef.current) {
      isFirstReloadKeyRef.current = false;
      return;
    }
    setLoadedChildren(null);
    autoLoadTriggeredRef.current = false;
  }, [reloadKey]);

  useEffect(() => {
    if (!isTrashRootSkipNode && !isTrashWrapperNode) return;
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
        console.error('[FinderTreeFolder] auto-load skip-node failed', err);
        setLoadError('Erreur chargement contenu corbeille');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    isTrashRootSkipNode,
    isTrashWrapperNode,
    node.path,
    node.children,
    loadedChildren,
    adapter,
  ]);

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
  // Sélecteurs pour le comportement multi-select au click (cf. handleRowClick) :
  // sans `multiSelectActive` qui branche sur `toggleSelect` plutôt que sur
  // `onOpen`, le longpress dans la tree view serait écrasé instantanément
  // par le click qui suit le mouseup (setPath → reset multiSelectActive).
  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  // Pour afficher la checkbox en feedback visuel quand multiSelectActive.
  const selectedIds = useFinderStore((s) => s.selection.roots);

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

  /**
   * Clic sur le LIBELLÉ du dossier — comportement dépendant du mode.
   *
   * ─── Avalage du click parasite post-longpress ────────────────────────
   * `longPress.consumeJustFired()` retourne true UNE FOIS si le callback
   * longpress vient juste de tirer. Dans ce cas on return immédiatement
   * pour ne pas que ce click "fantôme" désélectionne le node qui vient
   * tout juste d'être ajouté à la sélection par le longpress.
   *
   * ─── Mode normal ─────────────────────────────────────────────────────
   * Navigation : on demande au parent d'ouvrir ce dossier dans la grille
   * principale (`onOpen` = `setPath` du store).
   *
   * ─── Mode multi-select ───────────────────────────────────────────────
   * On NE NAVIGUE PAS, on toggle juste l'appartenance du dossier à la
   * sélection. **Sauf** pour les status folders (pending/published/bin)
   * qui sont définitivement non-sélectionnables — on garde le click
   * "no-op" plutôt que de naviguer pour rester cohérent avec le fait
   * que les status folders n'ont pas de checkbox affichée.
   */
  function handleRowClick() {
    if (longPress.consumeJustFired()) return;
    if (multiSelectActive) {
      if (isStatus) return; // status folders non-sélectionnables
      toggleSelect(node.id);
      return;
    }
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
    // stopPropagation pour éviter que l'event bubble vers un FinderTreeFolder
    // parent (qui aurait alors aussi marqué `isDragOver=true` à tort).
    // Indispensable depuis l'extension de la drop zone au wrapper englobant.
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
    // Sans cet appel, onDrop ne se déclenchera jamais.
    e.preventDefault();
    e.stopPropagation();
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
    // stopPropagation : indispensable depuis l'extension de la drop zone
    // au wrapper englobant. Sans cela, un drop sur un sous-folder serait
    // catché par le sous-folder ET par son parent → double mutation.
    e.stopPropagation();
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

    // ─── Cas spécial : drop sur la racine du bin ─────────────────────────
    //
    // Quand l'utilisateur drop des items sur le node `bin` (la racine de
    // la corbeille), on ne fait PAS un move normal — on appelle la
    // procédure dédiée `trash.trashToBin` qui :
    //   1. Génère un uuid par item
    //   2. Move chaque item vers `bin/.trash/<uuid>/...` côté Cloudinary
    //   3. Crée une TrashEntry en DB avec previousPath + displayName,
    //      indispensable pour la vue corbeille (FinderBinRootView) ET
    //      pour la restauration ultérieure.
    //
    // Note : seul le path EXACT `${APP_ROOT}/bin` déclenche ce mode.
    // Si l'utilisateur drop dans un sous-dossier de la corbeille (un
    // `.trash/<uuid>/`), on tombe sur le `moveItems` standard — c'est
    // un cas edge qu'on traite comme un move ordinaire, faute de
    // sémantique métier claire pour "déplacer dans une entry existante".
    const BIN_ROOT_PATH = `${APP_ROOT}/bin`;

    if (targetPath === BIN_ROOT_PATH) {
      try {
        await trashToBinMutation.mutateAsync({
          appRoot: APP_ROOT,
          // Mapping DragItem → source attendu par trashToBinInputSchema.
          // On utilise toujours kind 'folder' ou 'file' selon le type du
          // DragItem ; pas de mode 'selection' ici puisque le payload du
          // drag transporte déjà la liste explicite des items.
          sources: items.map((it) => ({
            kind: it.type === 'folder' ? ('folder' as const) : ('file' as const),
            fullPath: it.path,
          })),
        });
        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        console.error('[FinderTreeFolder] trashToBin failed', err);
      }
      return;
    }

    // ─── Cas normal : move agnostique via l'adapter ──────────────────────
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
  // ─── Skip visuel du `.trash` ET des wrappers uuid ────────────────────────
  //
  // Le node `.trash` lui-même est rendu invisible (skip pur) — voir détection
  // `isTrashRootSkipNode`. À la place, on rend ses enfants au niveau parent.
  //
  // ➕ Depuis ce sous-chantier, on skip aussi les **wrappers uuid** (les
  // dossiers techniques `bin/.trash/<uuid>/`). Comme `.trash`, ils sont
  // techniques et sans valeur UX : leur contenu doit apparaître directement
  // au niveau de `bin` dans la TreeView, pour respecter la sémantique
  // "un fichier est un fichier, un dossier est un dossier".
  //
  // Les deux cas ont exactement le même traitement : on rend le contenu
  // (`effectiveChildren`) tel quel, en propageant les handlers DnD/longpress
  // pour qu'ils restent fonctionnels sur les enfants exposés.
  //
  // ⚠️ Côté GridView, le comportement est différent :
  //   - À `${APP_ROOT}/bin` (root du bin), on affiche `FinderBinRootView`
  //     (vue plate des TrashEntry, indépendante de la structure storage).
  //   - À `${APP_ROOT}/bin/.trash/<uuid>` (drilldown), on affiche le
  //     contenu réel du wrapper — utile si l'entry est un dossier avec
  //     plusieurs fichiers (ex: dossier "Photos/" entier mis à la corbeille).
  if (isTrashRootSkipNode || isTrashWrapperNode) {
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
              onDragStart={onDragStart}
              onLongPress={onLongPress}
            />
          ) : (
            <FinderTreeFile
              key={child.path}
              node={child}
              onDragStart={onDragStart}
              onLongPress={onLongPress}
            />
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
    <div
      className="select-none"
      // ─── Drop zone étendue ──────────────────────────────────────────────
      //
      // Les handlers sont posés sur ce wrapper englobant — qui couvre à la
      // fois la ligne du folder (chevron + nom) ET le conteneur des enfants
      // (sous-folders et fichiers). Ainsi un drop n'importe où dans ce
      // sous-arbre est interprété comme un drop dans CE folder.
      //
      // Le bubble vers un FinderTreeFolder parent est bloqué via
      // `e.stopPropagation()` dans chaque handler — sinon un drop sur un
      // sous-folder serait catché par le sous-folder ET par son parent.
      //
      // ⚠️ Cette zone ne couvre PAS les fichiers de la GridView centrale
      // (qui ont leurs propres drop zones via `data-finder-drop-path`).
      // Ici on ne parle que de la TreeView.
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Ligne du dossier : chevron + icône + nom — surbrillance drop pose ICI */}
      <div
        onClick={handleRowClick}
        onContextMenu={
          isStatus
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuPos({ x: e.clientX, y: e.clientY });
              }
        }
        // Drag-source (nouveau) : ce dossier peut être déplacé par DnD.
        // Le folder reste drop-target pour les drops entrants — un même
        // élément peut être à la fois source et cible (HTML5 DnD le permet).
        draggable={isDraggable}
        onDragStart={
          onDragStart
            ? (e) => {
                longPress.onDragStart();
                onDragStart(e, node);
              }
            : undefined
        }
        // Long-press → multi-select (nouveau, parité avec GridItem)
        onMouseDown={longPress.onMouseDown}
        onMouseUp={longPress.onMouseUp}
        onMouseLeave={longPress.onMouseLeave}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
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

        {/* ─── Checkbox multi-select (parité avec GridItem et FinderTreeFile) ─
            Visible seulement quand `multiSelectActive`. C'est ce qui donne
            le feedback visuel attendu après un longpress (qui sinon active
            le mode silencieusement et laissait croire que rien ne s'est passé).
            En `readOnly` : le toggle est fait via le `onClick` du div parent
            (handleRowClick → toggleSelect en mode multi). Le clic sur la
            checkbox elle-même bubble vers ce handler donc l'expérience est
            cohérente. */}
        {/* ─── Checkbox multi-select (parité avec GridItem et FinderTreeFile) ─
            Visible seulement quand `multiSelectActive` ET que le node n'est
            PAS un status folder (cf. utils/statusFolders.ts : pending,
            published, bin sont définitivement non-sélectionnables).
            En `readOnly` : le toggle est fait via le `onClick` du div parent
            (handleRowClick → toggleSelect en mode multi). */}
        {multiSelectActive && !isStatus && (
          <input
            type="checkbox"
            checked={selectedIds.has(node.id)}
            readOnly
            className="shrink-0"
          />
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
                onDragStart={onDragStart}
                onLongPress={onLongPress}
              />
            ) : (
              <FinderTreeFile
                key={child.path}
                node={child}
                onDragStart={onDragStart}
                onLongPress={onLongPress}
              />
            ),
          )}
        </div>
      )}

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={buildMenuItems()}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
}
