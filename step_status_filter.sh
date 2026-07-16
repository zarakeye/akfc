#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — Le filtre « Tous / En attente / Publiés »
# ═══════════════════════════════════════════════════════════════════════════
#
#  Le pliage a mélangé les contenus en attente et publiés dans le même
#  dossier, avec un badge pour seule distinction. Ce filtre rend au finder ce
#  que la strate lui donnait gratuitement — sans la strate.
#
#  ─── Pourquoi PAS `fileFilter`, alors qu'il existe déjà ─────────────────
#
#  `Finder.tsx` a un point d'extension tout trouvé :
#
#      const visibleFiles = useMemo(
#        () => (fileFilter ? files.filter(fileFilter) : files), …
#
#  Mais `fileFilter` est AUSSI passé à `FinderTree`, où il pilote
#  `pruneTreeFiles(root, fileFilter)` — et il est dans les deps du `useEffect`
#  qui construit l'arbre (FinderTree.tsx:185). S'y brancher ferait donc
#  reconstruire et élaguer l'ARBRE à chaque clic sur le filtre : les dossiers
#  devenus vides disparaîtraient, la structure bougerait sous la souris.
#
#  Un arbre qui change de forme quand on change de lentille désoriente : on
#  ne sait plus si un dossier a disparu parce qu'il est filtré ou parce qu'il
#  n'existe plus. Le filtre est une lentille sur la GRILLE, pas sur la
#  structure. D'où un chemin séparé, appliqué APRÈS `fileFilter`, et jamais
#  transmis à l'arbre.
#
#  ─── Défaut : « Tous » ──────────────────────────────────────────────────
#
#  Pour ne rien cacher à qui ne comprend pas encore le filtre. Un admin qui
#  ne voit pas ses photos ne se demande pas quel filtre est actif — il pense
#  qu'elles ont disparu.
#
#  ─── Persisté, comme le mode d'affichage ────────────────────────────────
#
#  Même mécanisme que `viewMode` : c'est une préférence de travail, pas un
#  état de navigation. On ne la repose pas à chaque rechargement.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  PRÉREQUIS : T7b (statusOf) et T7d (la bascule).
#
#  USAGE
#  -----
#     bash step_status_filter.sh
#     AKFC_APPLY_ONLY=1 bash step_status_filter.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — filtre Tous / En attente / Publiés"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

FC="apps/web/src/features/finder-core"
BAR="$FC/components/StatusFilterBar.tsx"

grep -q "export function statusOf" "$FC/utils/statusFolders.ts" \
  || { echo "✗ T7b n'est pas appliqué (statusOf absent)."; exit 1; }
grep -rq "logical: true" apps/web/src \
  || { echo "✗ T7d n'est pas appliqué (la bascule)."; exit 1; }

if [ -f "$BAR" ]; then
  echo "✓ Déjà appliqué ($BAR présent)."
  exit 0
fi

# ─── 1. Le store ──────────────────────────────────────────────────────────
python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

S = "apps/web/src/features/finder-core/state/useFinderStore.ts"

sub_once(S,
"""  viewMode: FinderViewMode;
  setViewMode: (mode: FinderViewMode) => void;""",
"""  viewMode: FinderViewMode;
  setViewMode: (mode: FinderViewMode) => void;

  /**
   * La lentille de statut posée sur la GRILLE.
   *
   * Depuis le chantier « arbre sans strate de statut », un dossier contient
   * ses contenus en attente ET ses contenus publiés. Ce filtre rend ce que la
   * strate donnait gratuitement — sans la strate.
   *
   * ⚠️ Il ne touche PAS l'arbre, délibérément. Il n'est jamais transmis à
   * `FinderTree` : la structure reste stable quel que soit le filtre actif.
   * Un arbre qui change de forme quand on change de lentille rend
   * indécidable la question « ce dossier a-t-il disparu parce qu'il est
   * filtré, ou parce qu'il n'existe plus ? ».
   */
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;""",
    "store — statusFilter dans le type")

sub_once(S,
"""  viewMode: loadViewMode(),""",
"""  viewMode: loadViewMode(),
  statusFilter: loadStatusFilter(),""",
    "store — valeur initiale")

sub_once(S,
"""  setViewMode: (mode) => {
    saveViewMode(mode);
    set({ viewMode: mode });""",
"""  setStatusFilter: (filter) => {
    saveStatusFilter(filter);
    set({ statusFilter: filter });
  },

  setViewMode: (mode) => {
    saveViewMode(mode);
    set({ viewMode: mode });""",
    "store — setter")

