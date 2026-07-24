#!/usr/bin/env bash
#
# fix_site_style_hoisting.sh
#
# Réparation de MON erreur dans step_site_style_persist.sh.
#
# J'ai posé le `<style>` en enfant direct de `<html>`. C'est invalide : en
# HTML, seuls `<head>` et `<body>` peuvent être enfants de `<html>`, et le
# navigateur déplace la balise au parsing — d'où l'écart avec le rendu
# serveur, et l'erreur d'hydratation.
#
# React 19 nomme lui-même le remède dans son message : une balise `<style>`
# munie de `href` et `precedence` est HISSÉE dans le `<head>` par React,
# où qu'on la rende, et dédupliquée sur la valeur de `href`. C'est la voie
# prévue pour exactement ce besoin — injecter une feuille calculée au rendu
# serveur.
#
# Deux ajustements viennent avec :
#
#   - le CSS passe en ENFANT plutôt qu'en `dangerouslySetInnerHTML`. React
#     n'accepte pas `dangerouslySetInnerHTML` sur une balise hissée, et
#     l'échappement d'un nœud texte ne gêne pas du CSS.
#
#   - la balise se rend depuis l'intérieur de `<body>`. React la hisse de
#     toute façon ; mais si le hissage venait à ne pas s'appliquer — rendu
#     hors document, portail, version future — elle resterait à un endroit
#     valide au lieu de casser l'arbre.
#
# ⚠️ L'ORDRE d'insertion n'a aucune importance ici, et c'était voulu dès le
# départ : la surcharge l'emporte par SPÉCIFICITÉ (`html:root`, 0,0,2 contre
# 0,0,1 pour le `:root` de globals.css). Un correctif qui aurait dépendu de
# l'ordre serait tombé sur cette contrainte.
#
# Usage :
#   bash fix_site_style_hoisting.sh
#   AKFC_APPLY_ONLY=1 bash fix_site_style_hoisting.sh
#
set -euo pipefail

LAYOUT="apps/web/src/app/layout.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$LAYOUT" ] || { echo "✗ introuvable : $LAYOUT"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q 'precedence=' "$LAYOUT"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAYOUT) — rien à faire"
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

LAYOUT = "apps/web/src/app/layout.tsx"

edit(LAYOUT, """    <html lang="fr">
      {styleOverride && (
        <style
          id="akfc-site-style"
          dangerouslySetInnerHTML={{ __html: styleOverride }}
        />
      )}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>""",
"""    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*
          `href` + `precedence` : React 19 HISSE cette balise dans le
          `<head>` et la déduplique sur `href`. C'est la voie prévue pour
          injecter une feuille calculée au rendu serveur.

          Rendue depuis `<body>` et non depuis `<html>` : seuls `<head>` et
          `<body>` peuvent être enfants de `<html>`, et le navigateur
          déplaçait la balise au parsing — d'où l'erreur d'hydratation. React
          la hisse de toute façon ; en cas de non-hissage, elle reste ici à
          un endroit valide.

          Le CSS passe en ENFANT : React refuse `dangerouslySetInnerHTML` sur
          une balise hissée, et un nœud texte convient à du CSS.

          L'ORDRE d'insertion est indifférent — la surcharge l'emporte par
          spécificité (`html:root`, 0,0,2 contre 0,0,1), pas par position.
        */}
        {styleOverride && (
          <style href="akfc-site-style" precedence="high">
            {styleOverride}
          </style>
        )}""")
PY

echo "✓ 1 substitution appliquée"

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
git commit -m "fix(layout): la surcharge de style est hissee par React, plus enfant de <html>

Un <style> en enfant direct de <html> est invalide : le navigateur le
deplace au parsing, d'ou l'ecart avec le rendu serveur et l'erreur
d'hydratation.

href + precedence : React 19 hisse la balise dans le <head> et la
deduplique. Le CSS passe en enfant, dangerouslySetInnerHTML n'etant
pas accepte sur une balise hissee.

L'ordre d'insertion reste indifferent : la surcharge gagne par
specificite (html:root), pas par position."

echo "✓ commité"
git log -1 --oneline