#!/usr/bin/env bash
#
# fix_public_portraits.sh
#
# Les portraits d'instructeurs restaient invisibles aux visiteurs anonymes,
# même après la route publique d'avatar. Correctif complet.
#
# ─── D'abord, une bonne nouvelle : la page n'a jamais exigé de connexion ───
#
# Le middleware (`apps/web/src/proxy.ts`) ne s'exécute que sur
# `/dashboard/:path*` et `/profil/:path*`. Tout le reste — dont
# `/about/instructeurs` — est public et l'a toujours été. Ce n'était pas la
# page qui était fermée, c'étaient les images.
#
# ─── Ce que le correctif précédent manquait ────────────────────────────────
#
# Il traitait les avatars référencés DANS LES BLOCS (résolus côté serveur par
# `resolveAvatarsByUserIds`). Mais la page des instructeurs affiche AUSSI un
# portrait en tête de chaque bio, via `UserPortrait` → `portraitUrl` →
# `publicIdToUrl` → `/api/media/by-public-id/`, la route à session.
#
# Deux chemins pour la même image, un seul réparé. Le portrait d'en-tête
# restait donc en 401 pour un visiteur non connecté.
#
# ─── Le correctif ──────────────────────────────────────────────────────────
#
# `publicIdToUrl` n'avait que quatre usages, tous des avatars. Ils basculent
# tous sur la route publique via un helper unique, `avatarUrlFor(userId)`, et
# la fonction disparaît : garder deux façons de construire l'URL d'un avatar,
# dont une qui échoue en public, c'est reproduire le bug ailleurs plus tard.
#
# Les deux aperçus du builder en profitent doublement : ils affichent
# désormais EXACTEMENT l'URL que la page publique affichera. Un aperçu qui
# emprunte un autre chemin que le rendu final n'est pas un aperçu — c'est ce
# qui nous a coûté plusieurs allers-retours cette semaine.
#
# La route accepte en outre `?v=`, pour que le changement d'avatar se voie
# immédiatement malgré le cache (le store de version le transmet déjà).
#
# ─── Sur le fond, la décision est notée ────────────────────────────────────
#
# L'avatar est public par nature : il met un visage — ou une image choisie —
# sur une identité. Qui ne souhaite pas montrer son visage choisit autre
# chose. Le proxy général, lui, reste fermé : il sert aussi des documents
# personnels, qui n'ont rien de public.
#
# Usage :
#   bash fix_public_portraits.sh
#   AKFC_APPLY_ONLY=1 bash fix_public_portraits.sh
#
set -euo pipefail

ROUTE="apps/web/src/app/api/media/public/avatar/[userId]/route.ts"
DISPLAY="apps/web/src/features/social/userDisplay.ts"
PICKER="apps/web/src/features/page-builder/blocks/media-text/AvatarPicker.tsx"
MTPREV="apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
FTPREV="apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "avatarUrlFor" "$DISPLAY" 2>/dev/null; then
  echo "✓ déjà appliqué (helper avatarUrlFor présent) — rien à faire"
  exit 0
fi

[ -f "$ROUTE" ] || {
  echo "✗ la route publique d'avatar est absente — lance d'abord"
  echo "  fix_summary_card_layout.sh"
  exit 1
}
for f in "$DISPLAY" "$PICKER" "$MTPREV" "$FTPREV"; do
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

ROUTE   = "apps/web/src/app/api/media/public/avatar/[userId]/route.ts"
DISPLAY = "apps/web/src/features/social/userDisplay.ts"
PICKER  = "apps/web/src/features/page-builder/blocks/media-text/AvatarPicker.tsx"
MTPREV  = "apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
FTPREV  = "apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"

# ── 1/7 la route accepte une version, pour contourner le cache ────────────
edit(ROUTE, """export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;""",
"""export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    // `v` = version Cloudinary du binaire, transmise par le store d'avatar.
    // Sans elle, un avatar remplacé resterait caché derrière le cache alors
    // que son URL, elle, ne change pas.
    const vParam = new URL(req.url).searchParams.get("v");
    const parsed = vParam ? Number(vParam) : undefined;
    const version = parsed && Number.isFinite(parsed) ? parsed : undefined;""")

