'use client';

import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  useGroupRef,
  type Layout,
} from 'react-resizable-panels';
import { Loader2, AlertCircle, PanelRightClose, PanelRightOpen, Trash2, X } from 'lucide-react';
import type { FileAdapter, FinderNode } from '@contracts/finder';
import { APP_ROOT } from '@config/app';

import FinderBinRootView from '@features/finder-core/components/FinderBinRootView';
import FinderViewModeSwitcher from '@features/finder-core/components/FinderViewModeSwitcher';
import FinderTableRow from '@features/finder-core/components/FinderTableRow';
import FinderCompactRow from '@features/finder-core/components/FinderCompactRow';

import { useFinderData } from '@features/finder-core/hooks/useFinderData';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

import Breadcrumb from '@features/finder-core/components/Breadcrumb';
import PreviewPanel from '@features/finder-core/components/PreviewPanel';
import FinderTree from '@features/finder-core/components/FinderTree';
import GridItem from '@features/finder-core/components/GridItem';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';

import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import { useMediaAssetEnrichment } from '@features/finder-core/hooks/useMediaAssetEnrichment';
import { useFinderSearch } from '@features/finder-core/hooks/useFinderSearch';

import FinderSearchBar from '@features/finder-core/components/FinderSearchBar';
import SearchResultsView from '@features/finder-core/components/SearchResultsView';

import { sortNodes, groupNodes } from '@features/finder-core/utils/sortNodes';
import type { SortField } from '@features/finder-core/state/useFinderStore';


import { getTriState, type TriState } from '@features/finder-core/utils/triState';

import { startDragGhost, type GhostPreview } from '@features/finder-core/dnd/dragGhost';
import {
  FINDER_DRAG_MIME,
  serializePayload,
  dragItemFromNode,
  type DragItem,
} from '@features/finder-core/dnd/payload';

/**
 * Clé localStorage utilisée pour persister la disposition (largeur) des 3
 * panneaux du finder. Centralisée ici pour qu'on puisse facilement clear
 * via devtools : `localStorage.removeItem('akfc:finder:layout')`.
 */
const LAYOUT_STORAGE_KEY = 'akfc:finder:layout';

type Props = {
  adapter: FileAdapter;
  /**
   * Chemin racine de l'arbre du finder.
   *
   * Utilisé par la TreeView (colonne de gauche) comme point de départ
   * pour `getTree`. Pour AKFC, c'est typiquement l'`appRoot` du projet
   * (ex: "AKFC") — la TreeView en affichera les enfants directs, qui
   * sont les status-folders pending / published / bin.
   */
  rootPath: string;
};

/* -------------------------------------------------------------------------- */
/*                                FINDER (root)                               */
/* -------------------------------------------------------------------------- */

/**
 * Layout 3-panel resizable (TreeView | Grille | PreviewPanel).
 *
 * ─── Resize ────────────────────────────────────────────────────────────────
 *
 * On utilise `react-resizable-panels` v4 (API `Group` / `Panel` / `Separator`).
 *
 * Tailles par défaut :
 *   - TreeView : 22% (15-35%)
 *   - Grille   : 53% (30%+)
 *   - Preview  : 25% (0-40%, collapsible — permet de fermer le panneau)
 *
 * Persistance : `useDefaultLayout({ groupId })` stocke la dernière layout
 * choisie par l'utilisateur dans localStorage (sous une clé dérivée de
 * `groupId`). Le hook initialise `storage` à `localStorage` par défaut
 * lorsqu'il est exécuté côté client. Côté SSR, `defaultLayout` est vide
 * au 1er render puis hydrate avec la valeur stockée — pas de mismatch
 * gênant en pratique.
 *
 * ─── Loading & erreur non-décalants ────────────────────────────────────────
 *
 * Le précédent layout faisait apparaître un div "Loading..." qui poussait
 * tout vers le bas — désagréable visuellement. Désormais :
 *   - Un spinner discret apparaît à droite du breadcrumb (taille réservée
 *     dans tous les cas, donc pas de shift)
 *   - Une erreur apparaît en banner sous le breadcrumb, non-décalant car
 *     elle reste contenue dans la zone header
 *   - Au TOUT premier chargement (zéro contenu encore connu), un overlay
 *     centré s'affiche par-dessus le panneau central pour éviter une
 *     fenêtre vide angoissante. Cet overlay disparaît dès qu'il y a du
 *     contenu à montrer.
 */
