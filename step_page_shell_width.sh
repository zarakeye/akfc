#!/usr/bin/env bash
#
# step_page_shell_width.sh
#
# La vraie cause des marges : ce n'était aucune des variables que je réglais.
#
# Les trois pages de contenu — discipline, stage, événement — ouvrent sur :
#
#     <article className="mx-auto max-w-3xl px-6 py-12">
#
# `max-w-3xl` vaut 768px, moins 48px de rembourrage : 720px de contenu,
# centrés. Sur un écran de 1920px, cela laisse 600px de blanc de chaque côté
# — le tiers médian, exactement ce qui se voit à l'écran. Sur un très grand
# écran, la proportion empire encore.
#
# Ce plafond est POSÉ PAR LA PAGE, en amont du builder. Il bride le rendu
# avant que `--akfc-page-max` n'ait la moindre occasion de s'appliquer, et
# c'est pourquoi le réglage précédent n'a rien pu y faire : je réglais une
# largeur qui n'était jamais la contrainte mordante.
#
# Les pages adoptent donc `akfc-page`, le puits réglable (68rem par défaut,
# soit 1088px), avec sa marge d'écran fluide — d'où la disparition de `px-6`,
# qui ferait double emploi.
#
# ⚠️ Élargir le puits n'allonge PAS les lignes : `.akfc-prose` reste plafonné
# à la justification (68ch) et centré. Le texte garde sa mesure ; ce sont les
# blocs à deux colonnes, les galeries et les images qui gagnent la place.
# C'est le partage attendu — le texte se lit, le média respire.
#
# Les listes (`/stages`, `/events`, en `max-w-4xl`) et les pages de profil
# ne sont pas touchées : ce ne sont pas des pages de contenu construites au
# builder, et leur largeur relève d'un autre arbitrage.
#
# Usage :
#   bash step_page_shell_width.sh
#   AKFC_APPLY_ONLY=1 bash step_page_shell_width.sh
#
set -euo pipefail

P="apps/web/src/app/(public)"
DISC="$P/disciplines/[slug]/page.tsx"
STAGE="$P/stages/[slug]/page.tsx"
EVENT="$P/events/[slug]/page.tsx"
SHELL_="apps/web/src/features/admin/common/components/PresentationShell.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$DISC" "$STAGE" "$EVENT" "$SHELL_"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "akfc-page" apps/web/src/app/globals.css || {
  echo "✗ step_responsive_measure.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "akfc-page" "$SHELL_"; then
  echo "✓ déjà appliqué (marqueur présent dans $SHELL_) — rien à faire"
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
    print("  ~ %s" % path.split('/')[-2] + "/" + path.rsplit('/', 1)[-1])

P      = "apps/web/src/app/(public)"
DISC   = "%s/disciplines/[slug]/page.tsx" % P
STAGE  = "%s/stages/[slug]/page.tsx" % P
EVENT  = "%s/events/[slug]/page.tsx" % P
SHELL_ = "apps/web/src/features/admin/common/components/PresentationShell.tsx"

# Le commentaire est une ligne `//` AVANT `return (`, pas un `{/* */}`
# après : entre `return (` et l'élément racine, les accolades ouvrent une
# expression et non un commentaire — le parseur y lit un littéral objet
# suivi d'un élément orphelin.
OLD = '''  return (
    <article className="mx-auto max-w-3xl px-6 py-12">'''
NEW = '''  // `akfc-page` remplace `mx-auto max-w-3xl px-6` : ce plafond de 768px
  // bridait le rendu du builder AVANT que ses propres variables aient la
  // moindre prise, et laissait le contenu dans le tiers médian d'un grand
  // écran. Le puits est désormais réglable (68rem par défaut) et porte sa
  // marge d'écran fluide, d'où la disparition de `px-6`.
  //
  // Le texte, lui, reste plafonné à sa justification par `.akfc-prose` :
  // élargir le puits profite aux médias, pas à la longueur des lignes.
  return (
    <article className="akfc-page py-12">'''

# ── 1/4 → 3/4 : les trois pages de contenu ────────────────────────────────
for path in (DISC, STAGE, EVENT):
    edit(path, OLD, NEW)

# ── 4/4 : le shell d'aperçu admin (DERNIER fichier écrit) ─────────────────
# Il n'imposait aucune largeur : le rendu prenait toute la zone du tableau
# de bord. On l'aligne sur le même puits, pour que l'admin voie la page à la
# largeur qu'elle aura vraiment.
edit(SHELL_, """  return (
    <div>
      <Link
        href={listHref}""",
"""  return (
    // Même puits que les pages publiques : sans lui, l'aperçu admin
    // s'étalait sur toute la zone du tableau de bord et ne montrait pas la
    // largeur que la page aurait en ligne.
    <div className="akfc-page">
      <Link
        href={listHref}""")
PY

echo "✓ 4 substitutions appliquées"

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
git commit -m "fix(pages): les pages de contenu adoptent le puits reglable

Les pages discipline, stage et evenement ouvraient sur
mx-auto max-w-3xl px-6, soit 720px de contenu centres : sur un ecran
de 1920px, le contenu occupait le tiers median.

Ce plafond etait pose PAR LA PAGE, en amont du builder : il bridait le
rendu avant que --akfc-page-max ait la moindre prise, et c'est pourquoi
les reglages precedents n'y pouvaient rien.

Elargir le puits n'allonge pas les lignes : .akfc-prose reste plafonne
a la justification et centre. Ce sont les blocs a deux colonnes, les
galeries et les images qui gagnent la place.

PresentationShell adopte le meme puits, pour que l'apercu admin montre
la largeur reelle de la page."

echo "✓ commité"
git log -1 --oneline