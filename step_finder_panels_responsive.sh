#!/usr/bin/env bash
#
# step_finder_panels_responsive_v2.sh
#
# Remplace `step_finder_panels_responsive.sh`, dont une ancre ne correspondait
# pas à ton fichier. Sûr à lancer même si le premier script a laissé ton
# `Finder.tsx` à moitié modifié : chaque édit vérifie d'abord si son résultat
# est déjà là.
#
# ─── Ce qui a échoué, et la leçon ──────────────────────────────────────────
#
# L'ancre du deuxième édit couvrait treize lignes d'affilée — de
# `previewPanelRef` jusqu'au corps de `togglePreviewPanel`. Une seule
# différence d'espacement sur l'une d'elles, et la correspondance tombe à
# zéro. Elle passait sur mon exemplaire du dépôt, pas sur le tien.
#
# Les ancres de cette version tiennent en UNE ligne chacune, choisie pour être
# unique dans le fichier (vérifié : `usePanelRef();` et
# `function togglePreviewPanel` n'apparaissent qu'une fois). Moins de surface,
# moins d'occasions de diverger.
#
# ─── Le reste est inchangé ─────────────────────────────────────────────────
#
# Sous 1280px, l'arbre disparaît et l'aperçu quitte sa colonne pour une
# feuille venant du bas. Le calcul : arbre 240 + zone centrale ~380 + aperçu
# 300 = 920px, plus la sidebar du panneau de contrôle. En dessous, les trois
# volets se disputent une place qu'ils n'ont pas.
#
# Principe : substituer, pas rétrécir. Aucune application de fichiers
# n'affiche d'arbre sur mobile — ni Fichiers, ni Drive, ni OneDrive : on y
# navigue par le contenu et le fil d'Ariane, tous deux désormais tactiles.
#
# Réemploi : `useIsBreakpoint` existe déjà (écrit avec `useSyncExternalStore`,
# sûr au rendu serveur) ; `PreviewPanel` sert tel quel dans la feuille ; le
# bouton de la barre d'outils garde sa place — il replie le volet en large,
# ouvre la feuille en étroit.
#
# Ici la LARGEUR décide, contrairement aux gestes qui suivent le pointeur :
# trois colonnes ne tiennent pas dans 900px, qu'on les touche ou qu'on les
# clique.
#
# Usage :
#   bash step_finder_panels_responsive_v2.sh
#   AKFC_APPLY_ONLY=1 bash step_finder_panels_responsive_v2.sh
#
set -euo pipefail

finder="apps/web/src/features/finder-core/components/Finder.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

if grep -q "APERÇU EN FEUILLE" "$finder" 2>/dev/null; then
  echo "✓ déjà appliqué (volets responsives) — rien à faire"
  exit 0
fi

[ -f "$finder" ] || { echo "✗ introuvable : $finder"; exit 1; }
[ -f "apps/web/src/hooks/use-is-breakpoint.ts" ] || {
  echo "✗ hook use-is-breakpoint introuvable"; exit 1; }

python3 - <<'PY'
import io

FINDER = "apps/web/src/features/finder-core/components/Finder.tsx"

def read():
    with io.open(FINDER, encoding='utf-8') as fh:
        return fh.read()

def write(src):
    with io.open(FINDER, 'w', encoding='utf-8') as fh:
        fh.write(src)

def edit(marker, old, new, label):
    """Applique l'édit sauf si `marker` est déjà présent.

    Le marqueur rend le script sûr à relancer sur un fichier partiellement
    modifié — situation créée par l'échec de la version précédente."""
    src = read()
    if marker in src:
        print("  = %s (déjà présent)" % label)
        return
    n = src.count(old)
    assert n == 1, "ancre %d fois pour « %s » :\n%s" % (n, label, old[:120])
    write(src.replace(old, new))
    print("  ~ %s" % label)

# ── 1 — import du hook ────────────────────────────────────────────────────
edit("use-is-breakpoint",
"""import PreviewPanel from "@features/finder-core/components/PreviewPanel";""",
"""import PreviewPanel from "@features/finder-core/components/PreviewPanel";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";""",
"import du hook de breakpoint")

# ── 2 — icône de fermeture de la feuille ──────────────────────────────────
edit("\n  X,\n", "  PanelRightClose,\n", "  PanelRightClose,\n  X,\n",
     "import de l'icône X")

