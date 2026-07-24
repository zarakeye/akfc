#!/usr/bin/env bash
#
# step_lab_independent_scroll.sh
#
# Deux colonnes, deux barres de défilement : on peut descendre dans l'aperçu
# jusqu'à l'écart entre blocs tout en gardant le curseur correspondant sous
# la main.
#
# ─── La règle du projet, respectée ─────────────────────────────────────────
#
# Le layout du tableau de bord pose le principe noir sur blanc : le `<main>`
# défile par défaut, et une page qui gère son PROPRE défilement se borne
# elle-même (`h-full overflow-hidden`), comme le fait la bibliothèque. Le
# laboratoire devient donc un second cas spécial, et se borne de la même
# façon plutôt que d'inventer un mécanisme parallèle.
#
# ─── Le piège qui fait échouer ce genre de mise en page ────────────────────
#
# Un élément de grille ou de flex a `min-height: auto` par défaut : il refuse
# de descendre sous la hauteur de son contenu. Sans `min-h-0`, les deux
# colonnes grandiraient jusqu'à contenir tout leur contenu, `overflow-y-auto`
# n'aurait jamais rien à faire défiler, et c'est la page entière qui
# s'allongerait — exactement le comportement qu'on cherche à supprimer.
# `min-h-0` est posé à CHAQUE niveau de la chaîne, sinon le premier maillon
# manquant suffit à tout annuler.
#
# ─── Seulement à partir de `lg` ────────────────────────────────────────────
#
# Sous 1024px, la grille est déjà en une seule colonne : deux zones de
# défilement empilées dans une hauteur bornée donneraient deux lucarnes de
# quelques centimètres. En dessous du seuil, la page défile normalement,
# d'un bloc. Le confinement ne s'active que là où il y a deux colonnes à
# tenir côte à côte.
#
# Usage :
#   bash step_lab_independent_scroll.sh
#   AKFC_APPLY_ONLY=1 bash step_lab_independent_scroll.sh
#
set -euo pipefail

PAGE="apps/web/src/app/(admin)/dashboard/design-lab/page.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$PAGE" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "lg:overflow-y-auto" "$LAB"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAB) — rien à faire"
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

PAGE = "apps/web/src/app/(admin)/dashboard/design-lab/page.tsx"
LAB  = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/3 : la page se borne, l'en-tête ne défile pas ──────────────────────
edit(PAGE, """    <div className="space-y-4 p-4">
      <header className="space-y-1">""",
"""    // Le layout du tableau de bord pose la règle : le <main> défile par
    // défaut, et une page qui gère son propre défilement se borne elle-même
    // (`h-full overflow-hidden`), comme la bibliothèque. Le laboratoire est
    // ce cas-là — mais seulement à partir de `lg`, où il y a deux colonnes à
    // tenir côte à côte. En dessous, la page défile normalement.
    <div className="flex flex-col gap-4 p-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <header className="shrink-0 space-y-1">""")

edit(PAGE, """      <BlockStyleLab />""",
"""      {/* `min-h-0` : sans lui, un enfant de flex refuse de descendre sous la
          hauteur de son contenu et le confinement ne prendrait jamais. */}
      <div className="lg:min-h-0 lg:flex-1">
        <BlockStyleLab />
      </div>""")

# ── 2/3 : la colonne des réglages défile seule ───────────────────────────
edit(LAB, """    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">""",
"""    <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[280px_1fr]">""")

edit(LAB, """      <aside className="space-y-4 rounded-md border border-border p-4">""",
"""      {/* `min-h-0` puis `overflow-y-auto` : le premier autorise la colonne à
          être plus courte que son contenu, le second lui donne sa barre.
          L'un sans l'autre ne produit rien. */}
      <aside className="space-y-4 rounded-md border border-border p-4 lg:min-h-0 lg:overflow-y-auto">""")

# ── 3/3 : la colonne d'aperçu défile seule (DERNIER fichier écrit) ───────
edit(LAB, """      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Largeur d&apos;aperçu</span>""",
"""      {/* Colonne d'aperçu : le sélecteur de largeur reste fixe en tête
          (`shrink-0`), seul le contenu défile — sinon il disparaîtrait dès
          qu'on descend, alors qu'on le compare en permanence. */}
      <div className="flex flex-col gap-3 lg:min-h-0">
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <span className="text-muted-foreground">Largeur d&apos;aperçu</span>""")

edit(LAB, """        <div
          style={{ ...styleOverrides, maxWidth: previewWidth }}
          className="border-l border-dashed border-border pl-3 transition-[max-width]"
        >""",
"""        <div
          style={{ ...styleOverrides, maxWidth: previewWidth }}
          className="border-l border-dashed border-border pl-3 transition-[max-width] lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
        >""")
PY

echo "✓ 5 substitutions appliquées"

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
git commit -m "feat(design-lab): defilement independant des deux colonnes

Descendre dans l'apercu jusqu'a l'ecart entre blocs tout en gardant le
curseur correspondant sous la main.

La page se borne elle-meme (h-full overflow-hidden), suivant la regle
posee par le layout du tableau de bord : le <main> defile par defaut,
un cas special se borne -- comme le fait deja la bibliotheque.

min-h-0 a chaque niveau de la chaine : un enfant de grille ou de flex
a min-height auto et refuse de descendre sous la hauteur de son
contenu, ce qui empecherait overflow-y-auto d'avoir quoi que ce soit a
faire defiler.

Actif a partir de lg seulement : sous 1024px la grille est deja en une
colonne, et deux zones bornees empilees donneraient deux lucarnes."

echo "✓ commité"
git log -1 --oneline