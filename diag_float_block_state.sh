#!/usr/bin/env bash
#
# diag_float_block_state.sh
#
# ÉCHAFAUDAGE TEMPORAIRE — à retirer au prochain incrément.
#
# ─── Pourquoi une ligne de diagnostic plutôt qu'un correctif ───────────────
#
# L'éditeur float et l'aperçu float reçoivent le MÊME objet `block`. Or
# l'aperçu affiche « aucune image n'est associée à ce bloc », ce qui signifie
# que `block.media` y est vide. Deux lectures s'opposent :
#
#   - soit le clic sur l'avatar n'écrit rien dans le bloc, et le sélecteur ne
#     doit pas apparaître comme sélectionné ;
#   - soit il écrit bien, et alors l'aperçu ne reçoit pas le bloc qu'on croit.
#
# Ces deux cas appellent des correctifs opposés, et quatre tours de
# raisonnement n'ont pas suffi à les départager. Une ligne qui affiche l'état
# réel du bloc tranche en cinq secondes, sans inspecteur.
#
# ─── Ce que ça ajoute, et ce que ça n'ajoute pas ───────────────────────────
#
# Une seule ligne discrète sous le sélecteur d'avatar, dans l'éditeur du bloc
# float uniquement. Aucune logique, aucun effet, aucune requête : elle lit
# `block.media` et l'écrit en clair. Rien d'autre n'est touché.
#
# Elle se retire en supprimant le bloc marqué DIAGNOSTIC dans
# `float-text/editor.client.tsx` — ou par le script de nettoyage que je
# fournirai une fois la cause connue.
#
# ─── Ce qu'il faut regarder ────────────────────────────────────────────────
#
#   1. Ouvre ton profil, dans le bloc float clique ton avatar.
#   2. Lis la ligne « État du bloc » juste en dessous.
#
#      « aucune image »            → le clic n'écrit pas dans le bloc.
#      « avatar (xxxx) »           → le clic écrit ; le défaut est ailleurs,
#                                    entre le bloc et l'aperçu.
#
#   3. Regarde aussi si le bouton de ton avatar se met en surbrillance
#      (bordure colorée, fond teinté) : c'est le même signal, vu autrement.
#
# Usage :
#   bash diag_float_block_state.sh
#   AKFC_APPLY_ONLY=1 bash diag_float_block_state.sh
#
set -euo pipefail

EDITOR="apps/web/src/features/page-builder/blocks/float-text/editor.client.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "DIAGNOSTIC" "$EDITOR" 2>/dev/null; then
  echo "✓ déjà appliqué (ligne de diagnostic présente) — rien à faire"
  exit 0
fi

[ -f "$EDITOR" ] || { echo "✗ introuvable : $EDITOR"; exit 1; }

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

EDITOR = "apps/web/src/features/page-builder/blocks/float-text/editor.client.tsx"

# La ligne se pose juste après la fermeture de l'AvatarPicker, donc au plus
# près du geste dont on veut connaître l'effet.
edit(EDITOR, """          />
        </div>
      </div>

      {/* Texte */}""",
"""          />
        </div>

        {/* DIAGNOSTIC — échafaudage temporaire, à retirer.
            Affiche l'état réel de `block.media`, celui-là même que l'aperçu
            reçoit. Permet de distinguer « le clic n'écrit rien » de « le clic
            écrit mais l'aperçu ne le voit pas », deux causes qui appellent
            des correctifs opposés. */}
        <p className="text-[11px] text-muted-foreground">
          État du bloc :{" "}
          {block.media
            ? block.media.kind === "avatar"
              ? `avatar (${block.media.userId})`
              : `bibliothèque (${block.media.mediaId})`
            : "aucune image"}
        </p>
      </div>

      {/* Texte */}""")
PY

echo "✓ ligne de diagnostic posée dans l'éditeur du bloc float"

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
git commit -m "chore(float-text): ligne de diagnostic temporaire sur l'etat du bloc

Echafaudage, a retirer une fois la cause connue.

L'editeur et l'apercu recoivent le meme objet block, or l'apercu
annonce que block.media est vide. Soit le clic sur l'avatar n'ecrit
rien, soit il ecrit et l'apercu ne recoit pas le bloc attendu — deux
causes aux correctifs opposes que le raisonnement seul n'a pas
departagees.

La ligne affiche block.media en clair sous le selecteur. Aucune
logique, aucun effet, aucune requete."

echo "✓ commité"
git log -1 --oneline