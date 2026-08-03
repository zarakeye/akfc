#!/usr/bin/env bash
#
# step_breadcrumb_collapse.sh
#
# Le fil d'Ariane se replie sur les chemins profonds, au lieu de déborder.
#
# ─── Pourquoi pas un bouton « Retour » ─────────────────────────────────────
#
# C'était ma proposition, et elle était paresseuse. Un fil d'Ariane fait DEUX
# choses : il oriente (où suis-je ?) et il navigue (remonter de trois niveaux
# d'un coup). Un bouton retour ne garde que la seconde, en version dégradée —
# un niveau à la fois.
#
# ─── Ce que font les autres, et pourquoi ils divergent ─────────────────────
#
#   iOS Fichiers    supprime le fil, met le dossier courant en titre ; tapoter
#                   ce titre déroule le chemin. L'orientation est là, cachée
#                   derrière un geste qu'on ne devine pas.
#   Google Drive    garde le fil entier et le rend défilable à l'horizontale.
#                   Défaut sournois : rien n'indique qu'il y a plus à gauche,
#                   et c'est justement la racine qu'on perd de vue.
#   OneDrive        replie le milieu : Racine / … / Parent / Courant.
#   GitHub, VS Code idem.
#
# C'est le repli qui est retenu, et pour une raison de fond : dans un chemin,
# les segments n'ont pas la même valeur. La racine et les deux derniers
# portent presque toute l'information utile ; les intermédiaires servent
# surtout à remonter — ce qu'un menu fait très bien.
#
# ─── Le repli vaut à TOUTES les tailles, et c'est délibéré ─────────────────
#
# Un seuil aurait imposé deux rendus du même fil, donc deux copies de la
# logique de glisser-déposer — laquelle occupe l'essentiel du composant. Le
# jour où l'une évolue sans l'autre, le dépôt marche sur desktop et pas en
# tablette, et personne ne comprend pourquoi.
#
# Un chemin de plus de quatre segments débordait de toute façon déjà en
# desktop : `truncate max-w-[200px]` était un pansement, et le commentaire du
# fichier admettait qu'une vraie troncature « sera à voir ».
#
# ─── Une perte assumée, que je signale ─────────────────────────────────────
#
# Les segments repliés cessent d'être des cibles de dépôt : on ne peut pas
# lâcher un fichier sur un « … ». Le seuil est donc posé à QUATRE segments
# visibles, au-delà desquels le repli s'active — les chemins courants gardent
# tous leurs cibles, et l'arbre reste de toute façon disponible pour les
# niveaux escamotés.
#
# Usage :
#   bash step_breadcrumb_collapse.sh
#   AKFC_APPLY_ONLY=1 bash step_breadcrumb_collapse.sh
#
set -euo pipefail

breadcrumb="apps/web/src/features/finder-core/components/Breadcrumb.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
# Marqueur pris sur la DERNIÈRE modification du script : une garde posée sur
# la première laisserait passer un fichier à moitié modifié pour « déjà fait ».
if grep -q "max-w-\[110px\]" "$breadcrumb" 2>/dev/null; then
  echo "✓ déjà appliqué (fil d'Ariane repliable) — rien à faire"
  exit 0
fi

[ -f "$breadcrumb" ] || { echo "✗ introuvable : $breadcrumb"; exit 1; }

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

breadcrumb = "apps/web/src/features/finder-core/components/Breadcrumb.tsx"

# ── 1/5 imports ───────────────────────────────────────────────────────────
edit(breadcrumb,
"""import { JSX, useState } from 'react';
import { ChevronRight } from 'lucide-react';""",
"""import { JSX, useEffect, useRef, useState } from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';""")

# ── 2/5 le seuil, au niveau module ────────────────────────────────────────
edit(breadcrumb, """export default function Breadcrumb({ adapter }: Props): JSX.Element {""",
"""/**
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

export default function Breadcrumb({ adapter }: Props): JSX.Element {""")

