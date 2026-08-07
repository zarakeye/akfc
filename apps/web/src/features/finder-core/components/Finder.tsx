"use client";

import React, { JSX, useCallback, useEffect, useMemo, useState } from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  useGroupRef,
  type Layout,
} from "react-resizable-panels";
import {
  Loader2,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
  X,
} from "lucide-react";
import type { FileAdapter, FinderNode } from "@contracts/finder";
import { APP_ROOT } from "@config/app";

import FinderBinRootView from "@features/finder-core/components/FinderBinRootView";
import FinderViewModeSwitcher from "@features/finder-core/components/FinderViewModeSwitcher";
import FinderTableRow from "@features/finder-core/components/FinderTableRow";
import FinderCompactRow from "@features/finder-core/components/FinderCompactRow";

import { useFinderData } from "@features/finder-core/hooks/useFinderData";
import { useFinderStore } from "@features/finder-core/state/useFinderStore";

import Breadcrumb from "@features/finder-core/components/Breadcrumb";
import PreviewPanel from "@features/finder-core/components/PreviewPanel";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import FinderTree from "@features/finder-core/components/FinderTree";
import GridItem from "@features/finder-core/components/GridItem";
import StatusFilterBar from "@features/finder-core/components/StatusFilterBar";
// Le dialogue de `trash-view`, celui dont `EmptyBinButton` se sert déjà.
// En écrire un second serait la troisième façon de poser une question
// dans ce projet.
import ConfirmDialog from "@features/trash-view/components/ConfirmDialog";
import { statusOf } from "@features/finder-core/utils/statusFolders";
import ContextMenu, {
  type ContextMenuItem,
} from "@features/finder-core/components/ContextMenu";

import { useNodeActions } from "@features/finder-core/hooks/useNodeActions";
import { useMediaAssetEnrichment } from "@features/finder-core/hooks/useMediaAssetEnrichment";
import { useFinderSearch } from "@features/finder-core/hooks/useFinderSearch";

import FinderSearchControl from "@features/finder-core/components/FinderSearchControl";
import SearchResultsView from "@features/finder-core/components/SearchResultsView";

import { sortNodes, groupNodes } from "@features/finder-core/utils/sortNodes";
import type { SortField } from "@features/finder-core/state/useFinderStore";

import {
  getTriState,
  type TriState,
} from "@features/finder-core/utils/triState";

import {
  startDragGhost,
  type GhostPreview,
} from "@features/finder-core/dnd/dragGhost";
import {
  FINDER_DRAG_MIME,
  serializePayload,
  setDraggingPaths,
  clearDraggingPaths,
  dragItemFromNode,
  type DragItem,
} from "@features/finder-core/dnd/payload";
import StatusRadioGroup from "@features/finder-core/components/StatusRadioGroup";
import {
  buildNodePool,
  resolveSelectedNodes,
} from "@features/finder-core/utils/selectionNodes";

/**
 * Clé localStorage utilisée pour persister la disposition (largeur) des 3
 * panneaux du finder. Centralisée ici pour qu'on puisse facilement clear
 * via devtools : `localStorage.removeItem('akfc:finder:layout')`.
 */
const LAYOUT_STORAGE_KEY = "akfc:finder:layout";

/**
 * Replie le panneau d'aperçu au montage.
 *
 * Le panneau prend de la place et n'est utile que sur demande : son
 * déploiement est un geste délibéré, à chaque ouverture du finder comme du
 * picker. La garde sur `isCollapsed()` évite un `collapse()` inutile quand un
 * layout restauré le donnait déjà replié.
 */
function collapsePreviewOnMount(panel: {
  isCollapsed: () => boolean;
  collapse: () => void;
} | null): void {
  if (!panel) return;
  if (panel.isCollapsed()) return;
  panel.collapse();
}

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
  fileFilter?: (node: FinderNode) => boolean;
  /**
   * Mode picker (panier). Quand actif, un clic sur un FICHIER appelle
   * `onPickToggle(node)` au lieu de la sélection/preview habituelle ; la
   * navigation des dossiers reste au simple clic. Optionnel : absent ⇒ le
   * Finder se comporte comme dans la bibliothèque (inchangé).
   */
  pickMode?: boolean;
  /** En pickMode : ce path est-il dans le panier ? Pilote l'overlay épinglé. */
  isInCart?: (path: string) => boolean;
  /** En pickMode : épingle/retire un média (délégué au store panier). */
  onPickToggle?: (node: FinderNode) => void;
};

/* -------------------------------------------------------------------------- */
/*                                FINDER (root)                               */
/* -------------------------------------------------------------------------- */

export default function Finder({
  adapter,
  rootPath,
  fileFilter,
  pickMode = false,
  isInCart,
  onPickToggle,
}: Props): JSX.Element {
  const {
    folders,
    files,
    contentCache,
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

  useMediaAssetEnrichment();
  useFinderSearch();

  const searchActive = useFinderStore((s) => s.search.query.trim().length > 0);
  const searchResults = useFinderStore((s) => s.search.results);

  const { deleteNodes, deleteLabel, inBin } = useNodeActions();

  // Le bouton « Supprimer » n'agit plus au premier clic.
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const statusFilter = useFinderStore((s) => s.statusFilter);

  // Filtre optionnel : on ne retire QUE des fichiers (les dossiers restent
  // pour la navigation). Absent ⇒ aucun retrait. cf. prop `fileFilter`.
  //
  // Le filtre de STATUT s'applique par-dessus, et seulement ici. Il n'est
  // jamais transmis à `FinderTree` — contrairement à `fileFilter`, qui pilote
  // `pruneTreeFiles` et vit dans les deps du useEffect de construction de
  // l'arbre. L'arbre reste donc stable quand on change de lentille : sinon on
  // ne saurait plus si un dossier a disparu parce qu'il est filtré ou parce
  // qu'il n'existe plus.
  //
  // Les dossiers ne sont jamais retirés non plus : un dossier n'a pas de
  // statut (il contient des contenus des deux), et le vider de ses fichiers
  // filtrés ne le rend pas moins navigable.
  const visibleFiles = useMemo(() => {
    const kept = fileFilter ? files.filter(fileFilter) : files;
    if (statusFilter === 'all') return kept;
    return kept.filter((file) => statusOf(file) === statusFilter);
  }, [files, fileFilter, statusFilter]);

  const sortedAllItems = useMemo(
    () => sortNodes([...folders, ...visibleFiles], sort),
    [folders, visibleFiles, sort],
  );

  const groups = useMemo(
    () => groupNodes(sortedAllItems, sort.primary),
    [sortedAllItems, sort.primary],
  );

  const previewPanelRef = usePanelRef();

  /**
   * Trois volets réclament 920px — arbre 240, zone centrale ~380, aperçu
   * 300 — auxquels s'ajoute la sidebar du panneau de contrôle (240). Sous
   * 1280, ils se disputent une place qu'ils n'ont pas.
   *
   * Ici c'est bien la LARGEUR qui décide, et non le périphérique de pointage
   * comme pour les gestes : trois colonnes ne tiennent pas dans 900px, qu'on
   * les touche ou qu'on les clique.
   */
  const isWide = useIsBreakpoint("min", 1280);

  // En étroit, l'aperçu quitte la colonne pour une feuille venant du bas.
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  // Le panneau démarre replié (cf. l'effet de montage plus bas) : l'icône et
  // le libellé du bouton doivent partir dans cet état, sans quoi le premier
  // rendu annoncerait « Masquer » sur un panneau déjà masqué.
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(true);

  function togglePreviewPanel() {
    // Même bouton, même intention : replier le volet en large, ouvrir la
    // feuille en étroit.
    if (!isWide) {
      setPreviewSheetOpen((v) => !v);
      return;
    }
    const panel = previewPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }

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

    // ─── L'aperçu démarre replié ────────────────────────────────────────
    //
    // APRÈS `setLayout`, jamais avant : le layout restauré rouvrirait le
    // panneau qu'on vient de replier.
    //
    // Le layout reste restauré parce qu'il porte aussi la largeur du
    // panneau de l'arbre, réglée par l'utilisateur. Seul l'aperçu est
    // forcé — sa largeur, elle, survit dans le layout et sera restituée
    // au premier déploiement.
    //
    // `collapse()` déclenche `onResize`, qui aligne `isPreviewCollapsed` :
    // pas de synchronisation à faire ici.
    collapsePreviewOnMount(previewPanelRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Échap quitte le mode sélection ──────────────────────────────────
  //
  // Deux garde-fous, expliqués en tête de ce chantier :
  //   - un champ éditable a la priorité (renommage en ligne, recherche) ;
  //   - une surface empilée aussi. `ContextMenu` et `PreviewModal` écoutent
  //     Échap sur `window`, et l'ordre de déclenchement suit l'ordre de
  //     montage : le finder passerait AVANT eux. On interroge donc le DOM,
  //     qui ne dépend d'aucun ordre.
  useEffect(() => {
    if (!multiSelectActive) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;

      const target = e.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (document.querySelector("[data-finder-overlay]")) return;

      exitMultiSelect();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [multiSelectActive, exitMultiSelect]);

  // Clic dans le vide : `target === currentTarget` signifie que le clic n'a
  // traversé aucun enfant. Pas de `stopPropagation` à semer dans les tuiles,
  // et aucun risque de casser une sélection en cours.
  const handleVoidClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!multiSelectActive) return;
      if (e.target !== e.currentTarget) return;
      exitMultiSelect();
    },
    [multiSelectActive, exitMultiSelect],
  );

  const handleLayoutChange = useCallback((layout: Layout) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // Mode privé / quota dépassé — on laisse passer.
    }
  }, []);

  // Pool global : la sélection peut contenir des items cochés depuis l'arbre
  // ou la recherche, hors du dossier grid courant. cf. selectionNodes.ts.
  const nodePool = useMemo(
    () => buildNodePool({ folders, files, contentCache, searchResults }),
    [folders, files, contentCache, searchResults],
  );

  const selectedNodes = useMemo(
    () => resolveSelectedNodes(selection.roots, nodePool),
    [selection.roots, nodePool],
  );

  const selectedCount = selectedNodes.length;

  const allNodes: FinderNode[] = useMemo(
    () => Array.from(nodePool.values()),
    [nodePool],
  );

  /**
   * 🔹 Flat list pour calcul tri-state + range
   */
  const allItems = useMemo(
    () => [
      ...folders.map((f) => ({ id: f.id, path: f.path })),
      ...files.map((f) => ({ id: f.id, path: f.path })),
    ],
    [folders, files],
  );

  /**
   * 🔹 Gestion du clic — comportement dépendant du mode.
   *
   * **Mode picker (panier)** :
   *   - folder → navigation (setPath), comme en mode normal
   *   - file   → toggle panier (onPickToggle) — la sélection/preview est
   *              court-circuitée ; le panier est la seule cible du clic.
   *   Le long-press reste disponible pour entrer en multi-select et changer
   *   le statut depuis le picker.
   *
   * **Mode multi-select** :
   *   - shift+click → range selection
   *   - simple-clic → toggle de l'item
   *
   * **Mode normal** :
   *   - folder → navigation (setPath)
   *   - file   → sélection pour le PreviewPanel (selectOnly)
   */
  function handleClick(node: FinderNode, e: React.MouseEvent) {
    // Mode picker : le clic sur un fichier alimente le panier ; les dossiers
    // naviguent normalement. On teste le pick AVANT la multi-select pour que
    // le picker reste cohérent même si l'utilisateur a basculé en multi-select
    // (le long-press, lui, gère le statut).
    if (pickMode && node.type === "file") {
      onPickToggle?.(node);
      return;
    }

    if (multiSelectActive) {
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
    if (node.type === "folder") {
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
    if (node.type !== "folder") return;
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
    e.dataTransfer.effectAllowed = "move";
    // Registre lisible pendant dragover (getData y est vide).
    setDraggingPaths(items.map((it) => it.path));

    const previews: GhostPreview[] = items.map((it) => {
      const fullNode = allNodes.find((n) => n.id === it.id);
      return buildPreview(fullNode ?? null, it);
    });

    startDragGhost({ e, items, previews });
  }

  const showInitialLoadingOverlay = loading && allNodes.length === 0;

  const [sortMenuPos, setSortMenuPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  function buildSortMenuItems(): ContextMenuItem[] {
    const fields: Array<{
      field: SortField;
      label: string;
      disabled?: boolean;
    }> = [
      { field: "name", label: "Nom" },
      { field: "type", label: "Type" },
      { field: "size", label: "Taille" },
      { field: "date", label: "Date" },
      { field: "sender", label: "Expéditeur" },
    ];

    const arrow = (dir: "asc" | "desc") => (dir === "asc" ? " ↑" : " ↓");

    return [
      { type: "header", label: "Tri principal" },
      ...fields.map<ContextMenuItem>((f) => ({
        label:
          f.label +
          (sort.primary === f.field ? arrow(sort.primaryDirection) : ""),
        checked: sort.primary === f.field,
        disabled: f.disabled,
        onClick: () => setSortPrimary(f.field),
      })),

      { type: "separator" },
      { type: "header", label: "Tri secondaire" },
      {
        label: "Aucun",
        checked: sort.secondary === null,
        onClick: () => setSortSecondary(null),
      },
      ...fields.map<ContextMenuItem>((f) => ({
        label:
          f.label +
          (sort.secondary === f.field ? arrow(sort.secondaryDirection) : ""),
        checked: sort.secondary === f.field,
        disabled: f.disabled,
        onClick: () => setSortSecondary(f.field),
      })),

      { type: "separator" },
      { type: "header", label: "Ordre" },
      {
        label: `Inverser l'ordre principal`,
        onClick: () => toggleSortDirection("primary"),
      },
      ...(sort.secondary !== null
        ? [
            {
              label: `Inverser l'ordre secondaire`,
              onClick: () => toggleSortDirection("secondary"),
            } as ContextMenuItem,
          ]
        : []),

      { type: "separator" },
      {
        label: "Réinitialiser le tri",
        onClick: () => resetSort(),
      },
    ];
  }

  return (
    <div className="flex flex-col h-full border rounded overflow-hidden">
      {/* ──────────────────────── HEADER : breadcrumb + actions ─────────── */}
      <div className="px-3 py-2 border-b text-sm flex flex-wrap items-center gap-2 min-h-10">
        <div className="flex-1 min-w-0">
          <Breadcrumb adapter={adapter} />
        </div>

        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {loading && (
            <Loader2
              className="h-4 w-4 animate-spin text-gray-400"
              aria-label="Chargement"
            />
          )}
        </div>

        {multiSelectActive &&
          (() => {
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
                  {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
                </span>

                {!isBinAction && (
                  <StatusRadioGroup
                    selectedNodes={selectedNodes}
                  />
                )}

                <button
                  type="button"
                  onClick={handleMultiDelete}
                  disabled={selectedCount === 0}
                  title={label}
                  className={
                    isBinAction
                      ? "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      : "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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

        {currentPath !== `${APP_ROOT}/bin` &&
          !multiSelectActive &&
          !fileFilter && <FinderSearchControl />}

        {/* La corbeille garde son propre système : ses items n'ont pas de
            statut de publication, la lentille n'y a rien à filtrer. */}
        {/* Masquée aussi quand le dossier courant n'a aucun fichier enfant
            direct : le filtre ne trie que des fichiers, il n'a rien à faire
            sur un dossier qui ne contient que des sous-dossiers. Condition sur
            `files` BRUT (pas `visibleFiles`) — sinon filtrer « En attente »
            sans aucun fichier en attente masquerait la barre et bloquerait le
            retour à « Tous ». */}
        {currentPath !== `${APP_ROOT}/bin` &&
          !multiSelectActive &&
          !fileFilter &&
          files.length > 0 && <StatusFilterBar />}

        {currentPath !== `${APP_ROOT}/bin` && <FinderViewModeSwitcher />}

        {(() => {
          // Ce bouton naviguait vers la corbeille. Elle est déjà atteignable
          // par l'arbre (`AKFC/bin` y est un dossier, le pliage le préserve)
          // et par le fil d'Ariane : il occupait la place d'une action utile
          // pour dupliquer un chemin qui existait déjà.
          //
          // `deleteNodes` connaît déjà le dispatch — mise en corbeille depuis
          // la bibliothèque, suppression définitive depuis la corbeille — et
          // porte les invalidations de cache. `deleteLabel` en donne le
          // libellé exact, y compris le pluriel.
          const canDelete = selectedCount > 0;
          const deleteButtonLabel = canDelete
            ? deleteLabel(selectedCount, selectedNodes)
            : "Supprimer";

          return (
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => setDeleteConfirmOpen(true)}
              aria-label={deleteButtonLabel}
              title={
                canDelete
                  ? deleteButtonLabel
                  : "Sélectionne un contenu ou un dossier"
              }
              className={
                canDelete
                  ? "shrink-0 rounded p-1 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                  : "shrink-0 rounded p-1 text-gray-300 cursor-not-allowed transition-colors"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          );
        })()}

        {/* ─── La question dépend du geste ───────────────────────────────
            `deleteNodes` est adaptatif : mise en corbeille depuis la
            bibliothèque, suppression définitive depuis la corbeille. Poser
            la même question dans les deux cas serait pire que rien — ça
            entraînerait à confirmer sans lire, et l'habitude serait déjà
            prise le jour où le geste est irréversible. */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          title={inBin ? "Supprimer définitivement" : "Envoyer à la corbeille"}
          description={
            inBin
              ? `${selectedCount} élément${selectedCount > 1 ? "s" : ""} ${
                  selectedCount > 1 ? "seront supprimés" : "sera supprimé"
                } définitivement. Cette opération est irréversible.`
              : `${selectedCount} élément${selectedCount > 1 ? "s" : ""} ${
                  selectedCount > 1 ? "seront envoyés" : "sera envoyé"
                } à la corbeille. Tu pourras ${
                  selectedCount > 1 ? "les" : "le"
                } restaurer ensuite.`
          }
          confirmLabel={
            inBin ? "Supprimer définitivement" : "Envoyer à la corbeille"
          }
          destructive={inBin}
          onConfirm={() => {
            setDeleteConfirmOpen(false);
            void deleteNodes(selectedNodes);
          }}
          onCancel={() => setDeleteConfirmOpen(false)}
        />

        <button
          type="button"
          onClick={togglePreviewPanel}
          className="
            shrink-0 rounded p-1 text-gray-500
            hover:text-gray-900 hover:bg-gray-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
            transition-colors
          "
          aria-label={
            isPreviewCollapsed
              ? "Afficher le panneau de prévisualisation"
              : "Masquer le panneau de prévisualisation"
          }
          title={
            isPreviewCollapsed
              ? "Afficher la prévisualisation"
              : "Masquer la prévisualisation"
          }
        >
          {(isWide ? isPreviewCollapsed : !previewSheetOpen) ? (
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
      <Group
        groupRef={groupRef}
        orientation="horizontal"
        onLayoutChange={handleLayoutChange}
        className="flex-1 min-h-0"
      >
        {/* 🌳 TREE — masqué sous 1280.
            On navigue alors par le contenu et le fil d'Ariane, tous deux
            tactiles. Aucune application de fichiers mobile n'affiche
            d'arbre : ni Fichiers, ni Drive, ni OneDrive. */}
        {isWide && (
        <>
        <Panel
          id="tree"
          defaultSize="320px"
          minSize="240px"
          maxSize="500px"
          className="overflow-auto p-2"
        >
          <FinderTree
            onVoidClick={handleVoidClick}
            adapter={adapter}
            rootPath={rootPath}
            currentPath={currentPath}
            fileFilter={fileFilter}
            onOpen={setPath}
            onItemDragStart={handleDragStart}
            onItemLongPress={handleLongPress}
            pickMode={pickMode}
            isInCart={isInCart}
            onPickToggle={onPickToggle}
          />
        </Panel>

        <Separator
          className="
            w-px bg-gray-200
            hover:bg-blue-400 hover:w-0.75
            transition-all
            focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-0.75
          "
        />
        </>
        )}

        {/* 📁 GRILLE */}
        <Panel
          id="grid"
          minSize={20}
          className="flex flex-col min-h-0 relative"
        >
          {currentPath === `${APP_ROOT}/bin` ? (
            <FinderBinRootView />
          ) : searchActive ? (
            <SearchResultsView />
          ) : (
            <>
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
                onClick={handleVoidClick}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSortMenuPos({ x: e.clientX, y: e.clientY });
                }}
              >
                {folders.length === 0 && files.length === 0 && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2">
                    <span>Ce dossier est vide</span>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
                    {groups.map((group, groupIndex) => {
                      const prevGroup =
                        groupIndex > 0 ? groups[groupIndex - 1] : null;
                      const showParentHeader =
                        !!group.parentKey &&
                        (!prevGroup || prevGroup.parentKey !== group.parentKey);
                      const showChildHeader =
                        !!group.label && group.key !== group.parentKey;

                      return (
                        <React.Fragment key={group.key}>
                          {showParentHeader && (
                            <div className="col-span-full mt-4 mb-1 pt-2 pb-2 px-2 border-b-2 border-gray-300 first:mt-0">
                              <span className="text-sm font-bold text-gray-800">
                                {group.parentLabel}
                              </span>
                            </div>
                          )}
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
                            const isFolder = node.type === "folder";
                            const triState: TriState = isFolder
                              ? getTriState({
                                  item: node,
                                  allItems,
                                  roots: selection.roots,
                                  excluded: selection.excluded,
                                })
                              : selection.roots.has(node.id)
                                ? "checked"
                                : "unchecked";

                            return (
                              <GridItem
                                key={node.id}
                                node={node}
                                isSelected={selection.roots.has(node.id)}
                                multiSelectActive={multiSelectActive}
                                triState={triState}
                                onClick={(e) => handleClick(node, e)}
                                onDoubleClick={
                                  isFolder
                                    ? () => handleDoubleClick(node)
                                    : undefined
                                }
                                onLongPress={() => handleLongPress(node)}
                                onDragStart={(e) => handleDragStart(e, node)}
                                pickMode={pickMode}
                                isInCart={
                                  isInCart ? isInCart(node.path) : false
                                }
                              />
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : viewMode === "table" ? (
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
                      <tr>
                        {multiSelectActive && (
                          <th className="px-2 py-2 text-left w-8"></th>
                        )}
                        <th className="px-2 py-2 text-left w-8"></th>
                        <th className="px-3 py-2 text-left">Nom</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Statut</th>
                        <th className="px-3 py-2 text-right">Taille</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {groups.map((group, groupIndex) => {
                        const prevGroup =
                          groupIndex > 0 ? groups[groupIndex - 1] : null;
                        const showParentHeader =
                          !!group.parentKey &&
                          (!prevGroup ||
                            prevGroup.parentKey !== group.parentKey);
                        const showChildHeader =
                          !!group.label && group.key !== group.parentKey;
                        const span = multiSelectActive ? 6 : 5;

                        return (
                          <React.Fragment key={group.key}>
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
                              const isFolder = node.type === "folder";
                              const triState: TriState = isFolder
                                ? getTriState({
                                    item: node,
                                    allItems,
                                    roots: selection.roots,
                                    excluded: selection.excluded,
                                  })
                                : selection.roots.has(node.id)
                                  ? "checked"
                                  : "unchecked";

                              return (
                                <FinderTableRow
                                  key={node.id}
                                  node={node}
                                  isSelected={selection.roots.has(node.id)}
                                  multiSelectActive={multiSelectActive}
                                  triState={triState}
                                  onClick={(e) => handleClick(node, e)}
                                  onDoubleClick={
                                    isFolder
                                      ? () => handleDoubleClick(node)
                                      : undefined
                                  }
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
                      const prevGroup =
                        groupIndex > 0 ? groups[groupIndex - 1] : null;
                      const showParentHeader =
                        !!group.parentKey &&
                        (!prevGroup || prevGroup.parentKey !== group.parentKey);
                      const showChildHeader =
                        !!group.label && group.key !== group.parentKey;

                      return (
                        <React.Fragment key={group.key}>
                          {showParentHeader && (
                            <div className="px-3 py-2 bg-gray-100 border-t-2 border-gray-300 first:border-t-0">
                              <span className="text-sm font-bold text-gray-800">
                                {group.parentLabel}
                              </span>
                            </div>
                          )}
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
                            const isFolder = node.type === "folder";
                            const triState: TriState = isFolder
                              ? getTriState({
                                  item: node,
                                  allItems,
                                  roots: selection.roots,
                                  excluded: selection.excluded,
                                })
                              : selection.roots.has(node.id)
                                ? "checked"
                                : "unchecked";

                            return (
                              <FinderCompactRow
                                key={node.id}
                                node={node}
                                isSelected={selection.roots.has(node.id)}
                                multiSelectActive={multiSelectActive}
                                triState={triState}
                                onClick={(e) => handleClick(node, e)}
                                onDoubleClick={
                                  isFolder
                                    ? () => handleDoubleClick(node)
                                    : undefined
                                }
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

        {isWide && (
        <>
        <Separator
          className="
            w-px bg-gray-200
            hover:bg-blue-400 hover:w-0.75
            transition-all
            focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-0.75
          "
        />

        {/* 👁️ PREVIEW */}
        <Panel
          id="preview"
          panelRef={previewPanelRef}
          defaultSize="420px"
          minSize="300px"
          maxSize="600px"
          collapsible
          collapsedSize={0}
          onResize={() => {
            setIsPreviewCollapsed(
              previewPanelRef.current?.isCollapsed() ?? false,
            );
          }}
          className="overflow-auto"
        >
          <PreviewPanel adapter={adapter} />
        </Panel>
        </>
        )}
      </Group>

      {/* 👁️ APERÇU EN FEUILLE — sous 1280 uniquement.
          `PreviewPanel` est réutilisé tel quel : un second composant
          d'aperçu aurait divergé du premier à la première correction.

          La feuille s'ouvre au BOUTON et non à la sélection d'un fichier :
          réagir à un changement de sélection demanderait un effet, donc la
          cascade de rendus que React signale. L'ouverture au geste touche
          les trois vues — grille, table, compacte — et fera un incrément à
          part. */}
      {!isWide && previewSheetOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreviewSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-semibold">Aperçu</span>
              <button
                type="button"
                onClick={() => setPreviewSheetOpen(false)}
                aria-label="Fermer l'aperçu"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <PreviewPanel adapter={adapter} />
            </div>
          </div>
        </div>
      )}

      {/* Menu contextuel de tri */}
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

function buildPreview(
  node: FinderNode | null,
  fallback: DragItem,
): GhostPreview {
  if (!node) {
    const name = fallback.path.split("/").pop() ?? fallback.id;
    return fallback.type === "folder"
      ? { kind: "folder", name }
      : { kind: "document", name };
  }

  if (node.type === "folder") {
    return { kind: "folder", name: node.name };
  }

  const kind = node.meta?.kind;
  const url = node.meta?.url;

  if (kind === "image" && url) {
    return { kind: "image", name: node.name, url };
  }
  if (kind === "video") {
    return { kind: "video", name: node.name };
  }
  return { kind: "document", name: node.name };
}
