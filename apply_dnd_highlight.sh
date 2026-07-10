#!/bin/bash
# DnD finder — ETAT FINAL COMPLET (englobe fix_dnd_final + surbrillance).
#  - stopPropagation du dragstart (saisir un enfant = saisir l'enfant) ;
#  - drop inter-statuts = pur changement de statut (sous-chemin preserve) ;
#  - SURBRILLANCE : lors d'un changement de statut, seul le dossier-statut
#    s'illumine (le sous-dossier survole ne s'allume pas, dropEffect=none) ;
#  - logique de statut factorisee dans dnd/payload (source unique) ;
#  - trace de diagnostic retiree.
# NOTE : ce script pose l'etat final des 5 fichiers — inutile de relancer
# les scripts DnD anterieurs cote front. Les fixes ADAPTERS backend
# (fix_move_v3 : casts ::int, segment [1]) restent requis a part.
# À lancer depuis la RACINE du monorepo : bash apply_dnd_highlight.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> apps/web/src/features/finder-core/dnd/payload.ts"
cat > 'apps/web/src/features/finder-core/dnd/payload.ts' << 'FILE_EOF'
/**
 * 📦 Schéma du payload de drag-and-drop du finder.
 *
 * Ce module définit le contrat éphémère qui transite via `DataTransfer`
 * pendant un drag : la liste des items déplacés, leur identifiant, leur
 * path logique et leur type (folder|file).
 *
 * 🔑 Pourquoi un MIME custom (`application/x-finder-drag`) plutôt que
 * `application/json` ?
 *
 * Pour distinguer **nos** drags des drags génériques (fichier glissé
 * depuis l'OS, image glissée depuis un autre onglet, etc.). Un drop
 * handler du finder qui voit un payload non-finder peut l'ignorer
 * proprement plutôt que d'essayer de le parser et planter.
 */

import type { FinderNode } from "@contracts/finder";

export const FINDER_DRAG_MIME = "application/x-finder-drag";

/* -------------------------------------------------------------------------- */
/*                                   PAYLOAD                                  */
/* -------------------------------------------------------------------------- */

export type DragItem = {
  id: string;
  path: string;
  type: "folder" | "file";
};

export type DragPayload = {
  items: DragItem[];
};

/**
 * Sérialise un payload pour `dataTransfer.setData`.
 */
export function serializePayload(payload: DragPayload): string {
  return JSON.stringify(payload);
}

/**
 * Tente de désérialiser un payload reçu via `dataTransfer.getData`.
 *
 * Retourne `null` si :
 *   - la chaîne est vide ou indéfinie
 *   - le JSON est invalide
 *   - la structure ne correspond pas au schéma attendu
 *
 * Cette validation défensive nous protège des drops venus d'ailleurs
 * (fichier OS, contenu copié depuis une autre app, etc.) qui pourraient
 * coïncider par hasard avec le même MIME.
 */
export function tryParsePayload(
  raw: string | undefined | null,
): DragPayload | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as { items?: unknown };

    if (!Array.isArray(candidate.items)) return null;

    for (const item of candidate.items) {
      if (!item || typeof item !== "object") return null;
      const i = item as { id?: unknown; path?: unknown; type?: unknown };
      if (typeof i.id !== "string") return null;
      if (typeof i.path !== "string") return null;
      if (i.type !== "folder" && i.type !== "file") return null;
    }

    return candidate as DragPayload;
  } catch {
    return null;
  }
}

/**
 * Construit un `DragItem` à partir d'un `FinderNode`.
 *
 * Helper de confort : on n'a besoin que d'un sous-ensemble des champs
 * du node pour traverser le DnD. Ça garde le payload compact (utile
 * quand on drag plusieurs dizaines d'items).
 */
export function dragItemFromNode(node: FinderNode): DragItem {
  return {
    id: node.id,
    path: node.path,
    type: node.type,
  };
}

/* -------------------------------------------------------------------------- */
/*                              VALIDATION RULES                              */
/* -------------------------------------------------------------------------- */

/**
 * Détermine si déposer `items` dans le dossier `targetPath` est autorisé.
 *
 * Règles communes au ghost (calcul du badge "allowed/forbidden") et au
 * drop handler du `FinderTreeFolder` (court-circuite l'appel API).
 *
 * Les règles sont volontairement minimales et structurelles — pas de
 * logique métier (statuts, permissions, etc.) qui reste l'affaire du
 * backend via `resolveMoveIntent`.
 *
 * Règles :
 *   1. **Pas de drop sur soi-même** : on n'autorise pas de déplacer un
 *      item dans son propre path (no-op qui prêterait à confusion).
 *   2. **Pas de drop dans un descendant** : un dossier ne peut pas être
 *      déplacé dans son propre sous-arbre (cycle invalide).
 *
 * Note : la règle "drop dans le parent direct = no-op" est gérée
 * séparément dans `isDropEffective` ci-dessous : c'est un drop techniquement
 * autorisé, mais qu'on évite pour ne pas faire d'aller-retour réseau inutile.
 */
