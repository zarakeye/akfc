#!/usr/bin/env bash
#
# fix_media_format_param.sh
#
# Cause : le proxy /api/media/by-public-id/ construit une URL de livraison
# Cloudinary SANS extension. Cloudinary coupe alors le dernier segment au
# DERNIER point et prend la suite pour un format demandé. Un nom qui contient
# un point en plein milieu — « CNI recto PORQUET (ep. BAZZE) … » — devient
# donc introuvable : image, video et raw répondent 404, R2 ne l'a pas, et le
# proxy sert son image de secours en 200. Les URLs bâties depuis la base
# (galeries, avatars) échappent au bug parce que MediaAsset.publicId porte
# l'extension — le point y est au bon endroit par accident.
#
# Correctif : le CLIENT transmet l'extension (meta.format, autoritaire), le
# serveur ne la devine plus. Même remède que celui prévu pour storage.rename.
#
# Bonus : buildHeaders ne fossilise plus (max-age 1 an + immutable) une
# réponse qui n'est pas un média. C'est ce qui a masqué le bug une session
# entière — le navigateur reservait sa réponse cassée sans jamais requêter.
#
# Usage :
#   bash fix_media_format_param.sh
#   AKFC_APPLY_ONLY=1 bash fix_media_format_param.sh   # édits seuls
#
set -euo pipefail

B_SVC="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"
ROUTE="apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts"
F_UTILS="apps/web/src/features/finder-adapters/cloudinary/utils.ts"
F_ADAPTER="apps/web/src/features/finder-adapters/cloudinary/finderStorage.adapter.ts"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$B_SVC" "$ROUTE" "$F_UTILS" "$F_ADAPTER"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "publicId: storagePath, format" "$F_ADAPTER"; then
  echo "✓ déjà appliqué (marqueur présent dans $F_ADAPTER) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io, sys

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path)

B_SVC   = "packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"
ROUTE   = "apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts"
F_UTILS = "apps/web/src/features/finder-adapters/cloudinary/utils.ts"
F_ADPT  = "apps/web/src/features/finder-adapters/cloudinary/finderStorage.adapter.ts"

# ── 1/4 backend : buildAuthenticatedUrl + fetchAuthenticatedAsset ───────────
edit(B_SVC, """export function buildAuthenticatedUrl(
  publicId: string,
  variant: Variant,
  resourceType: ResourceType = "image",
  version?: number,
): string {""", """export function buildAuthenticatedUrl(
  publicId: string,
  variant: Variant,
  resourceType: ResourceType = "image",
  version?: number,
  format?: string,
): string {""")

edit(B_SVC, """  return cloudinary.url(publicId, {
    transformation,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    secure: true,""", """  // ─── Pourquoi transmettre le format ? ──────────────────────────────────
  //
  // Une URL de livraison Cloudinary s'écrit `<public_id>.<format>`. Le
  // serveur coupe donc le dernier segment au DERNIER point. Sans extension
  // explicite, un public_id qui contient un point ailleurs qu'en fin de nom
  // est tronqué : « …/CNI recto PORQUET (ep. BAZZE) Yvonne » est lu comme le
  // public_id « …/CNI recto PORQUET (ep » assorti du format « BAZZE) Yvonne ».
  // Résultat : 404 sur les trois resource_types, puis image de secours.
  //
  // On ne DEVINE pas ce format — l'appelant le fournit (meta.format côté
  // client, autoritaire). Deux abstentions : sur `raw`, dont le public_id
  // porte déjà son extension ; et quand le public_id se termine déjà par
  // `.<format>` (cas des URLs bâties depuis MediaAsset.publicId).
  const appendFormat =
    format !== undefined &&
    resourceType !== "raw" &&
    !publicId.toLowerCase().endsWith(`.${format.toLowerCase()}`);

  return cloudinary.url(publicId, {
    transformation,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    secure: true,
    ...(appendFormat ? { format } : {}),""")

edit(B_SVC, """export async function fetchAuthenticatedAsset(
  publicId: string,
  variant: Variant,
  version?: number,
): Promise<Response | null> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const url = buildAuthenticatedUrl(publicId, variant, rt, version);""",
"""export async function fetchAuthenticatedAsset(
  publicId: string,
  variant: Variant,
  version?: number,
  format?: string,
): Promise<Response | null> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {
      const url = buildAuthenticatedUrl(publicId, variant, rt, version, format);""")

