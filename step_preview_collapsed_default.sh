#!/usr/bin/env bash
#
# step_preview_collapsed_default.sh
#
# Le panneau d'aperçu s'ouvre déployé, dans le finder comme dans le picker
# (`MediaPicker` monte le même `<Finder>`). On inverse : il démarre replié,
# et son déploiement devient un geste délibéré.
#
# Deux choses le déployaient, il fallait traiter les deux :
#
#   1. `defaultSize="420px"` sur le `Panel`.
#
#   2. la restauration de `akfc:finder:layout` au montage. Sans elle, replier
#      le panneau une fois puis le déployer le figerait déployé pour toutes
#      les sessions suivantes — le contraire de ce qui est demandé.
#
# On garde pourtant cette restauration : elle porte aussi la largeur du
# panneau de l'arbre, que l'utilisateur a réglée et veut retrouver. On la
# laisse donc s'appliquer, puis on replie l'aperçu par-dessus. La largeur
# choisie pour l'aperçu survit dans le layout et sera restituée telle quelle
# au premier déploiement.
#
# `defaultSize` reste à 420px, délibérément : c'est la largeur du panneau une
# fois ouvert, pas son état initial. La mettre à 0 entrerait en conflit avec
# `minSize="300px"`.
#
# Usage :
#   bash step_preview_collapsed_default.sh
#   AKFC_APPLY_ONLY=1 bash step_preview_collapsed_default.sh
#
set -euo pipefail

FINDER="apps/web/src/features/finder-core/components/Finder.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$FINDER" ] || { echo "✗ introuvable : $FINDER"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "collapsePreviewOnMount" "$FINDER"; then
  echo "✓ déjà appliqué (marqueur présent dans $FINDER) — rien à faire"
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

FINDER = "apps/web/src/features/finder-core/components/Finder.tsx"

# ── 1/2 : l'état initial du bouton reflète le repli ────────────────────────
edit(FINDER, """  const previewPanelRef = usePanelRef();
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);""",
"""  const previewPanelRef = usePanelRef();
  // Le panneau démarre replié (cf. l'effet de montage plus bas) : l'icône et
  // le libellé du bouton doivent partir dans cet état, sans quoi le premier
  // rendu annoncerait « Masquer » sur un panneau déjà masqué.
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(true);""")

# ── 2/2 : replier après la restauration du layout ──────────────────────────
edit(FINDER, """      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved && groupRef.current) {
        const layout = JSON.parse(saved) as Layout;
        groupRef.current.setLayout(layout);
      }
    } catch {
      // Si JSON corrompu ou localStorage indisponible (mode privé strict),
      // on garde silencieusement le layout par défaut. Pas d'effet visible.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
"""      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
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
  }, []);""")

# Helper au niveau module — React Compiler strict interdit les calculs
# réassignés pendant le rendu ; une fonction pure hors composant est la
# forme attendue par la convention du projet.
edit(FINDER, """const LAYOUT_STORAGE_KEY = "akfc:finder:layout";""",
"""const LAYOUT_STORAGE_KEY = "akfc:finder:layout";

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
}""")
PY

echo "✓ 3 substitutions appliquées"

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
git commit -m "feat(finder): le panneau d'apercu demarre replie

Il s'ouvrait deploye dans le finder comme dans le picker, et prenait
de la place sans avoir ete demande. Il est desormais replie au
montage ; le deployer est un geste deliberé.

Le layout reste restaure -- il porte la largeur du panneau de
l'arbre -- et l'apercu est replie par-dessus, apres setLayout. Sa
largeur survit dans le layout et revient au premier deploiement."

echo "✓ commité"
git log -1 --oneline