edit(ROUTE, """    const asset = await fetchAuthenticatedAsset(user.avatar, "large");""",
"""    const asset = await fetchAuthenticatedAsset(user.avatar, "large", version);""")

# ── 2/7 le helper unique, et la fin de publicIdToUrl ──────────────────────
edit(DISPLAY, """export function publicIdToUrl(publicId: string, version?: number): string {
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
}""",
"""/**
 * URL PUBLIQUE de l'avatar d'un utilisateur.
 *
 * Remplace l'ancien `publicIdToUrl`, qui pointait sur
 * `/api/media/by-public-id/` — une route qui exige une session, parce
 * qu'elle sert aussi des documents personnels. Tout portrait affiché sur une
 * page publique y était donc invisible aux visiteurs anonymes.
 *
 * Prend un identifiant d'UTILISATEUR et non de média : c'est ce qui garantit
 * que la route publique correspondante ne peut rien servir d'autre qu'un
 * avatar.
 *
 * Le chemin est écrit en double — ici et dans `resolveAvatarsByUserIds` côté
 * backend, qui ne peut pas importer depuis `apps/web`. Toute modification
 * doit toucher les deux.
 */
export function avatarUrlFor(userId: string, version?: number): string {
  const v = version ? `?v=${version}` : "";
  return `/api/media/public/avatar/${encodeURIComponent(userId)}${v}`;
}""")

edit(DISPLAY, """  if (u.avatar) return publicIdToUrl(u.avatar, version);""",
"""  if (u.avatar) return avatarUrlFor(u.id, version);""")

# ── 3/7 sélecteur d'avatar ────────────────────────────────────────────────
edit(PICKER, """import { publicIdToUrl } from "@features/social/userDisplay";""",
"""import { avatarUrlFor } from "@features/social/userDisplay";""")

edit(PICKER, """                  src={publicIdToUrl(a.avatar)}""",
"""                  src={avatarUrlFor(a.id)}""")

# ── 4/7 aperçu média-texte ────────────────────────────────────────────────
edit(MTPREV, """import { publicIdToUrl } from "@features/social/userDisplay";""",
"""import { avatarUrlFor } from "@features/social/userDisplay";""")

edit(MTPREV, """              url: publicIdToUrl(user.avatar),""",
"""              // Même URL que la page publique : un aperçu qui emprunte un
              // autre chemin que le rendu final n'est pas un aperçu.
              url: avatarUrlFor(user.id),""")

# ── 5/7 aperçu float ──────────────────────────────────────────────────────
edit(FTPREV, """import { publicIdToUrl } from "@features/social/userDisplay";""",
"""import { avatarUrlFor } from "@features/social/userDisplay";""")

edit(FTPREV, """              url: publicIdToUrl(user.avatar),""",
"""              // Même URL que la page publique : un aperçu qui emprunte un
              // autre chemin que le rendu final n'est pas un aperçu.
              url: avatarUrlFor(user.id),""")
PY

echo "✓ tous les portraits passent par la route publique"

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
git commit -m "fix(avatars): tous les portraits visibles sans session

La page des instructeurs n'a jamais exige de connexion — le middleware
ne tourne que sur /dashboard et /profil. C'etaient les images qui
etaient fermees.

Le correctif precedent ne traitait que les avatars references dans les
BLOCS, resolus cote serveur. La page affiche aussi un portrait en tete
de chaque bio via UserPortrait -> portraitUrl -> publicIdToUrl ->
/api/media/by-public-id/, la route a session. Deux chemins pour la meme
image, un seul repare.

publicIdToUrl n'avait que quatre usages, tous des avatars. Ils
basculent sur la route publique via un helper unique, avatarUrlFor, et
la fonction disparait : garder deux facons de construire l'URL d'un
avatar, dont une qui echoue en public, c'est reprogrammer le meme bug
ailleurs.

Les deux apercus du builder y gagnent la fidelite : ils affichent
desormais exactement l'URL que la page publique affichera.

La route accepte ?v= pour qu'un avatar remplace se voie malgre le
cache, son URL ne changeant pas.

Le proxy general reste ferme : il sert aussi des documents personnels."

echo "✓ commité"
git log -1 --oneline