# ── 3 — le seuil et l'état de la feuille ──────────────────────────────────
# Ancre d'UNE ligne, vérifiée unique : la version précédente en couvrait
# treize, et une seule différence d'espacement suffisait à la faire tomber.
edit("previewSheetOpen",
"""  const previewPanelRef = usePanelRef();""",
"""  const previewPanelRef = usePanelRef();

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
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);""",
"seuil et état de la feuille")

# ── 4 — la bascule sert les deux dispositions ─────────────────────────────
edit("setPreviewSheetOpen((v) => !v)",
"""  function togglePreviewPanel() {""",
"""  function togglePreviewPanel() {
    // Même bouton, même intention : replier le volet en large, ouvrir la
    // feuille en étroit.
    if (!isWide) {
      setPreviewSheetOpen((v) => !v);
      return;
    }""",
"bascule du bouton d'aperçu")

# ── 5 — l'icône du bouton suit l'état courant ─────────────────────────────
edit("isWide ? isPreviewCollapsed :",
"""          {isPreviewCollapsed ? (""",
"""          {(isWide ? isPreviewCollapsed : !previewSheetOpen) ? (""",
"icône du bouton")

# ── 6 — arbre + son séparateur, en un bloc conditionnel ───────────────────
# Les deux séparateurs du fichier ont un balisage IDENTIQUE : les ancres
# incluent donc le commentaire du volet qui suit, seul élément distinctif.
SEP = '''        <Separator
          className="
            w-px bg-gray-200
            hover:bg-blue-400 hover:w-0.75
            transition-all
            focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-0.75
          "
        />'''

edit("🌳 TREE — masqué",
"""        {/* 🌳 TREE */}""",
"""        {/* 🌳 TREE — masqué sous 1280.
            On navigue alors par le contenu et le fil d'Ariane, tous deux
            tactiles. Aucune application de fichiers mobile n'affiche
            d'arbre : ni Fichiers, ni Drive, ni OneDrive. */}
        {isWide && (
        <>""",
"ouverture du bloc arbre")

edit("</>\n        )}\n\n        {/* 📁 GRILLE */}",
SEP + """

        {/* 📁 GRILLE */}""",
SEP + """
        </>
        )}

        {/* 📁 GRILLE */}""",
"fermeture du bloc arbre")

# ── 7 — séparateur + volet d'aperçu ───────────────────────────────────────
edit("{isWide && (\n        <>\n" + SEP,
SEP + """

        {/* 👁️ PREVIEW */}""",
"""        {isWide && (
        <>
""" + SEP + """

        {/* 👁️ PREVIEW */}""",
"ouverture du bloc aperçu")

# ── 8 — fermeture, puis la feuille (DERNIÈRE modification : c'est elle que
#        la garde du script teste) ────────────────────────────────────────
edit("APERÇU EN FEUILLE",
"""          <PreviewPanel adapter={adapter} />
        </Panel>
      </Group>""",
"""          <PreviewPanel adapter={adapter} />
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
      )}""",
"fermeture du bloc aperçu et feuille")
PY

echo "✓ volets du finder responsives"

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
git commit -m "feat(finder): les trois volets deviennent un ecran sous 1280

La disposition reclame 920px — arbre 240, zone centrale ~380, apercu
300 — plus la sidebar du panneau de controle. Sous 1280 les volets se
disputent une place qu'ils n'ont pas : la zone centrale tombe sous la
largeur de trois vignettes et l'arbre devient une colonne de noms
tronques.

Principe : substituer, pas retrecir. Aucune application de fichiers
n'affiche d'arbre sur mobile — ni Fichiers, ni Drive, ni OneDrive : on
y navigue par le contenu et le fil d'Ariane, tous deux tactiles.
L'apercu quitte la colonne pour une feuille venant du bas.

Reemploi : useIsBreakpoint existait deja, ecrit avec
useSyncExternalStore et sur au rendu serveur ; PreviewPanel sert tel
quel dans la feuille — un second composant d'apercu aurait diverge a la
premiere correction ; le bouton de la barre d'outils garde sa place et
son intention.

Ici la LARGEUR decide, contrairement aux gestes qui suivent le
pointeur : trois colonnes ne tiennent pas dans 900px, qu'on les touche
ou qu'on les clique.

Limite assumee : la feuille s'ouvre au bouton et non a la selection
d'un fichier — reagir a un changement de selection demanderait un effet
et sa cascade de rendus."

echo "✓ commité"
git log -1 --oneline