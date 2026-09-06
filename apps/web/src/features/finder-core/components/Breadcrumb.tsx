'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

import type { FileAdapter } from '@contracts/finder';

import { APP_ROOT } from '@config/app';
import { trpc } from '@trpc/trpcClient';

import { buildPathSegments } from '@features/finder-core/utils/path';
import { isPersoSpaceFolder } from '@features/finder-core/utils/spaceFolderKind';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import {
  FINDER_DRAG_MIME,
  tryParsePayload,
  isDropAllowed,
  isDropEffective,
} from '@features/finder-core/dnd/payload';

type Props = {
  /**
   * Adapter actif (Cloudinary par défaut côté library). Nécessaire pour
   * le drop : un drop sur un segment du breadcrumb déclenche un move
   * agnostique via `adapter.moveItems` (sauf si la cible est le bin —
   * cf. dispatch dans `handleDrop`).
   */
  adapter: FileAdapter;
  /**
   * Racine du finder. APP_ROOT côté admin ; racine VIRTUELLE côté membre —
   * le fil s'y adapte (voir plus bas).
   */
  rootPath: string;
};

/**
 * Breadcrumb du finder — chemin cliquable des dossiers parents.
 *
 * ─── Comportements ──────────────────────────────────────────────────────
 *
 *   - Click sur un segment cliquable → navigation vers ce path
 *   - Le dernier segment est rendu en "current" (non-cliquable, gras)
 *     pour signaler la position actuelle dans la hiérarchie
 *
 * ─── Drop-target (depuis ce sous-chantier) ──────────────────────────────
 *
 *   - **Tous les segments** reçoivent le drop d'items en provenance de la
 *     TreeView ou de la GridView — feuille incluse. La feuille (= currentPath)
 *     est un drop-target légitime : quand l'utilisateur drag un item depuis
 *     un AUTRE dossier dans la TreeView et veut le déposer dans le dossier
 *     courant qu'il visualise déjà, le drop sur la feuille est l'endroit
 *     naturel.
 *   - Le risque "no-op" (drag d'un item DÉJÀ dans le folder cible) est
 *     géré par `isDropEffective` qui avale silencieusement.
 *   - Dispatch des actions :
 *       * Cible = `${APP_ROOT}/bin` → `trash.trashToBin`
 *       * Sinon → `adapter.moveItems`
 *     Strictement parallèle au comportement de `FinderTreeFolder.handleDrop`.
 *   - Surbrillance bleue sur le segment survolé pendant le drag.
 *
 * ─── Repli des chemins profonds ─────────────────────────────────────────
 *
 * Au-delà de `MAX_VISIBLE_SEGMENTS`, le fil devient
 * `Racine / … / Parent / Courant` : les niveaux intermédiaires passent dans
 * un menu ouvert par le « … ». Les segments repliés cessent d'être des
 * cibles de dépôt, d'où un seuil assez haut pour que les chemins courants
 * n'y passent jamais.
 */
/**
 * Nombre de segments affichés avant repli.
 *
 * Au-delà, le fil devient `Racine / … / Parent / Courant` et les niveaux
 * intermédiaires passent dans un menu.
 *
 * Quatre et non deux : les segments repliés cessent d'être des cibles de
 * dépôt (on ne lâche pas un fichier sur un « … »). Les chemins courants
 * gardent donc toutes leurs cibles, et seuls les chemins vraiment profonds —
 * où le fil débordait de toute façon — perdent celles du milieu. L'arbre
 * reste disponible pour eux.
 */
const MAX_VISIBLE_SEGMENTS = 4;

export default function Breadcrumb({ adapter, rootPath }: Props): JSX.Element {
  const currentPath = useFinderStore((s) => s.currentPath);
  const setPath = useFinderStore((s) => s.setPath);
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  // Mutation tRPC pour les drops vers le bin (cf. FinderTreeFolder).
  const trashToBinMutation = trpc.trash.trashToBin.useMutation();

  // Index du segment actuellement survolé en drag — pour le highlight.
  // -1 si rien.
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

  // Menu des segments repliés.
  const [showHidden, setShowHidden] = useState(false);
  const hiddenMenuRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!showHidden) return;
    function onPointerDown(e: MouseEvent) {
      if (!hiddenMenuRef.current?.contains(e.target as Node)) {
        setShowHidden(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showHidden]);

  // Noms conviviaux des espaces (cuid → nom du groupe). myCollaborativeSpaces
  // renvoie les espaces de l'utilisateur courant (les siens en membre, tous
  // via la passerelle en admin).
  const { data: mySpaces } = trpc.storage.myCollaborativeSpaces.useQuery();
  const nameByPath = new Map(
    (mySpaces ?? []).map((sp) => [sp.path, sp.name] as const),
  );

  // Libellés d'affichage des dossiers (FolderLabel[path]) — MÊME source que
  // la grille et la tree (résolus côté back par applyGroupSpaceNames). Sans
  // ça, le fil montrait le slug brut alors que la grille montre le libellé.
  const { data: folderLabels } = trpc.storage.folderLabels.useQuery();
  const labelByPath = new Map(
    (folderLabels ?? []).map((l) => [l.path, l.displayName] as const),
  );

  const rawSegments = buildPathSegments(currentPath);
  // Racine relative au finder. Membre = racine virtuelle (≠ APP_ROOT) : on
  // n'affiche pas akfc/groups (hors de sa portée), mais « Mes espaces » puis
  // le fil À PARTIR de l'espace courant.
  const isMemberRoot = rootPath !== APP_ROOT;
  let segments = rawSegments;
  if (isMemberRoot) {
    const virtualRoot = { name: 'Mes espaces', path: rootPath };
    if (currentPath === rootPath) {
      segments = [virtualRoot];
    } else {
      const spaceIdx = rawSegments.findIndex((sg) => nameByPath.has(sg.path));
      const kept = spaceIdx >= 0 ? rawSegments.slice(spaceIdx) : rawSegments;
      segments = [virtualRoot, ...kept];
    }
  }
  // Perso : masquer le segment du sous-espace `<slug>-<userId>` — l'admin
  // ne voit que « Espace personnel » puis son contenu (illusion d'espace
  // unique). La navigation reste sur le chemin physique réel.
  segments = segments.filter((sg) => !isPersoSpaceFolder(sg.path));
  segments = segments.map((sg) => ({
    ...sg,
    // Priorité alignée sur le back (applyGroupSpaceNames) :
    // FolderLabel[path] > nom d'espace (groupe/perso) > slug brut.
    name: labelByPath.get(sg.path) ?? nameByPath.get(sg.path) ?? sg.name,
  }));

  // Repli : on garde la RACINE et les deux derniers segments. Les
  // intermédiaires passent dans le menu du « … ».
  //
  // Ce découpage vaut à toutes les tailles d'écran, à dessein : un seuil
  // imposerait deux rendus du même fil, donc deux copies de la logique de
  // glisser-déposer qui occupe l'essentiel de ce fichier. Le jour où l'une
  // évolue sans l'autre, le dépôt marche sur desktop et pas en tablette.
  const collapsed = segments.length > MAX_VISIBLE_SEGMENTS;
  const hiddenSegments = collapsed ? segments.slice(1, segments.length - 2) : [];
  const visibleSegments = collapsed
    ? [segments[0], ...segments.slice(segments.length - 2)]
    : segments;

  /**
   * Filtre les events DnD : seuls ceux qui portent notre MIME passent.
   * Évite de capter les drags d'images depuis le bureau, les fichiers OS,
   * etc. Strictement identique à la fonction locale de `FinderTreeFolder`
   * (la définition n'est pas exportée de `payload.ts`, on duplique).
   */
  function isFinderDrag(e: React.DragEvent): boolean {
    return e.dataTransfer.types.includes(FINDER_DRAG_MIME);
  }

  /**
   * Construit les handlers DnD pour un segment précis. On ferme sur
   * `targetPath` et `index` plutôt que de tout poser dans la JSX —
   * facilité de lecture et pas de closures parasites.
   */
  function makeDropHandlers(index: number, targetPath: string) {
    function handleDragEnter(e: React.DragEvent) {
      if (!isFinderDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(index);
    }

    function handleDragOver(e: React.DragEvent) {
      if (!isFinderDrag(e)) return;
      // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverIndex !== index) setDragOverIndex(index);
    }

    function handleDragLeave(e: React.DragEvent) {
      // dragleave émis à chaque traversée d'un enfant : on l'ignore
      // tant qu'on est encore dans le sous-arbre de currentTarget.
      const related = e.relatedTarget as Node | null;
      if (related && e.currentTarget.contains(related)) return;
      setDragOverIndex((current) => (current === index ? -1 : current));
    }

    async function handleDrop(e: React.DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(-1);

      const raw = e.dataTransfer.getData(FINDER_DRAG_MIME);
      const payload = tryParsePayload(raw);
      if (!payload) return;

      const items = payload.items;

      // Garde-fous standards du DnD (cf. payload.ts).
      if (!isDropAllowed(targetPath, items)) return;
      if (!isDropEffective(targetPath, items)) return;

      // ─── Cas spécial : drop sur la racine du bin ─────────────────────
      // Strictement parallèle à FinderTreeFolder.handleDrop.
      const BIN_ROOT_PATH = `${APP_ROOT}/bin`;
      if (targetPath === BIN_ROOT_PATH) {
        try {
          await trashToBinMutation.mutateAsync({
            appRoot: APP_ROOT,
            sources: items.map((it) => ({
              kind: it.type === 'folder' ? ('folder' as const) : ('file' as const),
              // Le LOCALISATEUR, pas le chemin logique : `trash.trashToBin`
              // met en quarantaine un binaire, pas une vue. Un dossier n'en
              // porte pas (il vit dans 1..N strates) — c'est le backend qui
              // résout, cf. `resolvePhysicalLocations`.
              fullPath: it.storagePath ?? it.path,
            })),
            logical: true,
          });
          reloadFolderContent();
          exitMultiSelect();
        } catch (err) {
          console.error('[Breadcrumb] trashToBin failed', err);
        }
        return;
      }

      // ─── Cas normal : move agnostique via l'adapter ──────────────────
      if (!adapter.moveItems) {
        console.warn('[Breadcrumb] adapter.moveItems unavailable, drop ignoré');
        return;
      }

      try {
        await adapter.moveItems({
          items,
          target: { type: 'folder', path: targetPath },
        });
        reloadFolderContent();
        exitMultiSelect();
      } catch (err) {
        console.error('[Breadcrumb] drop failed', err);
      }
    }

    return { handleDragEnter, handleDragOver, handleDragLeave, handleDrop };
  }

  return (
    <nav
      className="flex items-center gap-1 text-sm flex-wrap"
      aria-label="Fil d'Ariane"
    >
      {visibleSegments.map((segment, visibleIndex) => {
        const isLast = visibleIndex === visibleSegments.length - 1;
        // Index dans la liste COMPLÈTE : c'est lui qui identifie la cible de
        // dépôt survolée. Un index de la liste réduite ferait surligner le
        // mauvais segment dès que le fil est replié.
        const index = segments.indexOf(segment);
        // Tous les segments — y compris la feuille — sont drop-targets.
        //
        // Pourquoi la feuille aussi : la feuille est le `currentPath`, c-à-d
        // le dossier que la GridView affiche. Quand l'utilisateur drag un
        // item depuis la TreeView (un autre folder de l'arbo), drop sur la
        // feuille du breadcrumb est l'endroit naturel pour dire "mets-le
        // dans le dossier que je vois actuellement".
        //
        // Risque "no-op" (drag d'un item déjà dans currentPath puis drop
        // sur la feuille) : déjà géré par `isDropEffective` dans handleDrop.
        // L'event est avalé silencieusement, pas de mutation backend.
        const isCurrentDragOver = dragOverIndex === index;
        const handlers = makeDropHandlers(index, segment.path);

        return (
          <span key={segment.path} className="flex items-center gap-1">
            {isLast ? (
              <span
                onDragEnter={handlers.handleDragEnter}
                onDragOver={handlers.handleDragOver}
                onDragLeave={handlers.handleDragLeave}
                onDrop={handlers.handleDrop}
                // Attribut lu par le ghost manager (cf. dnd/dragGhost.ts) via
                // document.elementFromPoint pendant le tracking du drag, pour
                // calculer le badge allowed/forbidden. Sans cet attribut, le
                // ghost affiche systématiquement la croix rouge "interdit"
                // alors que le drop fonctionne effectivement.
                data-finder-drop-path={segment.path}
                className={clsx(
                  'font-medium text-gray-900 truncate max-w-[110px] sm:max-w-[200px]',
                  'rounded px-1 py-0.5',
                  // Highlight au dragover (sur la feuille aussi)
                  isCurrentDragOver && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400',
                )}
                title={segment.name}
                aria-current="page"
              >
                {segment.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPath(segment.path)}
                onDragEnter={handlers.handleDragEnter}
                onDragOver={handlers.handleDragOver}
                onDragLeave={handlers.handleDragLeave}
                onDrop={handlers.handleDrop}
                // Cf. note sur la feuille — l'attribut est requis pour le
                // calcul du badge ghost allowed/forbidden.
                data-finder-drop-path={segment.path}
                className={clsx(
                  'text-gray-600 hover:text-gray-900 hover:underline',
                  'truncate max-w-[110px] sm:max-w-[200px]',
                  'rounded px-1 py-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  'transition-colors',
                  isCurrentDragOver && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400',
                )}
                title={segment.name}
              >
                {segment.name}
              </button>
            )}

            {!isLast && (
              <ChevronRight
                className="h-3.5 w-3.5 text-gray-400 shrink-0"
                aria-hidden
              />
            )}

            {/* Le « … » suit immédiatement la racine et ouvre les niveaux
                escamotés. Ce ne sont pas des cibles de dépôt — d'où le seuil
                fixé assez haut pour que les chemins courants n'y passent
                jamais. */}
            {collapsed && visibleIndex === 0 && (
              <span ref={hiddenMenuRef} className="relative flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowHidden((v) => !v)}
                  aria-expanded={showHidden}
                  aria-label={`Afficher les ${hiddenSegments.length} niveaux intermédiaires`}
                  className={clsx(
                    'rounded px-1 py-0.5 text-gray-500',
                    'hover:bg-gray-100 hover:text-gray-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showHidden && (
                  <div className="absolute left-0 top-full z-30 mt-1 min-w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                    {hiddenSegments.map((hidden) => (
                      <button
                        key={hidden.path}
                        type="button"
                        onClick={() => {
                          setShowHidden(false);
                          setPath(hidden.path);
                        }}
                        className="block w-full truncate px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                        title={hidden.name}
                      >
                        {hidden.name}
                      </button>
                    ))}
                  </div>
                )}

                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-gray-400"
                  aria-hidden
                />
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
