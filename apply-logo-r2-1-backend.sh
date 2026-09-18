#!/usr/bin/env bash
# AKFC — Logo R2 hors finder (Volet 1, incrément 1 : backend).
#  - schéma + migration : SiteSettings.logoKey String?
#  - service putSiteLogo : PutObject → system/logo.svg (R2)
#  - mutation siteSettings.uploadLogo (admin, base64, svg ≤ 512 Ko)
#  - get : logoUrl résolu depuis logoKey (/api/media/site-logo?v=…), fallback logoAssetId
#  - route app/api/media/site-logo : presign GetObject → 302 (calque route publique R2)
# Usage : bash apply-logo-r2-1-backend.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/siteSettings/router.ts"
SVC_DIR="packages/backend/src/modules/siteSettings/services"
SVC="$SVC_DIR/siteLogo.service.ts"
ROUTE_DIR="apps/web/src/app/api/media/site-logo"
ROUTE="$ROUTE_DIR/route.ts"
MIG_DIR="prisma/migrations/20260918000000_sitesettings_logokey"
for f in "$SCHEMA" "$ROUTER"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
mkdir -p "$SVC_DIR" "$ROUTE_DIR" "$MIG_DIR"

# ---------- 1. schéma : logoKey ----------
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "logoKey" in s:
    print("  — schema : logoKey déjà présent")
else:
    anchor = '  logoAssetId   String?'
    assert s.count(anchor) == 1, f"ancre logoAssetId ×{s.count(anchor)}"
    add = (anchor
        + '\n  /// Clé R2 RÉSERVÉE du logo (ex. "system/logo.svg"), hors arborescence\n'
        + '  /// finder : le logo n\'est PAS un MediaAsset. Servi via /api/media/site-logo.\n'
        + '  logoKey       String?')
    p.write_text(s.replace(anchor, add), encoding="utf-8")
    print("  ok  schema : logoKey ajouté")
PY

# ---------- migration SQL ----------
cat > "$MIG_DIR/migration.sql" <<'SQL'
-- SiteSettings : clé R2 réservée du logo (hors finder).
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "logoKey" TEXT;
SQL
echo "  ok  migration $MIG_DIR/migration.sql"

# ---------- 2. service putSiteLogo ----------
cat > "$SVC" <<'TS'
import { PutObjectCommand } from "@aws-sdk/client-s3";

import {
  getR2Bucket,
  getR2Client,
} from "@backend/modules/storage/adapters/r2/client";

/**
 * Clé R2 RÉSERVÉE du logo du site. Hors préfixe applicatif (`AKFC/…`) donc
 * hors monde finder ; jamais un MediaAsset. Écrasée à chaque upload → URL
 * stable, invalidation par `?v=updatedAt` côté consommateur.
 */
export const SITE_LOGO_KEY = "system/logo.svg";

/** Écrit (écrase) le logo du site dans R2. */
export async function putSiteLogo(
  body: Buffer,
  contentType: string,
): Promise<void> {
  const s3 = getR2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: SITE_LOGO_KEY,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}
TS
echo "  ok  $SVC"

# ---------- 3+4. router : import + uploadLogo + logoUrl depuis logoKey ----------
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "uploadLogo" in s:
    print("  — router : uploadLogo déjà présent"); sys.exit(0)

# import du service
imp = 'import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";'
assert s.count(imp) == 1, "ancre import buildMediaProxyUrl"
s = s.replace(imp, imp + '\nimport {\n  putSiteLogo,\n  SITE_LOGO_KEY,\n} from "@backend/modules/siteSettings/services/siteLogo.service";')

# résolution logoUrl : logoKey prioritaire, fallback logoAssetId
old_get = '''    let logoUrl: string | null = null;
    if (settings.logoAssetId) {
      const asset = await ctx.prisma.mediaAsset.findUnique({
        where: { id: settings.logoAssetId },
        select: { publicId: true, fullPath: true },
      });
      if (asset) logoUrl = buildMediaProxyUrl(asset, "public");
    }

    return { ...settings, logoUrl };'''
new_get = '''    let logoUrl: string | null = null;
    if (settings.logoKey) {
      // Logo R2 hors finder : servi par la route dédiée, invalidé par ?v=.
      const v = settings.updatedAt.getTime();
      logoUrl = `/api/media/site-logo?v=${v}`;
    } else if (settings.logoAssetId) {
      // Rétro-compat : ancien logo choisi au picker (MediaAsset).
      const asset = await ctx.prisma.mediaAsset.findUnique({
        where: { id: settings.logoAssetId },
        select: { publicId: true, fullPath: true },
      });
      if (asset) logoUrl = buildMediaProxyUrl(asset, "public");
    }

    return { ...settings, logoUrl };'''
assert s.count(old_get) == 1, "ancre résolution logoUrl"
s = s.replace(old_get, new_get)

# mutation uploadLogo, insérée avant la fermeture du router
mut = '''
  /**
   * Upload du logo du site (admin). SVG ≤ 512 Ko, envoyé en base64 (petit
   * fichier, pas de flux presign). Écrit R2 (system/logo.svg, hors finder) puis
   * mémorise logoKey. Le logo n'est JAMAIS un MediaAsset.
   */
  uploadLogo: protectedProcedure
    .input(
      z.object({
        dataBase64: z.string().min(1),
        mimeType: z.literal("image/svg+xml"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx);
      const buf = Buffer.from(input.dataBase64, "base64");
      if (buf.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier vide." });
      }
      if (buf.length > 512 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Logo trop volumineux (max 512 Ko).",
        });
      }
      await putSiteLogo(buf, input.mimeType);
      await ctx.prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        create: { id: SETTINGS_ID, logoKey: SITE_LOGO_KEY },
        update: { logoKey: SITE_LOGO_KEY },
      });
      return { success: true };
    }),
});'''
assert s.rstrip().endswith("});"), "fin de router inattendue"
s = s.rstrip()[:-3].rstrip() + ",\n" + mut.lstrip("\n") + "\n"
# ci-dessus retire le "});" final puis ré-ajoute la mutation + "});"
p.write_text(s, encoding="utf-8")
print("  ok  router : uploadLogo + logoUrl depuis logoKey")
PY

# ---------- 5. route /api/media/site-logo ----------
cat > "$ROUTE" <<'TS'
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

import {
  getR2Bucket,
  getR2Client,
} from "@backend/modules/storage/adapters/r2/client";
import { SITE_LOGO_KEY } from "@backend/modules/siteSettings/services/siteLogo.service";

/**
 * Route publique du logo du site. Le logo vit dans une clé R2 réservée
 * (system/logo.svg), hors arborescence finder et sans MediaAsset. On presign
 * un GET (comme la route publique R2) et on redirige en 302 (zero-egress).
 * L'invalidation de cache se fait par le `?v=` ajouté par siteSettings.get.
 */
const EXPIRY_SECONDS = 30 * 60;

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2Bucket(),
      Key: SITE_LOGO_KEY,
    });
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: EXPIRY_SECONDS,
    });
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    });
  } catch (err) {
    console.error("[api/media/site-logo] presign failed", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
TS
echo "  ok  $ROUTE"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "prisma generate…"; pnpm --filter @backend prisma generate > /tmp/akfc_gen.log 2>&1 || npx prisma generate --schema "$SCHEMA" > /tmp/akfc_gen.log 2>&1 || { echo "⚠ prisma generate a échoué :"; tail -5 /tmp/akfc_gen.log; }
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(site-settings): logo R2 hors finder — logoKey + uploadLogo + route /api/media/site-logo" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }