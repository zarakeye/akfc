#!/usr/bin/env bash
#
# fix_float_scope_width.sh
#
# L'enrobage ne s'engageait quasiment jamais. Cause trouvée, et c'est une
# erreur de conception de ma part, pas un accident.
#
# ─── Le conteneur du float était bridé à la mesure du TEXTE ────────────────
#
# `FloatTextView` et son aperçu enveloppaient le float dans
# `akfc-float-scope akfc-measure-block`. Or `akfc-measure-block` plafonne à
# `--akfc-measure` (68ch, soit 34 à 36rem selon la police effective), pendant
# que le repli mobile se déclenchait à 34rem. Le conteneur était donc posé
# PILE sur son propre seuil de bascule : l'enrobage ne s'engageait presque
# jamais, et dans le panneau d'aperçu — plus étroit que la page — jamais.
#
# Le raisonnement juste : avec un float, la largeur du texte vaut
# « conteneur moins image ». Si le conteneur EST la mesure, le texte n'en
# reçoit que 62 %, une quarantaine de caractères — illisible, et c'est le
# repli qui a raison de se déclencher.
#
# Le conteneur doit donc être le PUITS DE PAGE, et le texte enrobant retombe
# alors sur la mesure tout seul : 68rem × 62 % ≈ 675px ≈ 68ch. La mesure
# n'est pas imposée au bloc, elle EST le résultat de la géométrie.
#
# Les cas dégénérés gardent `akfc-measure-block` : un bloc sans image est du
# texte ordinaire, qui doit rester à la mesure.
#
# Le seuil de repli descend de 34rem à 26rem — il ne doit attraper que les
# contextes vraiment étroits (téléphone, barre latérale), pas frôler la
# largeur nominale du bloc.
#
# ─── Second défaut, lui aussi de ma main ───────────────────────────────────
#
# L'aperçu ne signalait l'état de la résolution que si le bloc était
# ENTIÈREMENT vide. Avec du texte présent et l'image non résolue, il affichait
# le texte sans un mot — donc « il manque une image » et « l'image est
# introuvable » se ressemblaient. C'est précisément le défaut que l'aperçu
# média-texte avait été écrit pour éviter, et je l'ai réintroduit.
#
# Il annonce désormais son état quoi qu'il arrive.
#
# Usage :
#   bash fix_float_scope_width.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_scope_width.sh
#
set -euo pipefail

VIEW="apps/web/src/features/page-builder/blocks/float-text/view.server.tsx"
PREVIEW="apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"
GLOBALS="apps/web/src/app/globals.css"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "max-width: 26rem" "$GLOBALS" 2>/dev/null; then
  echo "✓ déjà appliqué (seuil de repli à 26rem) — rien à faire"
  exit 0
fi

for f in "$VIEW" "$PREVIEW" "$GLOBALS"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

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

VIEW    = "apps/web/src/features/page-builder/blocks/float-text/view.server.tsx"
PREVIEW = "apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"
GLOBALS = "apps/web/src/app/globals.css"

# ── 1/3 vue publique : le scope prend le puits, pas la mesure ─────────────
edit(VIEW, """  // Les deux présents : enrobage. `akfc-float-scope` est le conteneur de
  // requête (comme `akfc-block-scope` pour le média-texte) ; `akfc-float`
  // porte le float et le `clear`.
  return (
    <div className="akfc-float-scope akfc-measure-block">""",
"""  // Les deux présents : enrobage. `akfc-float-scope` est le conteneur de
  // requête (comme `akfc-block-scope` pour le média-texte) ; `akfc-float`
  // porte le float et le `clear`.
  //
  // PAS de `akfc-measure-block` ici, contrairement aux cas dégénérés. Avec un
  // float, la largeur du texte vaut « conteneur moins image » : brider le
  // conteneur à la mesure ne laisserait au texte que 62 % de 68ch, une
  // quarantaine de caractères. Le conteneur prend donc le puits de page, et
  // le texte enrobant retombe sur la mesure de lui-même (68rem × 62 % ≈ 68ch).
  // La mesure n'est pas imposée au bloc : elle est le résultat de sa géométrie.
  return (
    <div className="akfc-float-scope">""")

# ── 2/3 aperçu : même largeur, et l'état de résolution toujours annoncé ───
edit(PREVIEW, """  return (
    <div className="akfc-float-scope akfc-measure-block">""",
"""  return (
    <div className="akfc-float-scope">
      {!media && resolution !== "idle" && (
        <p className="mb-2 text-xs text-muted-foreground">
          {resolution === "loading"
            ? "Chargement du média…"
            : resolution === "missing"
              ? "Média sélectionné introuvable (supprimé, en attente, ou administrateur sans avatar)."
              : "Échec du chargement du média."}
        </p>
      )}""")

# ── 3/3 seuil de repli : 34rem frôlait la largeur nominale du bloc ────────
edit(GLOBALS, """/* Repli mobile : sous 34rem, l'enrobage laisserait trop peu de place au
   texte. L'image passe pleine largeur au-dessus. */
@container (max-width: 34rem) {""",
"""/* Repli mobile : sous 26rem, l'enrobage laisserait trop peu de place au
   texte. L'image passe pleine largeur au-dessus.
   
   Le seuil était à 34rem, ce qui frôlait la largeur nominale du bloc quand
   son conteneur était encore bridé à la mesure (68ch ≈ 34–36rem) : la
   bascule se déclenchait donc presque toujours, et l'enrobage ne se voyait
   jamais. Il ne doit attraper que les contextes vraiment étroits — téléphone,
   barre latérale. */
@container (max-width: 26rem) {""")
PY

echo "✓ conteneur du float élargi au puits, seuil de repli abaissé, aperçu bavard"

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
git commit -m "fix(float-text): l'enrobage ne s'engageait presque jamais

Le conteneur du float etait enveloppe dans akfc-measure-block, qui
plafonne a --akfc-measure (68ch, soit 34 a 36rem), pendant que le repli
mobile se declenchait a 34rem : le conteneur etait pose pile sur son
propre seuil de bascule.

Le raisonnement juste : avec un float, la largeur du texte vaut
« conteneur moins image ». Si le conteneur EST la mesure, le texte n'en
recoit que 62 %, une quarantaine de caracteres. Le conteneur prend donc
le puits de page et le texte enrobant retombe sur la mesure de lui-meme
(68rem x 62 % ~ 68ch). Les cas degeneres gardent la mesure : un bloc
sans image est du texte ordinaire.

Le seuil de repli descend a 26rem — il ne doit attraper que les
contextes vraiment etroits.

L'apercu, lui, ne signalait l'etat de la resolution que si le bloc
etait entierement vide : avec du texte present et l'image non resolue,
il affichait le texte sans un mot. Il annonce desormais son etat quoi
qu'il arrive."

echo "✓ commité"
git log -1 --oneline