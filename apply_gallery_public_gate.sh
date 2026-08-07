#!/usr/bin/env bash
#
# AKFC — Étendre la garde des routes média publiques aux galeries/carousel.
#
# Pourquoi : la garde du chantier 1 exige `published + PageMediaReference`.
# Les galeries (et le home-carousel, galerie au slug réservé) ne créent
# jamais de PageMediaReference → toutes leurs images tombent en 404, publiées
# ou non, connecté ou non. Or une galerie EST une pose publique légitime.
#
# Correctif (sans migration) : un asset se sert publiquement s'il est
# `published` (« validé ») ET placé quelque part de public — référencé par une
# page OU membre d'une galerie dont `visibility = PUBLIC`. Les relations
# `MediaAsset.pageReferences` / `MediaAsset.galleryItems` et `Gallery.visibility`
# existent déjà. Une galerie PRIVATE reste exclue.
#
# Appliqué aux DEUX routes publiques : Cloudinary (by-public-id, clé publicId)
# et R2 (clé fullPath). Ancres sur le bloc de requête (uniques, sans traits).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-gallery-public-gate.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-gallery-public-gate.sh
#
set -euo pipefail

BYID="apps/web/src/app/api/media/public/by-public-id/[...publicId]/route.ts"
R2="apps/web/src/app/api/media/public/r2/[...path]/route.ts"

if [ ! -f "package.json" ] || [ ! -f "$BYID" ] || [ ! -f "$R2" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC (routes publiques attendues)." >&2
  exit 1
fi

python3 - "$BYID" "$R2" <<'PY'
import sys, pathlib

byid, r2 = sys.argv[1:3]
changed = []

# ─── Route Cloudinary publique (clé publicId, double quotes) ────────────────
p = pathlib.Path(byid)
s = p.read_text(encoding="utf-8")
if "galleryItems" in s:
    print("by-public-id déjà à jour")
else:
    OLD = '''    const reference = await prisma.pageMediaReference.findFirst({
      where: {
        mediaAsset: {
          publicId: id,
          status: "published",
        },
      },
      select: { id: true },
    });

    if (!reference) return new Response("Not found", { status: 404 });'''
    NEW = '''    const servable = await prisma.mediaAsset.findFirst({
      where: {
        publicId: id,
        status: "published",
        OR: [
          { pageReferences: { some: {} } },
          { galleryItems: { some: { gallery: { visibility: "PUBLIC" } } } },
        ],
      },
      select: { id: true },
    });

    if (!servable) return new Response("Not found", { status: 404 });'''
    assert s.count(OLD) == 1, "ancre by-public-id introuvable/multiple — abandon avant tout commit"
    s = s.replace(OLD, NEW)
    # Rafraîchit la phrase d'en-tête du commentaire de garde (non bloquant).
    stale = "published + référencé par au moins une page"
    if s.count(stale) == 1:
        s = s.replace(stale, "published + placé (page OU galerie publique)")
    p.write_text(s, encoding="utf-8")
    changed.append("by-public-id")

# ─── Route R2 publique (clé fullPath, single quotes) ────────────────────────
p2 = pathlib.Path(r2)
s2 = p2.read_text(encoding="utf-8")
if "galleryItems" in s2:
    print("r2 déjà à jour")
else:
    OLD2 = """  const reference = await prisma.pageMediaReference.findFirst({
    where: {
      mediaAsset: {
        fullPath: r2Key,
        status: 'published',
      },
    },
    select: { id: true },
  });

  if (!reference) {
    return new NextResponse('Not found', { status: 404 });
  }"""
    NEW2 = """  const servable = await prisma.mediaAsset.findFirst({
    where: {
      fullPath: r2Key,
      status: 'published',
      OR: [
        { pageReferences: { some: {} } },
        { galleryItems: { some: { gallery: { visibility: 'PUBLIC' } } } },
      ],
    },
    select: { id: true },
  });

  if (!servable) {
    return new NextResponse('Not found', { status: 404 });
  }"""
    assert s2.count(OLD2) == 1, "ancre r2 introuvable/multiple — abandon avant tout commit"
    s2 = s2.replace(OLD2, NEW2)
    stale2 = "asset published + référencé par au moins une page"
    if s2.count(stale2) == 1:
        s2 = s2.replace(stale2, "asset published + placé (page OU galerie publique)")
    p2.write_text(s2, encoding="utf-8")
    changed.append("r2")

if not changed:
    print("déjà appliqué — rien à faire")
else:
    print("patch OK:", ", ".join(changed))
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "fix(media): garde publique — servir aussi les images de galerie publique (galerie/carousel), pas seulement les images référencées par une page" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi