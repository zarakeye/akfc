#!/usr/bin/env bash
#
# step_accept_svg.sh
#
# Le SVG rejoint les types d'images téléversables.
#
# ─── Ce qu'il n'y avait PAS à faire ────────────────────────────────────────
#
# Le routage de stockage accepte déjà le SVG : `pickBackend` envoie tout
# `image/*` vers Cloudinary, et `pickBackendByExtension` liste `svg`
# explicitement. Le filtre du picker (`isMediaNode`) le laisse passer par la
# branche mimeType, et `deriveMediaKind` le classe en « image ».
#
# Seul le formulaire de téléversement le refusait. Deux lignes suffisent donc
# à ouvrir la porte — mais elles ont deux conséquences qui, elles, ne sont pas
# évidentes.
#
# ─── Conséquence 1 : un SVG n'est pas une image inerte ─────────────────────
#
# C'est du XML, et il peut porter du `<script>`. Affiché par une balise
# `<img>`, il est sans danger : ce contexte n'exécute rien. Mais OUVERT
# DIRECTEMENT dans un onglet — coller l'URL du proxy dans la barre
# d'adresse — il s'exécute dans NOTRE origine, avec accès aux cookies de
# session.
#
# Le téléversement étant réservé aux administrateurs, la surface est étroite :
# il faudrait qu'un admin dépose un SVG piégé et en fasse ouvrir l'URL à un
# autre. Étroite n'est pas nulle, et la parade coûte trois lignes.
#
# `Content-Security-Policy: sandbox` place le document en bac à sable quand on
# y navigue — plus de script — sans rien changer au rendu en `<img>`.
# `X-Content-Type-Options: nosniff` empêche par ailleurs le navigateur de
# deviner un type plus permissif que celui annoncé, ce qui vaut pour tous les
# médias et pas seulement les SVG.
#
# ─── Conséquence 2 : ton vecteur arrivera en bitmap ────────────────────────
#
# La variante `large` applique `width: 1200, crop: scale`. Or Cloudinary
# RASTÉRISE un SVG dès qu'une transformation lui est appliquée : ton fichier
# vectoriel sera livré en image matricielle de 1200 pixels de large.
#
# Pour la plupart des usages web c'est sans importance, et c'est même plus sûr
# — un bitmap ne porte aucun script. Mais si tu déposes un logo pour qu'il
# reste net à toutes les tailles, tu n'obtiendras pas ce que tu attends.
#
# Je ne change PAS ce comportement dans ce script, parce que servir le SVG
# sans transformation est un arbitrage qui t'appartient : on y gagne le
# vecteur, on y perd le redimensionnement automatique et on y ramène la
# question du script. Dis-le-moi et je le fais ensuite.
#
# Usage :
#   bash step_accept_svg.sh
#   AKFC_APPLY_ONLY=1 bash step_accept_svg.sh
#
set -euo pipefail

upload_form="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
proxy_route="apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts"
avatar_route="apps/web/src/app/api/media/public/avatar/[userId]/route.ts"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "Content-Security-Policy" "$avatar_route" 2>/dev/null; then
  echo "✓ déjà appliqué (durcissement SVG posé) — rien à faire"
  exit 0
fi

for f in "$upload_form" "$proxy_route" "$avatar_route"; do
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

upload_form  = "apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
proxy_route  = "apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts"
avatar_route = "apps/web/src/app/api/media/public/avatar/[userId]/route.ts"

# ── 1/4 types acceptés par le sélecteur de fichiers ───────────────────────
edit(upload_form, """  'image/gif': ['.gif'],
  // Vidéos (Cloudinary)""",
"""  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  // Vidéos (Cloudinary)""")

# ── 2/4 déduction du type depuis l'extension ─────────────────────────────
# Certains systèmes livrent les .svg sans type MIME, ou avec `text/xml` : sans
# cette entrée, le fichier basculerait sur R2 au lieu de Cloudinary.
edit(upload_form, """  gif: 'image/gif',
  // Vidéos""",
"""  gif: 'image/gif',
  svg: 'image/svg+xml',
  // Vidéos""")