export default function Finder({ adapter, rootPath }: Props): JSX.Element {
  const {
    folders,
    files,
    currentPath,
    setPath,
    selection,
    toggleSelect,
    selectOnly,
    selectRange,
    multiSelectActive,
    enterMultiSelect,
    exitMultiSelect,
    viewMode,
    sort,
    setSortPrimary,
    setSortSecondary,
    toggleSortDirection,
    resetSort,
  } = useFinderStore();

  const { loading, error } = useFinderData(adapter);

  // Enrichissement silencieux des FinderNodes avec les metadata DB
  // (createdAt, uploadedBy, dimensions, etc.) — cf. doc dans le hook.
  // Le fetch se déclenche à chaque changement de contenu et merge les
  // metas dans le store dès qu'elles arrivent.
  useMediaAssetEnrichment();

  // Recherche récursive : observe `search.query` + flags + currentPath et
  // déclenche un fetch tRPC debouncé qui peuple `search.results` du store.
  // Le hook est silencieux quand la query est vide.
  useFinderSearch();

  // Mode recherche actif : on switch la vue centrale en SearchResultsView
  // dès que l'user a tapé quelque chose (loading ou non, résultats ou non).
  const searchActive = useFinderStore((s) => s.search.query.trim().length > 0);

  // Actions delete/trashToBin adaptatives selon contexte (cf. useNodeActions.ts).
  // Utilisé par les boutons du header en mode multi-select.
  const { deleteNodes, deleteLabel } = useNodeActions();

  // ─── Tri + groupage des items ─────────────────────────────────────────
  //
  // On fusionne folders et files dans une seule liste triée pour pouvoir
  // grouper de façon cohérente selon le critère primaire. Exemples :
  //
  //   - Tri par `name` : items mélangés alphabétiquement avec un header
  //     par lettre initiale (A, B, C…), folders et files entremêlés.
  //   - Tri par `type` : header "Dossiers" en premier (folders d'abord
  //     car le comparateur le garantit), puis "Images", "Vidéos", etc.
  //   - Tri par `size` : buckets fixes (< 1 MB, 1–10 MB, etc.).
  //
  // Pattern macOS Finder en mode "Groupé par".
  //
  // useMemo : on évite de re-trier et re-grouper à chaque render. Les clés
  // couvrent tous les cas où le résultat peut changer.
  const sortedAllItems = useMemo(
    () => sortNodes([...folders, ...files], sort),
    [folders, files, sort],
  );

  const groups = useMemo(
    () => groupNodes(sortedAllItems, sort.primary),
    [sortedAllItems, sort.primary],
  );

  // Ref impératif sur le Panel preview pour le toggle collapse/expand depuis
  // le bouton du header. `usePanelRef` est exporté en v4 et donne un ref
  // déjà correctement typé pour l'API impérative du Panel.
  const previewPanelRef = usePanelRef();
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  function togglePreviewPanel() {
    const panel = previewPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }

  /* -------------------------- Persistance du layout ----------------------- */
  /**
   * Sauvegarde et restauration des tailles des 3 panneaux dans localStorage.
   *
   * ─── Pourquoi pas `useDefaultLayout` (le hook v4 prévu pour ça) ? ─────────
   *
   * Le hook officiel accède à `localStorage` pendant l'exécution du hook,
   * y compris pendant le rendu serveur (SSR) — ce qui crashe en Next 16
   * avec `ReferenceError: localStorage is not defined`. Bug connu.
   *
   * ─── Stratégie alternative ────────────────────────────────────────────────
   *
   * On gère la persistance manuellement avec deux mécanismes simples :
   *   - **Au mount** (côté client uniquement, dans un `useEffect`), on lit
   *     localStorage et on applique le layout via l'API impérative
   *     `groupRef.current.setLayout()`. Pas de risque SSR car le useEffect
   *     ne s'exécute que côté client après hydration.
   *   - **À chaque resize** (via `onLayoutChange`), on sauvegarde le layout
   *     dans localStorage. Le callback ne s'exécute qu'en réponse à une
   *     interaction utilisateur, donc toujours côté client.
   *
   * Le layout est stocké en JSON. Le format `Layout` de la lib est un objet
   * indexé par panel `id` (d'où l'`id` qu'on a posé sur chaque Panel).
   */
  const groupRef = useGroupRef();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved && groupRef.current) {
        const layout = JSON.parse(saved) as Layout;
        groupRef.current.setLayout(layout);
      }
    } catch {
      // Si JSON corrompu ou localStorage indisponible (mode privé strict),
      // on garde silencieusement le layout par défaut. Pas d'effet visible.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLayoutChange = useCallback((layout: Layout) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // Mode privé / quota dépassé — on laisse passer. Le layout fonctionne
      // toujours pendant la session, juste pas persisté.
    }
  }, []);

  const allNodes: FinderNode[] = [...folders, ...files];

  /**
   * 🔹 Flat list pour calcul tri-state + range
   */
  const allItems = useMemo(
    () => [
      ...folders.map((f) => ({ id: f.id, path: f.path })),
      ...files.map((f) => ({ id: f.id, path: f.path })),
    ],
    [folders, files]
  );

  /**
   * 🔹 Gestion du clic — comportement dépendant du mode.
   *
   * **Mode normal** :
   *   - folder → on navigue dedans (setPath)
   *   - file   → on sélectionne pour le PreviewPanel (selectOnly)
   *
   * **Mode multi-select** :
   *   - shift+click → range selection
   *   - simple-clic → toggle de l'item
   *   (cmd/ctrl est redondant avec un simple-clic dans ce mode, on n'en
   *    fait pas un cas séparé pour éviter une logique inutile)
   */
  function handleClick(node: FinderNode, e: React.MouseEvent) {
    if (multiSelectActive) {
      // SHIFT → range
      if (e.shiftKey && selection.anchorId) {
        const ids = allItems.map((i) => i.id);
        const start = ids.indexOf(selection.anchorId);
        const end = ids.indexOf(node.id);

        if (start !== -1 && end !== -1) {
          const [from, to] = start < end ? [start, end] : [end, start];
          selectRange(ids.slice(from, to + 1));
          return;
        }
      }

      toggleSelect(node.id);
      return;
    }

    // Mode normal
    if (node.type === 'folder') {
      setPath(node.path);
    } else {
      selectOnly(node.id);
    }
  }

  /**
   * 🔹 Double-clic — utile uniquement en mode multi-select sur un dossier
   * pour permettre de naviguer dedans sans avoir à sortir du mode au préalable.
   */
  function handleDoubleClick(node: FinderNode) {
    if (!multiSelectActive) return;
    if (node.type !== 'folder') return;
    setPath(node.path);
  }

  /**
   * 🔹 LongPress — entre en mode multi-select avec l'item comme amorce.
   */
  function handleLongPress(node: FinderNode) {
    if (multiSelectActive) return;
    enterMultiSelect(node.id);
  }

  /**
   * 🔹 DnD — démarrage du drag depuis un item de la grille.
   */
  function handleDragStart(e: React.DragEvent, node: FinderNode) {
    let items: DragItem[];

    if (multiSelectActive && selection.roots.has(node.id)) {
      const selectedNodes = allNodes.filter((n) => selection.roots.has(n.id));
      items = selectedNodes.map(dragItemFromNode);
    } else {
      items = [dragItemFromNode(node)];
    }

    if (items.length === 0) return;

    e.dataTransfer.setData(FINDER_DRAG_MIME, serializePayload({ items }));
    e.dataTransfer.effectAllowed = 'move';

    const previews: GhostPreview[] = items.map((it) => {
      const fullNode = allNodes.find((n) => n.id === it.id);
      return buildPreview(fullNode ?? null, it);
    });

    startDragGhost({ e, items, previews });
  }

  // Le 1er chargement = on est en train de charger ET on n'a encore rien
  // à montrer. Dans ce cas on affiche un overlay centré sur la grille
  // pour éviter le panneau central vide qui paraît "cassé".
  const showInitialLoadingOverlay = loading && allNodes.length === 0;

  // ─── Menu contextuel de tri ─────────────────────────────────────────────
  //
  // Position du menu : `null` = menu fermé. Ouvert via `onContextMenu`
  // sur le container de la grid view (cf. `<div className="p-4 overflow-auto …"`).
  //
  // Les right-clicks sur les GridItem ne bubblent PAS jusqu'à ce container
  // (les items appellent `e.stopPropagation()` dans leur handler), donc
  // pas de conflit entre les 2 menus.
  const [sortMenuPos, setSortMenuPos] = useState<{ x: number; y: number } | null>(null);

  /**
   * Construit les items du menu de tri. Sections séparées par des `header`/
   * `separator` (cf. ContextMenu.tsx : type discriminant).
   *
   * Pattern utilisé :
   *   - Le tri primaire affiche un ✓ devant la field active
   *   - Click sur une field déjà primary → toggle direction (asc ↔ desc)
   *   - Click sur une autre field → devient primary, garde la direction
   *   - Tri secondaire identique, avec "Aucun" pour le désactiver
   *   - Date et Expéditeur grisés (disabled) car MediaMeta ne porte pas
   *     encore ces champs ; l'infra est prête, l'enrichissement contract
   *     activera ces options sans changer ce code.
   */
  function buildSortMenuItems(): ContextMenuItem[] {
    // Définitions centralisées des fields visibles, dans l'ordre du menu.
    // Tous activés : depuis la Phase 1 metadata, Date et Expéditeur sont
    // exploitables (via useMediaAssetEnrichment qui peuple meta.createdAt
    // et meta.uploadedBy). Pour les fichiers sans MediaAsset DB (orphelins),
    // ils retombent dans les groupes "Date inconnue" / "Expéditeur inconnu".
    const fields: Array<{ field: SortField; label: string; disabled?: boolean }> = [
      { field: 'name', label: 'Nom' },
      { field: 'type', label: 'Type' },
      { field: 'size', label: 'Taille' },
      { field: 'date', label: 'Date' },
      { field: 'sender', label: 'Expéditeur' },
    ];

    const arrow = (dir: 'asc' | 'desc') => (dir === 'asc' ? ' ↑' : ' ↓');

    return [
      { type: 'header', label: 'Tri principal' },
      ...fields.map<ContextMenuItem>((f) => ({
        label: f.label + (sort.primary === f.field ? arrow(sort.primaryDirection) : ''),
        checked: sort.primary === f.field,
        disabled: f.disabled,
        onClick: () => setSortPrimary(f.field),
      })),

      { type: 'separator' },
      { type: 'header', label: 'Tri secondaire' },
      {
        label: 'Aucun',
        checked: sort.secondary === null,
        onClick: () => setSortSecondary(null),
      },
      ...fields.map<ContextMenuItem>((f) => ({
        label: f.label + (sort.secondary === f.field ? arrow(sort.secondaryDirection) : ''),
        checked: sort.secondary === f.field,
        disabled: f.disabled,
        onClick: () => setSortSecondary(f.field),
      })),

      { type: 'separator' },
      { type: 'header', label: 'Ordre' },
      {
        label: `Inverser l'ordre principal`,
        onClick: () => toggleSortDirection('primary'),
      },
      ...(sort.secondary !== null
        ? [
            {
              label: `Inverser l'ordre secondaire`,
              onClick: () => toggleSortDirection('secondary'),
            } as ContextMenuItem,
          ]
        : []),

      { type: 'separator' },
      {
        label: 'Réinitialiser le tri',
        onClick: () => resetSort(),
      },
    ];
  }

  return (
    <div className="flex flex-col h-full border rounded overflow-hidden">

      {/* ──────────────────────── HEADER : breadcrumb + actions ─────────── */}
      <div className="px-3 py-2 border-b text-sm flex items-center gap-2 min-h-[40px]">
        <div className="flex-1 min-w-0">
          <Breadcrumb adapter={adapter} />
        </div>

        {/* Spinner discret, espace réservé pour éviter le shift */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {loading && (
            <Loader2
              className="h-4 w-4 animate-spin text-gray-400"
              aria-label="Chargement"
            />
          )}
        </div>

        {/* ─── Actions multi-select (intégrées dans la toolbar générale) ───
            Au lieu d'une seconde toolbar empilée sous le header, on enrichit
            le header lui-même avec compteur + bouton d'action adaptatif +
            sortie du mode. Visible uniquement quand `multiSelectActive`.

            Le bouton est rouge en bin (action destructive irréversible), neutre
            ailleurs (mise à la corbeille, réversible). Le label vient de
            `useNodeActions.deleteLabel` pour cohérence avec le menu contextuel.

            `handleMultiDelete` reconstitue les nodes ciblés depuis la sélection
            courante (folders + files filtrés sur `selection.roots`). */}
        {multiSelectActive && (() => {
          const selectedCount = selection.roots.size;
          const selectedNodes = [...folders, ...files].filter((n) =>
            selection.roots.has(n.id),
          );
          // On utilise les selectedNodes pour le label : `deleteLabel` détecte
          // le contexte par le path du premier node (cf. useNodeActions.ts),
          // pas par le currentPath global — ça garantit la cohérence
          // label ↔ action même si la sélection est dans un sous-dossier.
          const label = deleteLabel(selectedCount, selectedNodes);
          const isBinAction =
            selectedNodes.length > 0 &&
            (selectedNodes[0].path === `${APP_ROOT}/bin` ||
              selectedNodes[0].path.startsWith(`${APP_ROOT}/bin/`));

          async function handleMultiDelete() {
            await deleteNodes(selectedNodes);
          }

          return (
            <>
              <span className="text-xs text-gray-600 shrink-0">
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>

              <button
                type="button"
                onClick={handleMultiDelete}
                disabled={selectedCount === 0}
                title={label}
                className={
                  isBinAction
                    ? 'shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs'
                    : 'shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs'
                }
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                <span>{label}</span>
              </button>

              <button
                type="button"
                onClick={exitMultiSelect}
                title="Quitter le mode sélection"
                aria-label="Quitter le mode sélection"
                className="
                  shrink-0 rounded p-1 text-gray-500
                  hover:text-gray-900 hover:bg-gray-100
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  transition-colors
                "
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </>
          );
        })()}

        {/* Searchbar — masquée en mode bin (recherche pas pertinente dans la
            corbeille pour la v1 ; pourrait être étendue plus tard si besoin).
            En multi-select mode, on la cache aussi pour laisser de la place
            aux boutons d'action. */}
        {currentPath !== `${APP_ROOT}/bin` && !multiSelectActive && (
          <FinderSearchBar />
        )}

        {/* Switcher des 3 modes d'affichage de la grille — caché en bin root
            où c'est `FinderBinRootView` qui rend son propre switcher (basé
            sur le store trash). */}
        {currentPath !== `${APP_ROOT}/bin` && <FinderViewModeSwitcher />}

        {/* Lien vers la corbeille — vue dédiée hors-finder */}
        <Link
          href="/test-finder/corbeille"
          className="
            shrink-0 rounded p-1 text-gray-500
            hover:text-gray-900 hover:bg-gray-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
            transition-colors
          "
          aria-label="Ouvrir la corbeille"
          title="Corbeille"
        >
          <Trash2 className="h-4 w-4" />
        </Link>

        {/* Toggle du panneau preview */}
        <button
          type="button"
          onClick={togglePreviewPanel}
          className="
            shrink-0 rounded p-1 text-gray-500
            hover:text-gray-900 hover:bg-gray-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
            transition-colors
          "
          aria-label={isPreviewCollapsed ? 'Afficher le panneau de prévisualisation' : 'Masquer le panneau de prévisualisation'}
          title={isPreviewCollapsed ? 'Afficher la prévisualisation' : 'Masquer la prévisualisation'}
        >
          {isPreviewCollapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ──────────────────────── ERROR BANNER (non-décalant) ────────────── */}
      {error && (
        <div
          className="px-3 py-2 text-sm bg-red-50 text-red-700 border-b flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Erreur : {error}</span>
        </div>
      )}

      {/* ──────────────────────── LAYOUT 3-PANEL RESIZABLE ───────────────── */}
      {/*
        On utilise `defaultSize` sur chaque Panel (et non `defaultLayout` sur
        le Group), pour une raison simple : le prop `defaultLayout` v4
        attend un objet indexé par panel-id (`{ [id]: size }`), ce qui
        oblige à donner un id à chaque Panel. Le pattern `defaultSize` par
        Panel est plus court à écrire et donne le même résultat ici.

        Persistance des tailles : non implémentée pour l'instant. Le hook
        `useDefaultLayout` v4 crash en SSR (accès direct à localStorage).
        Pour ajouter la persistance proprement, voir le pattern documenté
        dans le NOTES de la livraison (useGroupRef + useEffect + setLayout).
      */}
      <Group
        groupRef={groupRef}
        orientation="horizontal"
        onLayoutChange={handleLayoutChange}
        className="flex-1 min-h-0"
      >

        {/* 🌳 TREE */}
        {/*
          Dimensions en pixels (pas en %) : la sidebar doit toujours contenir
          les noms des dossiers indépendamment de la largeur d'écran. Sur un
          écran 1280px, 25% donnait 320px — la même valeur, mais en absolu
          c'est plus prévisible (ça ne rétrécit pas sur petit écran).
        */}
        <Panel id="tree" defaultSize="320px" minSize="240px" maxSize="500px" className="overflow-auto p-2">
          <FinderTree
            adapter={adapter}
            rootPath={rootPath}
            currentPath={currentPath}
            onOpen={setPath}
            onItemDragStart={handleDragStart}
            onItemLongPress={handleLongPress}
          />
        </Panel>

        <Separator
          className="
            w-px bg-gray-200
            hover:bg-blue-400 hover:w-[3px]
            transition-all
            focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-[3px]
          "
        />

        {/* 📁 GRILLE */}
        {/*
          Pas de defaultSize/minSize en pixels ici : la grille au centre prend
          tout l'espace restant entre la TreeView et le Preview. On garde un
          minSize en % comme garde-fou.
        */}
        <Panel id="grid" minSize={20} className="flex flex-col min-h-0 relative">

          {/*
            ─── Mode bin root : vue corbeille intégrée ───────────────────────

            Si l'utilisateur est exactement sur `${APP_ROOT}/bin` (le status-
            folder corbeille), on remplace la grille standard par une vue
            spéciale qui affiche la liste plate des trashEntries — comme dans
            la page `/test-finder/corbeille` mais intégrée au finder.

            Effet : naviguer vers `bin` depuis la TreeView donne directement
            accès à la corbeille (sans devoir passer par le bouton header).

            Le double-clic sur une trashEntry-folder déclenche `setPath` vers
            `${APP_ROOT}/bin/.trash/<uuid>` — à ce moment-là, on n'est plus
            en bin root, la condition redevient false, et la grille standard
            reprend la main pour afficher le contenu réel de la trashEntry.
            Toute la profondeur du drill-down est navigable.
          */}
          {currentPath === `${APP_ROOT}/bin` ? (
            <FinderBinRootView />
          ) : searchActive ? (
            /* Mode recherche actif → vue plate des résultats, sans
               groupage par tri ni navigation folder-by-folder. La barre
               searchbar reste visible dans le header pour permettre la
               modification de la query ou son effacement. */
            <SearchResultsView />
          ) : (
            <>
              {/* Overlay loading initial — uniquement quand on a vraiment rien à afficher.
                  Sinon le spinner discret du header suffit, on ne masque pas le contenu. */}
              {showInitialLoadingOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">Chargement…</span>
                  </div>
                </div>
              )}

              <div
                className="p-4 overflow-auto flex-1"
                onContextMenu={(e) => {
                  // Le right-click sur un GridItem stopPropagation, donc on
                  // n'arrive ici que pour la zone vide / les zones inter-items.
                  // C'est exactement la sémantique souhaitée — l'utilisateur
                  // veut le menu de tri quand il clique "ailleurs que sur un item".
                  e.preventDefault();
                  setSortMenuPos({ x: e.clientX, y: e.clientY });
                }}
              >
                {folders.length === 0 && files.length === 0 && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2">
                    <span>Ce dossier est vide</span>
                  </div>
                ) : viewMode === 'grid' ? (
              <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
                {groups.map((group, groupIndex) => {
                  // Détecte les transitions de catégorie parent : si le
                  // groupe actuel a un parentKey différent du précédent
                  // (ou s'il est le premier), on rend un header parent
                  // prominent au-dessus.
                  const prevGroup = groupIndex > 0 ? groups[groupIndex - 1] : null;
                  const showParentHeader =
                    !!group.parentKey &&
                    (!prevGroup || prevGroup.parentKey !== group.parentKey);
                  // Si key === parentKey (cas folder où il n'y a pas de
                  // subdivision par format), on ne rend que le parent header.
                  const showChildHeader =
                    !!group.label && group.key !== group.parentKey;

                  return (
                    <React.Fragment key={group.key}>
                      {/* Header PARENT — séparateur fort, texte plus grand,
                          fond gris discret. Rendu seulement au changement de
                          catégorie pour éviter la duplication. */}
                      {showParentHeader && (
                        <div className="col-span-full mt-4 mb-1 pt-2 pb-2 px-2 border-b-2 border-gray-300 first:mt-0">
                          <span className="text-sm font-bold text-gray-800">
                            {group.parentLabel}
                          </span>
                        </div>
                      )}
                      {/* Header ENFANT (format) — discret, indenté pour
                          signaler la subordination au parent. */}
                      {showChildHeader && (
                        <div className="col-span-full mt-2 mb-1 pb-1 px-1 pl-4 border-b border-gray-200">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {group.label}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">
                            ({group.nodes.length})
                          </span>
                        </div>
                      )}
                      {group.nodes.map((node) => {
                      // Le tri-state n'a de sens que pour les folders (qui
                      // peuvent être en `indeterminate` si une partie de leur
                      // contenu est sélectionnée). Les files sont juste
                      // checked/unchecked d'après leur appartenance aux roots.
                      const isFolder = node.type === 'folder';
                      const triState: TriState = isFolder
                        ? getTriState({
                            item: node,
                            allItems,
                            roots: selection.roots,
                            excluded: selection.excluded,
                          })
                        : selection.roots.has(node.id)
                        ? 'checked'
                        : 'unchecked';

                      return (
                        <GridItem
                          key={node.id}
                          node={node}
                          isSelected={selection.roots.has(node.id)}
                          multiSelectActive={multiSelectActive}
                          triState={triState}
                          onClick={(e) => handleClick(node, e)}
                          onDoubleClick={isFolder ? () => handleDoubleClick(node) : undefined}
                          onLongPress={() => handleLongPress(node)}
                          onDragStart={(e) => handleDragStart(e, node)}
                        />
                      );
                    })}
                  </React.Fragment>
                  );
                })}
              </div>
            ) : viewMode === 'table' ? (
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    {multiSelectActive && <th className="px-2 py-2 text-left w-8"></th>}
                    <th className="px-2 py-2 text-left w-8"></th>
                    <th className="px-3 py-2 text-left">Nom</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-right">Taille</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map((group, groupIndex) => {
                    const prevGroup = groupIndex > 0 ? groups[groupIndex - 1] : null;
                    const showParentHeader =
                      !!group.parentKey &&
                      (!prevGroup || prevGroup.parentKey !== group.parentKey);
                    const showChildHeader =
                      !!group.label && group.key !== group.parentKey;
                    const span = multiSelectActive ? 5 : 4;

                    return (
                      <React.Fragment key={group.key}>
                        {/* Header PARENT — row qui span toutes les colonnes,
                            fond plus marqué + texte plus gras pour visualiser
                            la macro-catégorie. */}
                        {showParentHeader && (
                          <tr className="bg-gray-100">
                            <td
                              colSpan={span}
                              className="px-3 py-2.5 border-t-2 border-gray-300"
                            >
                              <span className="text-sm font-bold text-gray-800">
                                {group.parentLabel}
                              </span>
                            </td>
                          </tr>
                        )}
                        {/* Header ENFANT (format) — discret avec indent. */}
                        {showChildHeader && (
                          <tr className="bg-gray-50">
                            <td
                              colSpan={span}
                              className="px-3 py-1.5 pl-6 border-y border-gray-200"
                            >
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {group.label}
                              </span>
                              <span className="ml-2 text-xs text-gray-400">
                                ({group.nodes.length})
                              </span>
                            </td>
                          </tr>
                        )}
                        {group.nodes.map((node) => {
                        const isFolder = node.type === 'folder';
                        const triState: TriState = isFolder
                          ? getTriState({
                              item: node,
                              allItems,
                              roots: selection.roots,
                              excluded: selection.excluded,
                            })
                          : selection.roots.has(node.id)
                          ? 'checked'
                          : 'unchecked';

                        return (
                          <FinderTableRow
                            key={node.id}
                            node={node}
                            isSelected={selection.roots.has(node.id)}
                            multiSelectActive={multiSelectActive}
                            triState={triState}
                            onClick={(e) => handleClick(node, e)}
                            onDoubleClick={isFolder ? () => handleDoubleClick(node) : undefined}
                            onLongPress={() => handleLongPress(node)}
                            onDragStart={(e) => handleDragStart(e, node)}
                          />
                        );
                      })}
                    </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* compact */
              <div className="divide-y divide-gray-100">
                {groups.map((group, groupIndex) => {
                  const prevGroup = groupIndex > 0 ? groups[groupIndex - 1] : null;
                  const showParentHeader =
                    !!group.parentKey &&
                    (!prevGroup || prevGroup.parentKey !== group.parentKey);
                  const showChildHeader =
                    !!group.label && group.key !== group.parentKey;

                  return (
                    <React.Fragment key={group.key}>
                      {/* Header PARENT — bandeau plus marqué pour la macro-catégorie. */}
                      {showParentHeader && (
                        <div className="px-3 py-2 bg-gray-100 border-t-2 border-gray-300 first:border-t-0">
                          <span className="text-sm font-bold text-gray-800">
                            {group.parentLabel}
                          </span>
                        </div>
                      )}
                      {/* Header ENFANT (format) — bandeau discret avec indent. */}
                      {showChildHeader && (
                        <div className="px-3 pl-6 py-1.5 bg-gray-50">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {group.label}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">
                            ({group.nodes.length})
                          </span>
                        </div>
                      )}
                      {group.nodes.map((node) => {
                      const isFolder = node.type === 'folder';
                      const triState: TriState = isFolder
                        ? getTriState({
                            item: node,
                            allItems,
                            roots: selection.roots,
                            excluded: selection.excluded,
                          })
                        : selection.roots.has(node.id)
                        ? 'checked'
                        : 'unchecked';

                      return (
                        <FinderCompactRow
                          key={node.id}
                          node={node}
                          isSelected={selection.roots.has(node.id)}
                          multiSelectActive={multiSelectActive}
                          triState={triState}
                          onClick={(e) => handleClick(node, e)}
                          onDoubleClick={isFolder ? () => handleDoubleClick(node) : undefined}
                          onLongPress={() => handleLongPress(node)}
                          onDragStart={(e) => handleDragStart(e, node)}
                        />
                      );
                    })}
                  </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
            </>
          )}
        </Panel>

        <Separator
          className="
            w-px bg-gray-200
            hover:bg-blue-400 hover:w-[3px]
            transition-all
            focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-[3px]
          "
        />

        {/* 👁️ PREVIEW */}
        {/*
          Dimensions en pixels également, pour les mêmes raisons que la TreeView :
          la preview a besoin d'une largeur minimale pour afficher proprement
          une image, son nom et ses metadata. 420px par défaut, jusqu'à 600px
          pour bien voir une grosse vignette.

          Note v4 :
            - L'attache du ref se fait via le prop `panelRef={...}` (et non
              `ref={...}` comme en v3). C'est documenté dans le migration guide.
            - `onResize` reçoit un objet `PanelSize` (avec `.pixels` et
              `.percentage`), pas un simple number. On délègue donc à
              `panelRef.isCollapsed()` qui sait répondre directement.
        */}
        <Panel
          id="preview"
          panelRef={previewPanelRef}
          defaultSize="420px"
          minSize="300px"
          maxSize="600px"
          collapsible
          collapsedSize={0}
          onResize={() => {
            setIsPreviewCollapsed(previewPanelRef.current?.isCollapsed() ?? false);
          }}
          className="overflow-auto"
        >
          <PreviewPanel adapter={adapter} />
        </Panel>

      </Group>

      {/* Menu contextuel de tri — porté en root pour ne pas être clipé par
          des `overflow-hidden` ancêtres. Position fixed via les coords
          enregistrées dans sortMenuPos. */}
      {sortMenuPos && (
        <ContextMenu
          x={sortMenuPos.x}
          y={sortMenuPos.y}
          items={buildSortMenuItems()}
          onClose={() => setSortMenuPos(null)}
        />
      )}
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/*                              GHOST PREVIEW BUILDER                         */
/* -------------------------------------------------------------------------- */

/**
 * Construit la `GhostPreview` d'un item à partir de son `FinderNode`.
 */
function buildPreview(node: FinderNode | null, fallback: DragItem): GhostPreview {
  if (!node) {
    const name = fallback.path.split('/').pop() ?? fallback.id;
    return fallback.type === 'folder'
      ? { kind: 'folder', name }
      : { kind: 'document', name };
  }

  if (node.type === 'folder') {
    return { kind: 'folder', name: node.name };
  }

  const kind = node.meta?.kind;
  const url = node.meta?.url;

  if (kind === 'image' && url) {
    return { kind: 'image', name: node.name, url };
  }
  if (kind === 'video') {
    return { kind: 'video', name: node.name };
  }
  return { kind: 'document', name: node.name };
}