export function isDropAllowed(targetPath: string, items: DragItem[]): boolean {
  for (const item of items) {
    // Pas de drop sur soi-même
    if (targetPath === item.path) return false;
    // Pas de drop dans un descendant de soi-même
    if (targetPath.startsWith(item.path + "/")) return false;
  }
  return true;
}

/**
 * Détermine si un drop autorisé aurait un effet réel.
 *
 * Si tous les items sont déjà directement dans `targetPath`, le drop ne
 * change rien : on l'évite pour ne pas faire d'aller-retour réseau.
 * À utiliser comme garde côté drop handler **après** `isDropAllowed`.
 */
export function isDropEffective(
  targetPath: string,
  items: DragItem[],
): boolean {
  return items.some((item) => parentPath(item.path) !== targetPath);
}

function parentPath(p: string): string {
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

/* -------------------------------------------------------------------------- */
/*                          DRAG EN COURS (registre)                         */
/* -------------------------------------------------------------------------- */

/**
 * `dataTransfer.getData()` renvoie une chaîne VIDE pendant `dragover`
 * (l'API ne dévoile le payload qu'au `drop`, par sécurité). Or la
 * surbrillance de survol doit connaître la SOURCE pour décider si le
 * survol en cours est un changement de statut. On mémorise donc les
 * paths dragués dans une variable module au `dragstart` — éphémère,
 * hors state React (aucun re-render), nettoyée au `dragend`.
 */
let draggingPaths: string[] = [];

export function setDraggingPaths(paths: string[]): void {
  draggingPaths = paths;
}
export function clearDraggingPaths(): void {
  draggingPaths = [];
}
export function getDraggingPaths(): string[] {
  return draggingPaths;
}

/**
 * Le statut applicatif d'un path = 2e segment (`<appRoot>/<statut>/…`).
 * Renvoie `undefined` hors de la convention.
 */
export function statusSegment(
  path: string,
  appRoot: string,
): string | undefined {
  if (!path.startsWith(`${appRoot}/`)) return undefined;
  return path.slice(appRoot.length + 1).split("/")[0] || undefined;
}

/**
 * Un drop de `items` sur `targetPath` est-il un CHANGEMENT DE STATUT ?
 * Vrai si la cible est sous `pending`/`published` et qu'au moins un item
 * vient d'un statut différent. Source unique de vérité, partagée par le
 * drop handler (routage `status-folder`) ET la surbrillance de survol.
 */
export function isStatusChangeDrop(
  targetPath: string,
  itemPaths: string[],
  appRoot: string,
): boolean {
  const targetStatus = statusSegment(targetPath, appRoot);
  if (targetStatus !== "pending" && targetStatus !== "published") return false;
  return itemPaths.some((p) => statusSegment(p, appRoot) !== targetStatus);
}
FILE_EOF

echo "-> apps/web/src/features/finder-core/components/Finder.tsx"
cat > 'apps/web/src/features/finder-core/components/Finder.tsx' << 'FILE_EOF'
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
import FinderTree from "@features/finder-core/components/FinderTree";
import GridItem from "@features/finder-core/components/GridItem";
import ContextMenu, {
  type ContextMenuItem,
} from "@features/finder-core/components/ContextMenu";

import { useNodeActions } from "@features/finder-core/hooks/useNodeActions";
import { useMediaAssetEnrichment } from "@features/finder-core/hooks/useMediaAssetEnrichment";
import { useFinderSearch } from "@features/finder-core/hooks/useFinderSearch";

import FinderSearchBar from "@features/finder-core/components/FinderSearchBar";
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

  const { deleteNodes, deleteLabel } = useNodeActions();

  // Filtre optionnel : on ne retire QUE des fichiers (les dossiers restent
  // pour la navigation). Absent ⇒ aucun retrait. cf. prop `fileFilter`.
  const visibleFiles = useMemo(
    () => (fileFilter ? files.filter(fileFilter) : files),
    [files, fileFilter],
  );

  const sortedAllItems = useMemo(
    () => sortNodes([...folders, ...visibleFiles], sort),
    [folders, visibleFiles, sort],
  );

  const groups = useMemo(
    () => groupNodes(sortedAllItems, sort.primary),
    [sortedAllItems, sort.primary],
  );

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
      <div className="px-3 py-2 border-b text-sm flex items-center gap-2 min-h-10]">
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
                    adapter={adapter}
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
          !fileFilter && <FinderSearchBar />}

        {currentPath !== `${APP_ROOT}/bin` && <FinderViewModeSwitcher />}

        {(() => {
          const inBin =
            currentPath === `${APP_ROOT}/bin` ||
            currentPath.startsWith(`${APP_ROOT}/bin/`);
          return (
            <button
              type="button"
              onClick={() => setPath(inBin ? rootPath : `${APP_ROOT}/bin`)}
              aria-label={
                inBin ? "Quitter la corbeille" : "Ouvrir la corbeille"
              }
              aria-pressed={inBin}
              title="Corbeille"
              className={
                inBin
                  ? "shrink-0 rounded p-1 text-red-600 bg-red-50 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                  : "shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          );
        })()}

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
      <Group
        groupRef={groupRef}
        orientation="horizontal"
        onLayoutChange={handleLayoutChange}
        className="flex-1 min-h-0"
      >
        {/* 🌳 TREE */}
        <Panel
          id="tree"
          defaultSize="320px"
          minSize="240px"
          maxSize="500px"
          className="overflow-auto p-2"
        >
          <FinderTree
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
                        const span = multiSelectActive ? 5 : 4;

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
      </Group>

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
FILE_EOF

echo "-> apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
cat > 'apps/web/src/features/finder-core/components/FinderTreeFolder.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

import type { FinderNode } from "@contracts/finder";
import type { FileAdapter } from "@contracts/finder";

import { APP_ROOT } from "@config/app";
import { trpc } from "@trpc/trpcClient";

import { useFinderStore } from "@features/finder-core/state/useFinderStore";
import { useLongPress } from "@features/finder-core/hooks/useLongPress";
import { useNodeActions } from "@features/finder-core/hooks/useNodeActions";
import { useTrashMap } from "@features/finder-core/state/TrashMapContext";
import { isStatusFolder } from "@features/finder-core/utils/statusFolders";
import ContextMenu, {
  type ContextMenuItem,
} from "@features/finder-core/components/ContextMenu";
import {
  FINDER_DRAG_MIME,
  tryParsePayload,
  isDropAllowed,
  isDropEffective,
  isStatusChangeDrop,
  statusSegment,
  getDraggingPaths,
} from "@features/finder-core/dnd/payload";
import FinderTreeFile from "@features/finder-core/components/FinderTreeFile";

/**
 * FinderTreeFolder
 *
 * Composant récursif d'un dossier dans la TreeView. (Doc de chargement /
 * corbeille / barre verticale inchangée — cf. historique.)
 *
 * ─── Mode picker (panier) ─────────────────────────────────────────────────
 *
 * Le dossier lui-même ne s'épingle pas (seuls les fichiers vont au panier) :
 * en pickMode il navigue/déplie comme d'habitude. Mais il PROPAGE les props
 * pick (`pickMode`/`isInCart`/`onPickToggle`) à ses enfants — sous-dossiers
 * (récursion) et `FinderTreeFile` — pour que les fichiers de l'arbre soient
 * pickables, branchés sur le même store que la grille.
 */

type Props = {
  node: FinderNode;
  adapter: FileAdapter;
  currentPath: string;
  onOpen: (path: string) => void;
  openPaths: Set<string>;
  onToggleOpen: (path: string) => void;
  onDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  onLongPress?: (node: FinderNode) => void;
  /** Mode picker actif — propagé aux enfants (fichiers pickables). */
  pickMode?: boolean;
  /** En pickMode : ce path est-il dans le panier ? Propagé aux fichiers. */
  isInCart?: (path: string) => boolean;
  /** En pickMode : épingle/retire un fichier. Propagé aux fichiers. */
  onPickToggle?: (node: FinderNode) => void;
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
  pickMode = false,
  isInCart,
  onPickToggle,
}: Props) {
  const isOpen = openPaths.has(node.path);
  const isActive = node.path === currentPath;

  const isStatus = isStatusFolder(node.path);

  const longPress = useLongPress(() => {
    if (isStatus) return;
    if (onLongPress) onLongPress(node);
  });

  const isDraggable = Boolean(onDragStart) && !isStatus;

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

  const trashToBinMutation = trpc.trash.trashToBin.useMutation();

  const trashMap = useTrashMap();

  const inTrashStorage =
    node.path.includes("/.trash/") || node.path.endsWith("/.trash");
  const isTrashRootSkipNode = node.name === ".trash";

  const isTrashWrapperNode = Boolean(node.path.match(/\/bin\/\.trash\/[^/]+$/));

  const trashEntryForName = trashMap.get(node.name);

  const [loadedChildren, setLoadedChildren] = useState<FinderNode[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const [isDragOver, setIsDragOver] = useState(false);

  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);
  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const selectedIds = useFinderStore((s) => s.selection.roots);

  const effectiveChildren: FinderNode[] | undefined =
    node.children !== undefined ? node.children : (loadedChildren ?? undefined);

  const hasChildren = node.hasChildren ?? (effectiveChildren?.length ?? 0) > 0;

  const isMaterializing =
    isOpen &&
    hasChildren &&
    node.children === undefined &&
    loadedChildren === null &&
    !isTrashRootSkipNode &&
    !isTrashWrapperNode;

  function handleToggleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleOpen(node.path);
  }

  /**
   * Clic sur le LIBELLÉ du dossier.
   *
   * En pickMode comme en mode normal, un dossier NAVIGUE (on ne met pas de
   * dossier au panier). En multi-select, il toggle sa sélection (sauf status).
   */
  function handleRowClick() {
    if (longPress.consumeJustFired()) return;
    if (multiSelectActive && !pickMode) {
      if (isStatus) return;
      toggleSelect(node.id);
      return;
    }
    onOpen(node.path);
  }

  function isFinderDrag(e: React.DragEvent): boolean {
    return e.dataTransfer.types.includes(FINDER_DRAG_MIME);
  }

  // Surbrillance de survol : n'allume ce nœud que s'il RECEVRA réellement
  // le drop. Un changement de statut ne cible QUE le dossier-statut — un
  // sous-dossier survolé pendant un tel drag ne doit donc pas s'allumer
  // (sinon l'utilisateur croit droper là, alors que seul le statut change).
  function acceptsHighlight(): boolean {
    if (isStatusChangeDrop(node.path, getDraggingPaths(), APP_ROOT)) {
      // Drag inter-statuts : seul le dossier-statut lui-même s'illumine.
      return isStatus;
    }
    return true;
  }

  function handleDragEnter(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    if (acceptsHighlight()) setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFinderDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    const ok = acceptsHighlight();
    e.dataTransfer.dropEffect = ok ? "move" : "none";
    if (ok && !isDragOver) setIsDragOver(true);
    else if (!ok && isDragOver) setIsDragOver(false);
  }

  function handleDragLeave(e: React.DragEvent) {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setIsDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData(FINDER_DRAG_MIME);
    const payload = tryParsePayload(raw);
    if (!payload) return;

    const items = payload.items;
    const targetPath = node.path;

    if (!isDropAllowed(targetPath, items)) return;
    if (!isDropEffective(targetPath, items)) return;

    const BIN_ROOT_PATH = `${APP_ROOT}/bin`;

    if (targetPath === BIN_ROOT_PATH) {
      try {
        await trashToBinMutation.mutateAsync({
          appRoot: APP_ROOT,
          sources: items.map((it) => ({
            kind:
              it.type === "folder" ? ("folder" as const) : ("file" as const),
            fullPath: it.path,
          })),
        });
        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        console.error("[FinderTreeFolder] trashToBin failed", err);
      }
      return;
    }

    if (!adapter.moveItems) {
      console.warn(
        "[FinderTreeFolder] adapter.moveItems unavailable, drop ignoré",
      );
      return;
    }

    // Changement de statut vs déplacement : logique partagée avec la
    // surbrillance (isStatusChangeDrop, dnd/payload). Un drop inter-statuts
    // substitue le seul segment de statut et préserve le sous-chemin ; la
    // position fine est ignorée (décision 2026-07-03).
    const itemPaths = items.map((it) => it.path);
    const targetStatus = statusSegment(targetPath, APP_ROOT);
    const isStatusChange = isStatusChangeDrop(targetPath, itemPaths, APP_ROOT);

    try {
      await adapter.moveItems({
        items,
        target: isStatusChange
          ? {
              type: "status-folder",
              status: targetStatus as "pending" | "published",
            }
          : { type: "folder", path: targetPath },
      });
      reloadFolderContent();
      exitMultiSelect();
    } catch (err) {
      console.error("[FinderTreeFolder] drop failed", err);
    }
  }

  const showChevron = hasChildren;

  // ─── Skip visuel du `.trash` ET des wrappers uuid ────────────────────────
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

  let displayLabel = node.name;
  if (inTrashStorage && trashEntryForName) {
    displayLabel = trashEntryForName.displayName;
  } else if (
    inTrashStorage &&
    !trashEntryForName &&
    node.path.match(/\/bin\/\.trash\/[^/]+$/)
  ) {
    displayLabel = "Élément supprimé";
  }

  return (
    <div
      className="select-none"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        draggable={isDraggable}
        onDragStart={
          onDragStart
            ? (e) => {
                // DnD imbriqué : sans stopPropagation, saisir un enfant
                // fait remonter l'événement au premier ancêtre draggable
                // (la ligne du dossier parent) → mauvaise source résolue
                // (bug « cours/cours », 2026-07-03).
                e.stopPropagation();
                longPress.onDragStart();
                onDragStart(e, node);
              }
            : undefined
        }
        onMouseDown={longPress.onMouseDown}
        onMouseUp={longPress.onMouseUp}
        onMouseLeave={longPress.onMouseLeave}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
        data-finder-drop-path={node.path}
        className={clsx(
          "flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm",
          isActive &&
            !isDragOver &&
            "bg-accent text-accent-foreground font-medium",
          !isActive && !isDragOver && "hover:bg-accent/40",
          isDragOver && "bg-blue-100 ring-1 ring-blue-300",
        )}
        title={node.path}
      >
        {showChevron ? (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={isOpen ? "Replier" : "Déplier"}
          >
            {isLoading || isMaterializing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="inline-block h-4 w-4" />
        )}

        {/* Checkbox multi-select — masquée en pickMode (le dossier ne pick pas,
            et en pickMode la multi-select n'est pas la cible du clic). */}
        {multiSelectActive && !pickMode && !isStatus && (
          <input
            type="checkbox"
            checked={selectedIds.has(node.id)}
            readOnly
            className="shrink-0"
          />
        )}

        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <span className="truncate capitalize">{displayLabel}</span>
      </div>

      {loadError && isOpen && (
        <div className="ml-3 pl-3 border-l border-border">
          <div className="px-2 py-1 text-xs text-destructive">{loadError}</div>
        </div>
      )}

      {isOpen && isMaterializing && (
        <div className="ml-3 pl-3 border-l border-border">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Chargement…</span>
          </div>
        </div>
      )}

      {isOpen && effectiveChildren && effectiveChildren.length > 0 && (
        <div className="ml-3 pl-3 border-l border-border">
          {effectiveChildren.map((child) =>
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
FILE_EOF

echo "-> apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
cat > 'apps/web/src/features/finder-core/components/FinderTreeFile.tsx' << 'FILE_EOF'
'use client';

import { JSX, useState } from 'react';
import { File, Check } from 'lucide-react';
import clsx from 'clsx';

import type { FinderNode } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import { parentPath } from '@features/finder-core/utils/path';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';

/**
 * 📄 Item fichier dans la TreeView.
 *
 * Symétrique à `FinderTreeFolder` mais pour les fichiers : pas de chevron
 * d'expansion (un fichier n'a pas d'enfants), pas de drop-target (un
 * fichier ne peut pas recevoir d'autres items), juste une icône fichier
 * Lucide, le nom cliquable et — depuis ce sous-chantier — drag-source
 * et long-press pour parité avec la GridView.
 *
 * ─── Mode picker (panier) ─────────────────────────────────────────────────
 *
 * En `pickMode`, un clic sur le fichier l'épingle/retire du panier
 * (`onPickToggle`) au lieu de naviguer/sélectionner. L'appartenance au panier
 * est signalée par une coche verte, TOUJOURS visible (tactile-friendly).
 * C'est la SECONDE surface de pick, branchée sur le MÊME store que la grille
 * (`usePickerCartStore` via MediaPicker) — la synchro grille↔arbre est donc
 * automatique : cocher ici met à jour le store, la grille se re-render, et
 * inversement.
 *
 * ─── Drag + long-press (parité GridView) ─────────────────────────────────
 *
 * Les handlers `onDragStart` et `onLongPress` viennent du parent `Finder`
 * (via `FinderTree`) et sont strictement les mêmes que ceux passés à
 * `GridItem`.
 *
 * 🎯 Comportement au clic (mode normal, inchangé)
 *
 * Naviguer dans le dossier parent du fichier ET sélectionner le fichier.
 *
 * ⚠️ Ordre des opérations
 *
 * `setPath` reset la sélection ET désactive `multiSelectActive`. Donc on
 * appelle d'abord `setPath(parent)`, puis `selectOnly(file.id)`.
 */
type Props = {
  node: FinderNode;
  /**
   * Callback déclenché au début d'un drag depuis ce fichier. Optionnel —
   * si non fourni, le fichier n'est pas draggable.
   */
  onDragStart?: (e: React.DragEvent, node: FinderNode) => void;
  /**
   * Callback déclenché au long-press (>= 500ms) sur ce fichier. Optionnel.
   */
  onLongPress?: (node: FinderNode) => void;
  /**
   * Mode picker actif : le clic épingle/retire le fichier du panier au lieu
   * de naviguer. Optionnel — absent ⇒ comportement bibliothèque inchangé.
   */
  pickMode?: boolean;
  /** En pickMode : ce path est-il dans le panier ? Pilote la coche. */
  isInCart?: (path: string) => boolean;
  /** En pickMode : épingle/retire le fichier (délégué au store panier). */
  onPickToggle?: (node: FinderNode) => void;
};

export default function FinderTreeFile({
  node,
  onDragStart,
  onLongPress,
  pickMode = false,
  isInCart,
  onPickToggle,
}: Props): JSX.Element {
  const setPath = useFinderStore((s) => s.setPath);
  const selectOnly = useFinderStore((s) => s.selectOnly);
  const toggleSelect = useFinderStore((s) => s.toggleSelect);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const currentPath = useFinderStore((s) => s.currentPath);
  const selectedIds = useFinderStore((s) => s.selection.roots);

  const longPress = useLongPress(() => {
    if (onLongPress) onLongPress(node);
  });

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

  const isActive =
    currentPath === parentPath(node.path) && selectedIds.has(node.id);

  const isDraggable = Boolean(onDragStart);

  // En pickMode, ce fichier est-il dans le panier ? (coche verte)
  const pinned = pickMode && Boolean(isInCart?.(node.path));

  /**
   * Comportement du clic sur un fichier de la TreeView.
   *
   * ─── Mode picker (panier) ────────────────────────────────────────────
   * Le clic épingle/retire le fichier du panier. On court-circuite la
   * navigation/sélection : le panier est la seule cible du clic.
   *
   * ─── Mode normal ─────────────────────────────────────────────────────
   * Naviguer dans le dossier parent + sélection unique.
   *
   * ─── Mode multi-select ───────────────────────────────────────────────
   * On NE NAVIGUE PAS et on ne reset PAS la sélection — on toggle juste
   * l'appartenance du node à la sélection.
   */
  function handleClick() {
    // Avalage du click parasite qui suit un longpress.
    if (longPress.consumeJustFired()) return;

    // Mode picker : le clic alimente le panier, rien d'autre.
    if (pickMode) {
      onPickToggle?.(node);
      return;
    }

    if (multiSelectActive) {
      toggleSelect(node.id);
      return;
    }
    setPath(parentPath(node.path));
    selectOnly(node.id);
  }

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

  return (
    <>
      <div
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
        onMouseDown={longPress.onMouseDown}
        onMouseUp={longPress.onMouseUp}
        onMouseLeave={longPress.onMouseLeave}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
        draggable={isDraggable}
        onDragStart={
          onDragStart
            ? (e) => {
                // DnD imbriqué : sans stopPropagation, saisir un enfant
                // fait remonter l'événement au premier ancêtre draggable
                // (la ligne du dossier parent) → mauvaise source résolue
                // (bug « cours/cours », 2026-07-03).
                e.stopPropagation();
                longPress.onDragStart();
                onDragStart(e, node);
              }
            : undefined
        }
        className={clsx(
          'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm',
          // Indentation : alignée sur les sous-dossiers. En multi-select OU
          // en pickMode, l'espace gauche est occupé par la checkbox / coche.
          !multiSelectActive && !pickMode && 'pl-[1.625rem]',
          pinned && 'bg-emerald-50',
          isActive && !pinned && 'bg-accent text-accent-foreground font-medium',
          !isActive && !pinned && 'hover:bg-accent/40',
        )}
        title={node.path}
      >
        {/* ─── Coche panier (pickMode) ─────────────────────────────────────
            Toujours présente en pickMode (pour aligner l'indentation) ;
            remplie en vert si le fichier est dans le panier. Tactile-friendly :
            visible en permanence, pas au hover. */}
        {pickMode && (
          <span
            className={clsx(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              pinned ? 'bg-emerald-500 text-white' : 'border border-gray-300',
            )}
            aria-hidden
          >
            {pinned && <Check className="h-3 w-3" />}
          </span>
        )}

        {/* Checkbox multi-select (masquée en pickMode) */}
        {multiSelectActive && !pickMode && (
          <input
            type="checkbox"
            checked={selectedIds.has(node.id)}
            readOnly
            className="shrink-0"
          />
        )}

        <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />
        <span className="truncate">{node.name}</span>
      </div>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={buildMenuItems()}
          onClose={() => setMenuPos(null)}
        />
      )}
    </>
  );
}
FILE_EOF

echo "-> packages/backend/src/modules/storage/resolveMoveIntent.service.ts"
cat > 'packages/backend/src/modules/storage/resolveMoveIntent.service.ts' << 'FILE_EOF'
import type {
  StorageAdapter,
  StorageMoveIntent,
  StorageMoveOperation,
  StorageMoveSource,
  StorageMoveTarget,
} from "@contracts/storage";

/**
 * resolveMoveIntent.service.ts
 *
 * Couche 2 du pipeline de move : résout une intention riche en N opérations
 * atomiques, et les exécute via l'adapter de stockage.
 *
 *   Couche 3 — INTENTION              StorageMoveIntent (entrée de ce service)
 *   Couche 2 — RÉSOLUTION             ce service
 *   Couche 1 — OPÉRATION              StorageMoveOperation (sortie)
 *
 * ─── Ce que ce service fait, et ce qu'il ne fait pas ──────────────────────
 *
 * Il fait :
 *   - expanse une `selection` (roots + excluded) en N items concrets en
 *     interrogeant l'adapter (`list` ou `getTree`)
 *   - traduit une cible `status-folder` (lifecycle status applicatif) en
 *     path concret en respectant la convention `${appRoot}/${status}/...`
 *   - produit N `StorageMoveOperation` atomiques
 *   - les exécute séquentiellement via `adapter.move()`
 *
 * Il ne fait pas :
 *   - aucun appel direct à un provider (Cloudinary, R2, etc.). Tout passe
 *     par l'interface `StorageAdapter` reçue en paramètre.
 *   - aucune validation Zod (l'input est supposé déjà validé en amont,
 *     typiquement par `storageMoveIntentSchema` au niveau du router).
 *   - aucune logique de DB (l'adapter ou le service métier qui l'appelle
 *     se charge de propager les changements en DB si nécessaire).
 *
 * ─── Note importante sur la convention de path ────────────────────────────
 *
 * La traduction d'un `status-folder` en path concret repose sur la
 * convention `${appRoot}/${status}/...`. Cette convention est applicative
 * (imposée par le projet à tous ses stockages) et est documentée dans le
 * contrat `move.intent.ts`. Si demain le projet change cette convention,
 * c'est ici qu'il faudra la refléter.
 *
 * Le suffixe préservé d'un asset déplacé par `status-folder` correspond à
 * tout ce qui suit le `<status>` actuel dans son path. Exemple :
 *   source : `AKFC/pending/cours/12/photo.jpg`
 *   target : `{ type: 'status-folder', status: 'published' }`
 *   → path concret : `AKFC/published/cours/12/photo.jpg`
 */

export type ResolveMoveIntentParams = {
  adapter: StorageAdapter;
  appRoot: string;
  intent: StorageMoveIntent;
};

/**
 * Résout et exécute une intention de move.
 *
 * Renvoie le tableau des opérations atomiques effectivement exécutées —
 * utile pour les caller qui veulent logger, auditer, ou rejouer.
 *
 * Wrapper rétrocompatible équivalent à `planMoveOperations` suivi de
 * `executeMoveOperations`. Si tu as besoin d'insérer une garde ou un
 * audit entre les deux phases (ex: le router `storage.move` qui refuse
 * de sortir un asset référencé de published — sous-chantier 7), utilise
 * les deux fonctions séparément plutôt que ce wrapper.
 */
export async function resolveMoveIntent(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const operations = await planMoveOperations(params);
  await executeMoveOperations(params.adapter, operations);
  return operations;
}

/**
 * Phase 1 du pipeline : résout l'intention en N opérations atomiques,
 * **sans rien exécuter**. Ne fait que lire (via l'adapter) et calculer.
 *
 * Permet d'insérer des gardes sur les opérations planifiées avant
 * exécution. Utilisé par le router `storage.move` pour faire passer
 * les opérations à `assertOperationsDontUnpublishReferencedAssets`
 * avant l'appel à `executeMoveOperations`.
 */
export async function planMoveOperations(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const { adapter, appRoot, intent } = params;

  if (!adapter.move) {
    throw new Error(
      "Adapter does not support move(). " +
        "Cannot resolve a StorageMoveIntent on a read-only adapter."
    );
  }

  // 1) Résoudre la SOURCE en items concrets (file ou folder).
  const items = await resolveSource(intent.source, adapter);

  // 2) Pour chaque item, traduire la TARGET en path concret et produire
  //    une opération atomique.
  return items.map((item) => ({
    source: item,
    target: { path: resolveTargetPath(item, intent.target, appRoot) },
  }));
}

/**
 * Phase 2 du pipeline : exécute des opérations atomiques pré-planifiées
 * via l'adapter.
 *
 * Séquentiel et non parallèle : certains backends (Cloudinary
 * notamment) n'aiment pas les opérations concurrentes sur des prefixes
 * voisins.
 */
export async function executeMoveOperations(
  adapter: StorageAdapter,
  operations: readonly StorageMoveOperation[]
): Promise<void> {
  if (!adapter.move) {
    throw new Error(
      "Adapter does not support move(). " +
        "Cannot execute move operations on a read-only adapter."
    );
  }
  for (const operation of operations) {
    await adapter.move(operation);
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la source                                                   */
/* -------------------------------------------------------------------------- */

type ResolvedItem = StorageMoveOperation["source"];

/**
 * Expanse la source d'une intention en une liste d'items concrets.
 *
 * - `file` ou `folder` : un seul item, retourné tel quel.
 * - `selection`        : on liste sous chaque root et on filtre les excluded.
 *                        On préserve les types (file/folder) découverts pour
 *                        que `adapter.move()` puisse traiter chaque cas.
 */
async function resolveSource(
  source: StorageMoveSource,
  adapter: StorageAdapter
): Promise<ResolvedItem[]> {
  if (source.type === "file" || source.type === "folder") {
    return [{ type: source.type, path: source.path }];
  }

  // source.type === 'selection'
  const excluded = new Set(source.excluded ?? []);

  // Exclusion par préfixe : un asset `cours/12/draft/x.jpg` est exclu si
  // `cours/12/draft` est dans excluded. C'est la même règle que celle
  // appliquée par moveService Cloudinary actuellement.
  const isExcluded = (path: string): boolean => {
    if (excluded.has(path)) return true;
    for (const ex of excluded) {
      if (path.startsWith(`${ex}/`)) return true;
    }
    return false;
  };

  const out: ResolvedItem[] = [];
  const seen = new Set<string>();

  for (const rootPath of source.roots) {
    if (isExcluded(rootPath)) continue;

    // 1) Le root est-il un fichier ?
    //    Stratégie : tenter getNode pour discriminer file/folder.
    //    Si l'adapter n'a pas getNode, on assume folder et on liste.
    const rootNode = adapter.getNode
      ? await adapter.getNode(rootPath)
      : null;

    if (rootNode?.type === "file") {
      if (!seen.has(rootPath)) {
        out.push({ type: "file", path: rootPath });
        seen.add(rootPath);
      }
      continue;
    }

    // 2) Sinon, c'est un dossier : on liste son contenu récursif via getTree
    //    pour récupérer tous les descendants.
    if (!adapter.getTree) {
      throw new Error(
        "Adapter does not support getTree(). " +
          "Cannot resolve a 'selection' source without recursive listing."
      );
    }

    const subtree = await adapter.getTree({ path: rootPath, depth: Infinity });

    // Parcourir le sous-arbre en profondeur, ramasser tous les files non exclus.
    walkTree(subtree.root, (node) => {
      if (node.type === "file" && !isExcluded(node.path) && !seen.has(node.path)) {
        out.push({ type: "file", path: node.path });
        seen.add(node.path);
      }
    });
  }

  return out;
}

/**
 * Visite récursive d'un arbre de StorageNode.
 */
function walkTree(
  node: import("@contracts/storage").StorageNode,
  visit: (node: import("@contracts/storage").StorageNode) => void
): void {
  visit(node);
  if (node.type === "folder" && node.children) {
    for (const child of node.children) {
      walkTree(child, visit);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la target                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Calcule le path concret d'arrivée pour un item donné.
 *
 * Pour une target de type `folder`, le path concret est `<targetFolder>/<sourceTail>`
 * où `sourceTail` est le dernier segment du path source (le nom du fichier
 * ou du dossier).
 *
 * Pour une target de type `status-folder`, on remplace le segment de statut
 * dans le path source. Convention : le statut est le SECOND segment du path
 * (juste après l'appRoot). Exemple : `AKFC/pending/cours/12/photo.jpg`
 *   → segment[0] = `AKFC` (appRoot)
 *   → segment[1] = `pending` (statut courant)
 *   → segments[2..] = `cours/12/photo.jpg` (suffixe à préserver)
 */
function resolveTargetPath(
  item: ResolvedItem,
  target: StorageMoveTarget,
  appRoot: string
): string {
  if (target.type === "folder") {
    const tail = lastSegment(item.path);
    return `${target.path}/${tail}`;
  }

  // target.type === 'status-folder'
  // On remplace le segment de statut dans le path source.
  const parts = item.path.split("/").filter(Boolean);

  // Invariant 1 : le path doit commencer par appRoot.
  // Toute source bien gérée par le système est sous appRoot.
  if (parts[0] !== appRoot) {
    throw new Error(
      `Cannot resolve status-folder target: source path does not start with appRoot. ` +
        `path="${item.path}" appRoot="${appRoot}"`
    );
  }

  // Invariant 2 : le segment de statut (parts[1]) doit être un statut connu.
  // Cet invariant traduit la règle applicative : un asset géré par le système
  // ne peut vivre que sous un status-folder ('pending' | 'published' | 'bin').
  // Si parts[1] est inconnu, c'est qu'on tente un move sur un asset qui
  // n'a pas été produit par le pipeline d'upload du système — bug en amont
  // qui mérite d'échouer fort plutôt que d'être bricolé silencieusement.
  const currentStatus = parts[1];
  if (
    currentStatus !== "pending" &&
    currentStatus !== "published" &&
    currentStatus !== "bin"
  ) {
    throw new Error(
      `Cannot resolve status-folder target: source path is not under a known ` +
        `lifecycle status segment. Expected segment[1] in {'pending', 'published', 'bin'}, ` +
        `got "${currentStatus ?? "<missing>"}". path="${item.path}"`
    );
  }

  // [appRoot, <oldStatus>, ...rest] → [appRoot, newStatus, ...rest]
  parts[1] = target.status;
  return parts.join("/");
}

function lastSegment(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}
FILE_EOF

echo
pnpm --filter web typecheck