# ── 3/4 durcissement du proxy média ──────────────────────────────────────
edit(proxy_route, """function buildHeaders(res: Response, isFallback = false): HeadersInit {
  const contentType =
    res.headers.get(\"content-type\") ?? \"application/octet-stream\";

  return {
    \"Content-Type\": contentType,""",
"""function buildHeaders(res: Response, isFallback = false): HeadersInit {
  const contentType =
    res.headers.get(\"content-type\") ?? \"application/octet-stream\";

  // Un SVG n'est pas une image inerte : c'est du XML qui peut porter du
  // script. Rendu par une balise `<img>` il est sans danger — ce contexte
  // n'exécute rien — mais OUVERT DIRECTEMENT dans un onglet il s'exécuterait
  // dans notre origine, avec accès aux cookies de session.
  //
  // `sandbox` place le document en bac à sable à la navigation, ce qui
  // neutralise le script, et ne change rien au rendu en `<img>`.
  const isSvg = contentType.includes(\"image/svg\");

  return {
    \"Content-Type\": contentType,

    // Empêche le navigateur de deviner un type plus permissif que celui
    // annoncé — utile pour tous les médias, pas seulement les SVG.
    \"X-Content-Type-Options\": \"nosniff\",
    ...(isSvg ? { \"Content-Security-Policy\": \"sandbox\" } : {}),""")

# ── 4/4 même durcissement sur la route d'avatar (DERNIER fichier écrit) ──
# Un avatar peut être un SVG comme un autre média : la route publique doit
# être protégée de la même façon, sans quoi elle serait la porte laissée
# ouverte.
edit(avatar_route, """    return new Response(asset.body, {
      status: 200,
      headers: {
        \"Content-Type\":
          asset.headers.get(\"content-type\") ?? \"application/octet-stream\",""",
"""    const contentType =
      asset.headers.get(\"content-type\") ?? \"application/octet-stream\";
    const isSvg = contentType.includes(\"image/svg\");

    return new Response(asset.body, {
      status: 200,
      headers: {
        \"Content-Type\": contentType,

        // Même durcissement que le proxy général : un avatar peut être un
        // SVG, et cette route est PUBLIQUE — ce serait la porte laissée
        // ouverte. Voir le commentaire de `buildHeaders` dans
        // `api/media/by-public-id`.
        \"X-Content-Type-Options\": \"nosniff\",
        ...(isSvg ? { \"Content-Security-Policy\": \"sandbox\" } : {}),""")
PY

echo "✓ SVG accepté, proxys durcis"

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
git commit -m "feat(library): accepter le SVG au televersement

Le routage acceptait deja le SVG : pickBackend envoie tout image/* vers
Cloudinary, pickBackendByExtension liste svg, isMediaNode le laisse
passer et deriveMediaKind le classe en image. Seul le formulaire le
refusait.

Deux consequences non evidentes, dont une traitee ici.

SECURITE : un SVG n'est pas une image inerte, c'est du XML qui peut
porter du script. Rendu par <img> il est sans danger, mais ouvert
directement dans un onglet il s'executerait dans notre origine, avec
acces aux cookies de session. Le televersement etant reserve aux
admins la surface est etroite, mais la parade coute trois lignes :
Content-Security-Policy: sandbox sur les reponses SVG des deux proxys,
ce qui neutralise le script a la navigation sans rien changer au rendu
en <img>. X-Content-Type-Options: nosniff est pose pour tous les
medias.

RASTERISATION (non traitee, arbitrage a rendre) : la variante large
applique width 1200 / crop scale, et Cloudinary rasterise un SVG des
qu'une transformation lui est appliquee. Un logo depose pour rester net
a toutes les tailles arrivera donc en bitmap. Servir le SVG sans
transformation gagnerait le vecteur mais perdrait le redimensionnement
automatique et ramenerait la question du script."

echo "✓ commité"
git log -1 --oneline