# ── 2/4 route : lecture du paramètre + cache non fossilisant ────────────────
edit(ROUTE, """    const asset = asPoster
      ? await fetchVideoPoster(id, variant)
      : await fetchAuthenticatedAsset(id, variant, safeVersion);""",
"""    // `format` = extension autoritaire transmise par le client (meta.format).
    // Le serveur ne la déduit pas du nom : un nom peut légitimement contenir
    // un point (cf. buildAuthenticatedUrl). Absente, on garde le comportement
    // historique — la route reste compatible avec ses appelants existants.
    const rawFormat = searchParams.get("format");
    const format =
      rawFormat && /^[A-Za-z0-9]{1,8}$/.test(rawFormat) ? rawFormat : undefined;

    const asset = asPoster
      ? await fetchVideoPoster(id, variant)
      : await fetchAuthenticatedAsset(id, variant, safeVersion, format);""")

edit(ROUTE, """function buildHeaders(res: Response, isFallback = false): HeadersInit {
  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";

  return {
    "Content-Type": contentType,

    // 🔥 CDN / navigateur cache
    "Cache-Control": isFallback
      ? "public, max-age=60" // fallback → court
      : "public, max-age=31536000, immutable",""",
"""function buildHeaders(res: Response, isFallback = false): HeadersInit {
  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";

  // Un cache d'un an `immutable` sur une réponse qui n'est PAS un média fige
  // l'erreur chez le client : plus aucune requête ne repart, le correctif
  // serveur reste invisible, et le diagnostic porte sur un fossile. On ne
  // fossilise donc que ce qui est bien une image ou une vidéo.
  const isMedia = /^(image|video)\\//.test(contentType);
  const durable = !isFallback && isMedia;

  return {
    "Content-Type": contentType,

    // 🔥 CDN / navigateur cache
    "Cache-Control": durable
      ? "public, max-age=31536000, immutable"
      : "public, max-age=60", // secours ou contenu inattendu → court""")

# ── 3/4 front : getMediaUrl transporte le format ────────────────────────────
edit(F_UTILS, """export function getMediaUrl(
  source: { publicId: string },
  variant: Variant = 'thumb',
): string {
  const encoded = source.publicId
    .split('/')
    .map(encodeSegment)
    .join('/');

  return `/api/media/by-public-id/${encoded}?variant=${variant}`;
}""",
"""export function getMediaUrl(
  source: { publicId: string; format?: string },
  variant: Variant = 'thumb',
): string {
  const encoded = source.publicId
    .split('/')
    .map(encodeSegment)
    .join('/');

  // Le format part avec l'URL quand on le connaît : c'est lui qui rend le
  // public_id non ambigu côté Cloudinary pour les noms contenant un point.
  // Inutile si le publicId porte déjà son extension (assets R2 / raw).
  const { format } = source;
  const suffix =
    format && !source.publicId.toLowerCase().endsWith(`.${format.toLowerCase()}`)
      ? `&format=${encodeURIComponent(format)}`
      : '';

  return `/api/media/by-public-id/${encoded}?variant=${variant}${suffix}`;
}""")

# ── 4/4 adapter : DERNIER fichier écrit (porte le marqueur de la garde) ─────
edit(F_ADPT, """      ? getMediaUrl({ publicId: storagePath })""",
             """      ? getMediaUrl({ publicId: storagePath, format })""")
PY

echo "✓ 6 substitutions appliquées"

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
git commit -m "fix(media): le client transmet le format au proxy Cloudinary

Une URL de livraison Cloudinary s'ecrit <public_id>.<format> : sans
extension explicite, un public_id contenant un point est tronque au
dernier point et l'asset devient introuvable. Le client transmet
desormais meta.format ; le serveur ne devine plus.

buildHeaders ne pose plus de cache immutable d'un an sur une reponse
qui n'est pas un media, ce qui figeait l'erreur cote navigateur."

echo "✓ commité"
git log -1 --oneline