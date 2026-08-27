#!/usr/bin/env bash
#
# AKFC — Réglages du site (CMS) incrément 3a : le logo servi publiquement.
#
# PROBLÈME : le proxy image PUBLIC (`/api/media/public/by-public-id/…`) ne sert
# un asset que s'il est `published` ET placé (référence de page OU galerie
# publique) — doctrine « deux gestes intentionnels ». Un logo choisi dans les
# réglages n'est ni l'un ni l'autre → il tomberait en 404 pour les visiteurs
# anonymes.
#
# FIX (ADDITIF, la garde existante n'est PAS modifiée) : on garde la requête
# d'origine telle quelle ; si elle échoue, on ajoute UN repli — l'asset est
# servable s'il est le logo courant (`SiteSettings.logoAssetId`). Indépendant de
# published/placé (choisir un logo EST l'acte de publication), et LUI SEUL :
# changer ou retirer le logo révoque aussitôt l'accès. Aucun autre asset ne
# devient servable ; le chemin commun (images de page/galerie) garde sa requête
# unique inchangée — le repli ne coûte une requête de plus que sur un échec.
#
# Prérequis : incréments 1-2. Un seul fichier édité. Typecheck web.
#
# Usage : bash apply-site-settings-3a-logo-gate.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-3a-logo-gate.sh   (clone)
#
set -euo pipefail

ROUTE="apps/web/src/app/api/media/public/by-public-id/[...publicId]/route.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTE" ]       || { echo "ERREUR: $ROUTE introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$ROUTE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "logoAssetId" in s:
    print("déjà présent (repli logo)"); sys.exit(0)

# 1. const → let (pour pouvoir réaffecter dans le repli)
old_decl = "    const servable = await prisma.mediaAsset.findFirst({"
assert s.count(old_decl) == 1, "ancre 'const servable' introuvable/multiple"
s = s.replace(old_decl, "    let servable = await prisma.mediaAsset.findFirst({")

# 2. repli logo, inséré AVANT le `if (!servable) return 404`
anchor = '    if (!servable) return new Response("Not found", { status: 404 });'
assert s.count(anchor) == 1, "ancre 'if (!servable)' introuvable/multiple"
fallback = (
    "    // ─── Repli : le LOGO DU SITE ──────────────────────────────────────────\n"
    "    // Pas servable par la voie normale (published + placé). Reste un cas\n"
    "    // public par nature : le logo choisi par un admin dans les réglages. On\n"
    "    // l'autorise indépendamment de published/placé — le choisir EST l'acte de\n"
    "    // publication — et LUI SEUL : changer/retirer le logo révoque l'accès.\n"
    "    if (!servable) {\n"
    "      const settings = await prisma.siteSettings.findUnique({\n"
    '        where: { id: "site" },\n'
    "        select: { logoAssetId: true },\n"
    "      });\n"
    "      if (settings?.logoAssetId) {\n"
    "        servable = await prisma.mediaAsset.findFirst({\n"
    "          where: { publicId: id, id: settings.logoAssetId },\n"
    "          select: { id: true },\n"
    "        });\n"
    "      }\n"
    "    }\n"
    "\n"
)
s = s.replace(anchor, fallback + anchor)

p.write_text(s, encoding="utf-8")
print("garde publique étendue (repli logo)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(settings): sert le logo du site via le proxy public (repli additif, sans toucher la garde existante)" \
  && echo "commit $(git rev-parse --short HEAD)"