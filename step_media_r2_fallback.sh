#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# PROXY MÉDIA — deux correctifs :
#
#   1) FALLBACK R2. Les fichiers stockés dans R2 (PDF, documents…) n'étaient
#      JAMAIS servis : `/api/media/by-public-id/…` n'interroge que Cloudinary,
#      épuise ses 3 resource_types, puis renvoie son IMAGE DE SECOURS. D'où le
#      placeholder sur tout PDF, en grid comme en sidebar. On tente désormais
#      R2 (même clé que le chemin) avant de rendre le fallback.
#
#   2) CONTRÔLE DE SESSION. La route servait des assets `authenticated`
#      (y compris des documents personnels) SANS vérifier la session, alors
#      que la route R2 équivalente l'exige. On aligne : 401 sans session.
#
# ⚠️ À VÉRIFIER APRÈS APPLICATION : la page (public)/profil affiche des
#    avatars via ce proxy. Si elle est accessible sans être connecté, les
#    avatars y passeront en 401 — dis-le-moi, on ajustera (les avatars sont
#    peu sensibles et peuvent être exemptés).
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTE="apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts"
test -f "$ROUTE" || { echo "✗ $ROUTE introuvable — lance depuis la racine."; exit 1; }

if grep -q "fetchR2Asset" "$ROUTE"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts")
src = p.read_text(encoding="utf-8")

# ── 1) imports ──────────────────────────────────────────────────────────────
OLD_IMP = 'import { NextRequest } from "next/server";'
NEW_IMP = '''import { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getR2Client,
  getR2Bucket,
} from "@backend/modules/storage/adapters/r2/client";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";'''
assert src.count(OLD_IMP) == 1, f"ancre import trouvée {src.count(OLD_IMP)}x"
src = src.replace(OLD_IMP, NEW_IMP)

# ── 2) contrôle de session en tête de GET ───────────────────────────────────
OLD_TRY = """  try {
    const { publicId } = await params;"""
NEW_TRY = """  try {
    // Cette route sert des assets `authenticated` (dont des documents
    // personnels). Elle exige donc une session, comme la route R2.
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { publicId } = await params;"""
assert src.count(OLD_TRY) == 1, f"ancre try trouvée {src.count(OLD_TRY)}x"
src = src.replace(OLD_TRY, NEW_TRY)

# ── 3) fallback R2 avant l'image de secours ─────────────────────────────────
OLD_FB = """    if (!asset || !asset.ok || !asset.body) {
      console.warn(`[media] asset not found \u2192 fallback`, { id, variant });"""
NEW_FB = """    if (!asset || !asset.ok || !asset.body) {
      // Pas chez Cloudinary : le binaire vit peut-\u00eatre dans R2 (documents,
      // PDF\u2026). Le chemin sert directement de cl\u00e9 d'objet.
      const r2 = await fetchR2Asset(id);
      if (r2 && r2.body) {
        return new Response(r2.body, {
          status: 200,
          headers: { ...buildHeaders(r2), "X-Asset-Source": "r2" },
        });
      }

      console.warn(`[media] asset not found \u2192 fallback`, { id, variant });"""
assert src.count(OLD_FB) == 1, f"ancre fallback trouvée {src.count(OLD_FB)}x"
src = src.replace(OLD_FB, NEW_FB)

# ── 4) helper fetchR2Asset ──────────────────────────────────────────────────
HELPER = '''

/**
 * Tente de r\u00e9cup\u00e9rer un binaire depuis R2. La cl\u00e9 d'objet est le chemin tel
 * quel (m\u00eame convention que /api/media/r2/[...path]). Retourne null si absent
 * ou en cas d'erreur \u2014 l'appelant rendra alors l'image de secours.
 */
async function fetchR2Asset(key: string): Promise<Response | null> {
  try {
    const signedUrl = await getSignedUrl(
      getR2Client(),
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: key }),
      { expiresIn: 300 },
    );
    const res = await fetch(signedUrl, { cache: "no-store" });
    if (!res.ok || !res.body) return null;
    return res;
  } catch {
    return null;
  }
}'''
src = src.rstrip() + "\n" + HELPER + "\n"

p.write_text(src, encoding="utf-8")
print("  ✓ proxy : session requise + fallback R2")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "fix(media): le proxy sert aussi les binaires R2 et exige une session"
echo "✓ commité."