sub_once(S,
"""import { create } from 'zustand';
import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';""",
"""import { create } from 'zustand';
import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

/**
 * Les trois lentilles de statut. `'all'` n'est pas un statut — c'est
 * l'absence de lentille, d'où un type à part et non `LifecycleStatus | null`.
 */
export type StatusFilter = 'all' | 'pending' | 'published';

const STATUS_FILTER_KEY = 'akfc.finder.statusFilter';

/**
 * Persisté comme `viewMode` : c'est une préférence de travail, pas un état de
 * navigation. Un admin qui trie ses contenus en attente ne veut pas
 * recommencer à chaque rechargement.
 *
 * Défaut `'all'` — pour ne rien cacher à qui ne connaît pas encore le filtre.
 * Un admin qui ne voit pas ses photos ne se demande pas quel filtre est
 * actif : il pense qu'elles ont disparu.
 */
function loadStatusFilter(): StatusFilter {
  if (typeof window === 'undefined') return 'all';
  const stored = window.localStorage.getItem(STATUS_FILTER_KEY);
  return stored === 'pending' || stored === 'published' ? stored : 'all';
}

function saveStatusFilter(filter: StatusFilter): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STATUS_FILTER_KEY, filter);
}""",
    "store — type, chargement et persistance")
PYEOF

# ─── 2. La barre ──────────────────────────────────────────────────────────
cat > "$BAR" <<'TSEOF'
'use client';

import { type JSX } from 'react';
import clsx from 'clsx';

import { useFinderStore, type StatusFilter } from '@features/finder-core/state/useFinderStore';

/**
 * La lentille de statut : Tous / En attente / Publiés.
 *
 * Avant le chantier « arbre sans strate de statut », cette distinction était
 * un LIEU : `AKFC/pending/…` d'un côté, `AKFC/published/…` de l'autre. On la
 * lisait dans le fil d'Ariane, on la changeait en naviguant. C'était gratuit
 * — et c'est ce qui coûtait un déplacement de binaire à chaque publication.
 *
 * Le statut est redevenu une métadonnée. Cette barre rend ce que la strate
 * donnait, sans ce qu'elle coûtait.
 *
 * ⚠️ Elle ne filtre QUE la grille. Cf. `statusFilter` dans le store : l'arbre
 * reste stable quel que soit le filtre actif.
 */

const OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publiés' },
];

export default function StatusFilterBar(): JSX.Element {
  const statusFilter = useFinderStore((s) => s.statusFilter);
  const setStatusFilter = useFinderStore((s) => s.setStatusFilter);

  return (
    <div
      role="group"
      aria-label="Filtrer par statut"
      className="flex shrink-0 items-center rounded-md border border-neutral-300 p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = statusFilter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setStatusFilter(option.value)}
            className={clsx(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-600 hover:bg-neutral-100',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
TSEOF
echo "  ✓ $BAR (neuf)"

# ─── 3. Le Finder ─────────────────────────────────────────────────────────
python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

F = "apps/web/src/features/finder-core/components/Finder.tsx"

sub_once(F,
'import GridItem from "@features/finder-core/components/GridItem";',
'import GridItem from "@features/finder-core/components/GridItem";\n'
'import StatusFilterBar from "@features/finder-core/components/StatusFilterBar";\n'
'import { statusOf } from "@features/finder-core/utils/statusFolders";',
    "Finder — imports")

sub_once(F,
"""  // Filtre optionnel : on ne retire QUE des fichiers (les dossiers restent
  // pour la navigation). Absent ⇒ aucun retrait. cf. prop `fileFilter`.
  const visibleFiles = useMemo(
    () => (fileFilter ? files.filter(fileFilter) : files),
    [files, fileFilter],
  );""",
"""  const statusFilter = useFinderStore((s) => s.statusFilter);

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
  }, [files, fileFilter, statusFilter]);""",
    "Finder — la lentille de statut sur la grille")

sub_once(F,
"""        {currentPath !== `${APP_ROOT}/bin` && <FinderViewModeSwitcher />}""",
"""        {/* La corbeille garde son propre système : ses items n'ont pas de
            statut de publication, la lentille n'y a rien à filtrer. */}
        {currentPath !== `${APP_ROOT}/bin` &&
          !multiSelectActive &&
          !fileFilter && <StatusFilterBar />}

        {currentPath !== `${APP_ROOT}/bin` && <FinderViewModeSwitcher />}""",
    "Finder — la barre dans la barre d'outils")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "feat(finder): filtre Tous / En attente / Publiés

Le pliage a mélangé les contenus en attente et publiés dans le même dossier,
avec un badge pour seule distinction. Cette lentille rend ce que la strate
donnait gratuitement — sans ce qu'elle coûtait (un déplacement de binaire à
chaque publication).

Pas branché sur le fileFilter existant, alors qu'il était tentant : fileFilter
est aussi passé à FinderTree, où il pilote pruneTreeFiles, et il vit dans les
deps du useEffect qui construit l'arbre. S'y brancher ferait élaguer et
reconstruire l'ARBRE à chaque clic — les dossiers devenus vides
disparaîtraient sous la souris, et on ne saurait plus si un dossier a disparu
parce qu'il est filtré ou parce qu'il n'existe plus. Le filtre est une
lentille sur la grille, pas sur la structure.

- défaut 'all' : ne rien cacher à qui ne connaît pas encore le filtre.
- persisté comme viewMode : c'est une préférence de travail, pas un état de
  navigation.
- les dossiers ne sont jamais retirés : un dossier n'a pas de statut, et le
  vider de ses fichiers filtrés ne le rend pas moins navigable.
- absent de la corbeille (pas de statut de publication à filtrer) et du
  picker (comme la barre de recherche)."

echo "✅ Filtre appliqué, typechecké et commité."