# ── 3/5 état du menu et fermeture au clic extérieur ───────────────────────
edit(breadcrumb, """  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

  const segments = buildPathSegments(currentPath);""",
"""  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);

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

  const segments = buildPathSegments(currentPath);

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
    : segments;""")

# ── 4/5 la boucle porte sur les segments visibles, index réel conservé ────
edit(breadcrumb, """      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;""",
"""      {visibleSegments.map((segment, visibleIndex) => {
        const isLast = visibleIndex === visibleSegments.length - 1;
        // Index dans la liste COMPLÈTE : c'est lui qui identifie la cible de
        // dépôt survolée. Un index de la liste réduite ferait surligner le
        // mauvais segment dès que le fil est replié.
        const index = segments.indexOf(segment);""")

# ── 5/5 le « … » s'insère après la racine ─────────────────────────────────
edit(breadcrumb, """            {!isLast && (
              <ChevronRight
                className="h-3.5 w-3.5 text-gray-400 shrink-0"
                aria-hidden
              />
            )}
          </span>""",
"""            {!isLast && (
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
          </span>""")

# ── le commentaire d'en-tête, devenu faux ────────────────────────────────
# Il annonçait qu'une vraie troncature avec « … » « sera à voir » : c'est
# précisément ce que ce script pose. Le laisser tel quel enverrait le
# prochain lecteur sur une piste déjà parcourue.
edit(breadcrumb, """ * Le tronquage `truncate max-w-[200px]` est conservé pour les chemins
 * profonds ; une vraie troncature centrée (avec `…`) sera à voir si on
 * a des chemins vraiment très longs en pratique.""",
""" * ─── Repli des chemins profonds ─────────────────────────────────────────
 *
 * Au-delà de `MAX_VISIBLE_SEGMENTS`, le fil devient
 * `Racine / … / Parent / Courant` : les niveaux intermédiaires passent dans
 * un menu ouvert par le « … ». Les segments repliés cessent d'être des
 * cibles de dépôt, d'où un seuil assez haut pour que les chemins courants
 * n'y passent jamais.""")

# ── largeur des segments : plus étroite sur petit écran ──────────────────
with io.open(breadcrumb, encoding='utf-8') as fh:
    src = fh.read()
count = src.count("truncate max-w-[200px]")
assert count == 2, "attendu 2 occurrences en className, trouvé %d" % count
src = src.replace("truncate max-w-[200px]", "truncate max-w-[110px] sm:max-w-[200px]")
with io.open(breadcrumb, 'w', encoding='utf-8') as fh:
    fh.write(src)
print("  ~ Breadcrumb.tsx (largeur des segments)")
PY

echo "✓ fil d'Ariane repliable"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(finder): fil d'Ariane repliable sur les chemins profonds

Le remplacer par un bouton « Retour » en petit ecran etait la solution
paresseuse : un fil d'Ariane oriente ET navigue, un bouton retour ne
garde que la seconde fonction, un niveau a la fois.

Repli du milieu — Racine / … / Parent / Courant — comme OneDrive,
GitHub et VS Code. Raison de fond : dans un chemin, les segments n'ont
pas la meme valeur. La racine et les deux derniers portent presque
toute l'information ; les intermediaires servent surtout a remonter, ce
qu'un menu fait tres bien.

Ecarte : le defilement horizontal de Drive, ou rien n'indique qu'il y a
plus a gauche — et c'est justement la racine qu'on perd de vue.

Le repli vaut a TOUTES les tailles, a dessein. Un seuil imposerait deux
rendus du meme fil, donc deux copies de la logique de glisser-deposer
qui occupe l'essentiel du composant ; le jour ou l'une evolue sans
l'autre, le depot marche sur desktop et pas en tablette. Un chemin de
plus de quatre segments debordait de toute facon deja en desktop, ou
truncate max-w-[200px] etait un pansement.

Perte assumee : les segments replies cessent d'etre des cibles de
depot. Le seuil est donc pose a quatre segments visibles — les chemins
courants gardent toutes leurs cibles, et l'arbre reste disponible pour
les niveaux escamotes."

echo "✓ commité"
git log -1 --oneline