#!/usr/bin/env bash
#
# step_exit_multiselect.sh
#
# Sortir du mode sélection multiple par Échap ou par un clic dans le vide.
# Jusqu'ici, seul le bouton « ✕ » de la barre d'actions le permettait.
#
# ─── Échap ─────────────────────────────────────────────────────────────────
#
# Un listener global, avec deux garde-fous :
#
#   - la saisie. `RenameInput` consomme déjà Échap (annuler le renommage) et
#     appelle `stopPropagation`, mais on ne s'en remet pas à l'ordre des
#     listeners : on ignore aussi tout événement issu d'un champ éditable.
#
#   - les surfaces empilées. `ContextMenu` et `PreviewModal` écoutent Échap
#     sur `window` eux aussi. L'ordre de déclenchement suit l'ordre de
#     MONTAGE, donc le finder — monté en premier — passerait AVANT le menu :
#     une seule pression fermerait le menu ET viderait la sélection.
#     Tester `defaultPrevented` ne servirait à rien pour la même raison.
#     On interroge donc le DOM, qui lui ne dépend d'aucun ordre : tant qu'une
#     surface porte `data-finder-overlay`, Échap lui appartient.
#
# ─── Clic dans le vide ─────────────────────────────────────────────────────
#
# `e.target === e.currentTarget` : le clic n'a traversé aucun enfant, il a
# atterri sur le conteneur lui-même. Aucun `stopPropagation` à semer dans les
# tuiles et les lignes, et aucun risque d'annuler une sélection en cours.
#
# Couvre le rembourrage et l'espace sous le contenu — la zone que l'œil lit
# comme « le vide ». Les gouttières de 8px entre les tuiles appartiennent à la
# grille : y cliquer ne sort pas du mode. C'est un compromis assumé, l'inverse
# demanderait de marquer chaque tuile et chaque ligne.
#
# Le même geste est branché sur le panneau de l'arbre.
#
# Usage :
#   bash step_exit_multiselect.sh
#   AKFC_APPLY_ONLY=1 bash step_exit_multiselect.sh
#
set -euo pipefail

C="apps/web/src/features/finder-core/components"
FINDER="$C/Finder.tsx"
TREE="$C/FinderTree.tsx"
MENU="$C/ContextMenu.tsx"
DIALOG="$C/MoveDialog.tsx"
PREVIEW="$C/PreviewModal.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$FINDER" "$TREE" "$MENU" "$DIALOG" "$PREVIEW"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "data-finder-overlay" "$PREVIEW"; then
  echo "✓ déjà appliqué (marqueur présent dans $PREVIEW) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

C       = "apps/web/src/features/finder-core/components"
FINDER  = "%s/Finder.tsx" % C
TREE    = "%s/FinderTree.tsx" % C
MENU    = "%s/ContextMenu.tsx" % C
DIALOG  = "%s/MoveDialog.tsx" % C
PREVIEW = "%s/PreviewModal.tsx" % C

# ── 1/6 Finder : listener Échap ────────────────────────────────────────────
edit(FINDER, """  const handleLayoutChange = useCallback((layout: Layout) => {""",
"""  // ─── Échap quitte le mode sélection ──────────────────────────────────
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

  const handleLayoutChange = useCallback((layout: Layout) => {""")

# ── 2/6 Finder : le vide de la zone de contenu ─────────────────────────────
edit(FINDER, """              <div
                className="p-4 overflow-auto flex-1"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSortMenuPos({ x: e.clientX, y: e.clientY });
                }}
              >""",
"""              <div
                className="p-4 overflow-auto flex-1"
                onClick={handleVoidClick}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSortMenuPos({ x: e.clientX, y: e.clientY });
                }}
              >""")

# ── 3/6 Finder : le vide du panneau de l'arbre ─────────────────────────────
edit(FINDER, """          <FinderTree
            adapter={adapter}
            rootPath={rootPath}""",
"""          <FinderTree
            onVoidClick={handleVoidClick}
            adapter={adapter}
            rootPath={rootPath}""")

# ── 4/6 FinderTree : recevoir et poser le geste ────────────────────────────
edit(TREE, """  /** En pickMode : épingle/retire un fichier (délégué au store panier). */
  onPickToggle?: (node: FinderNode) => void;
};""",
"""  /** En pickMode : épingle/retire un fichier (délégué au store panier). */
  onPickToggle?: (node: FinderNode) => void;
  /**
   * Clic dans le vide du panneau : le finder y sort du mode sélection. Le
   * garde-fou `target === currentTarget` vit chez l'appelant.
   */
  onVoidClick?: (e: React.MouseEvent<HTMLElement>) => void;
};""")

edit(TREE, """export default function FinderTree({
  adapter,
  rootPath,""",
"""export default function FinderTree({
  onVoidClick,
  adapter,
  rootPath,""")

edit(TREE, """  return (
    <TrashMapProvider value={trashMap}>
      <div className="space-y-0.5">""",
"""  return (
    <TrashMapProvider value={trashMap}>
      {/* `min-h-full` : sans hauteur, le vide sous l'arbre appartiendrait au
          panneau et non à ce div — le clic n'y serait jamais capté. */}
      <div className="space-y-0.5 min-h-full" onClick={onVoidClick}>""")

# ── 5/6 ContextMenu + MoveDialog : marquer les surfaces empilées ───────────
edit(MENU, """  // ─── Click outside + Escape ──────────────────────────────────────────────""",
"""  // Marqueur lu par le listener Échap du finder : tant qu'une surface est
  // empilée, Échap lui appartient. Le DOM sert d'arbitre parce qu'il ne
  // dépend pas de l'ordre de montage des listeners.
  // ─── Click outside + Escape ──────────────────────────────────────────────""")

edit(DIALOG, """      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4\"""",
"""      data-finder-overlay
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4\"""")

# ── 6/6 PreviewModal : DERNIER fichier écrit (marqueur de la garde) ────────
edit(PREVIEW, """  // ─── Listener Escape ───────────────────────────────────────────────────""",
"""  // cf. `data-finder-overlay` plus bas : le finder n'attrape pas Échap tant
  // que cette modale est montée.
  // ─── Listener Escape ───────────────────────────────────────────────────""")
PY

# `data-finder-overlay` sur les racines de ContextMenu et PreviewModal : leur
# JSX varie trop pour une ancre littérale, on cible l'attribut de style qui
# suit immédiatement l'ouverture de la balise racine.
python3 - <<'PY'
import io, re

def mark_root(path, anchor_re):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    hits = list(re.finditer(anchor_re, src))
    assert len(hits) == 1, "ancre %d fois dans %s" % (len(hits), path)
    m = hits[0]
    src = src[:m.start()] + "data-finder-overlay\n      " + src[m.start():]
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src)
    print("  ~ %s (racine marquée)" % path.rsplit('/', 1)[-1])

C = "apps/web/src/features/finder-core/components"
mark_root("%s/ContextMenu.tsx" % C, r"style=\{\{\s*\n?\s*position: 'fixed'")
mark_root("%s/PreviewModal.tsx" % C, r'className="fixed inset-0 z-50')
PY

echo "✓ 10 substitutions appliquées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(finder): quitter le mode selection par Echap ou clic dans le vide

Echap est ignore si la frappe vient d'un champ editable, ou si une
surface empilee (menu contextuel, modale) est montee -- le DOM sert
d'arbitre, l'ordre des listeners suivant l'ordre de montage.

Le clic dans le vide se detecte par target === currentTarget : aucun
stopPropagation a semer dans les tuiles et les lignes."

echo "✓ commité"
git log -1 --oneline