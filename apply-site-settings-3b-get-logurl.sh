#!/usr/bin/env bash
#
# AKFC — Réglages du site (CMS) incrément 3b : logoUrl dans le get public.
#
# Le Header est un composant CLIENT rendu aussi pour les visiteurs anonymes. Il
# ne peut pas appeler `media.resolveByIds` (protégé + filtre `published`). On
# enrichit donc le `siteSettings.get` PUBLIC pour qu'il renvoie déjà l'URL
# publique du logo, résolue côté serveur.
#
# Résolution : on lit l'asset référencé par `logoAssetId` (SANS exiger
# `published` — le choisir comme logo l'a rendu public, cf. la garde 3a) et on
# construit l'URL via `buildMediaProxyUrl(asset, "public")`
# → /api/media/public/by-public-id/<publicId>?variant=large.
#
# NB : le picker ne rend que des images Cloudinary (publicId non null) → route
# by-public-id, celle qu'on a étendue en 3a. Un asset R2 en logo (cas qui ne
# peut pas survenir via le picker) passerait par la route r2 publique, non
# étendue — mentionné pour mémoire.
#
# Sortie de `get` : `null` si aucune ligne, sinon la ligne + `logoUrl` (null si
# pas de logo). Ajout PUREMENT additif — la page de config (inc. 2) lit des
# champs nommés, un champ en plus ne la casse pas.
#
# Prérequis : incréments 1, 2, 3a, durcissement admin. Router seul. Typecheck backend.
#
# Usage : bash apply-site-settings-3b-get-logourl.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-3b-get-logourl.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/siteSettings/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable (incrément 1 pas appliqué ?)." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "buildMediaProxyUrl" in s:
    print("déjà présent (logoUrl dans get)"); sys.exit(0)

# 1. import du constructeur d'URL
anchor_imp = 'import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";\n'
assert s.count(anchor_imp) == 1, "ancre import @backend/trpc/core introuvable/multiple"
s = s.replace(
    anchor_imp,
    anchor_imp
    + 'import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";\n',
)

# 2. get enrichi
old_get = (
    "  get: publicProcedure.query(({ ctx }) =>\n"
    "    ctx.prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } }),\n"
    "  ),\n"
)
assert s.count(old_get) == 1, "ancre get introuvable/multiple"
new_get = (
    "  get: publicProcedure.query(async ({ ctx }) => {\n"
    "    const settings = await ctx.prisma.siteSettings.findUnique({\n"
    "      where: { id: SETTINGS_ID },\n"
    "    });\n"
    "    if (!settings) return null;\n"
    "\n"
    "    // URL publique du logo, résolue serveur (le Header client la consomme).\n"
    "    // Pas de filtre `published` : le logo est public par désignation (garde 3a).\n"
    "    let logoUrl: string | null = null;\n"
    "    if (settings.logoAssetId) {\n"
    "      const asset = await ctx.prisma.mediaAsset.findUnique({\n"
    "        where: { id: settings.logoAssetId },\n"
    "        select: { publicId: true, fullPath: true },\n"
    "      });\n"
    '      if (asset) logoUrl = buildMediaProxyUrl(asset, "public");\n'
    "    }\n"
    "\n"
    "    return { ...settings, logoUrl };\n"
    "  }),\n"
)
s = s.replace(old_get, new_get)

p.write_text(s, encoding="utf-8")
print("get enrichi (logoUrl public)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(settings): get public renvoie logoUrl (URL publique du logo résolue serveur)" \
  && echo "commit $(git rev-parse --short HEAD)"