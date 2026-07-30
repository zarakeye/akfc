#!/usr/bin/env bash
#
# fix_summary_card_layout.sh
#
# Ta conclusion était la bonne : le float est le mauvais outil pour une carte.
# Ce script change l'approche et corrige au passage un bug structurel sur les
# avatars.
#
# ─── Pourquoi le float ne pouvait pas marcher ici ──────────────────────────
#
# Un enrobage suppose un texte assez long pour longer l'image PUIS se
# poursuivre dessous. C'est ce qui lui donne son allure. Dans une carte haute
# de 220 pixels, cette place n'existe pas : le texte n'atteint jamais le bas
# de l'image, donc il reste coincé dans la bande étroite qui la longe — d'où
# tes deux mots par ligne et une carte anormalement haute.
#
# Le float reste juste là où il a été conçu : une bio d'instructeur, un
# article. Pas une carte.
#
# ─── La carte, c'est le média-texte en régime étroit ───────────────────────
#
# Le bloc média-texte fait DÉJÀ ce que tu décris, sans rien écrire de neuf :
# sous 44rem, sa grille reste à une colonne et le média passe AU-DESSUS du
# texte. C'est l'ordre de lecture d'une carte.
#
# Deux conséquences, dans cet ordre :
#
#   1. La palette du builder restreint passe de « texte enrobant une image »
#      à « média + texte ».
#
#   2. Les cartes passent en GRILLE (une colonne sur téléphone, deux à partir
#      de `sm`, trois à partir de `lg`). Ce n'est pas qu'une question de
#      laideur : une carte d'un tiers de puits fait environ 21rem, donc
#      TOUJOURS sous le seuil de 44rem. L'empilement média-au-dessus est
#      alors garanti par construction, et non par chance.
#
# En pleine largeur, une carte aurait dépassé 44rem et serait repassée à deux
# colonnes — exactement ce qu'on ne veut pas. La grille n'est donc pas un
# choix esthétique, c'est ce qui rend la mise en page prévisible.
#
# ─── L'avatar invisible : un bug structurel, pas un oubli ──────────────────
#
# `/api/media/by-public-id/` exige une session, SANS condition — elle a été
# durcie pour protéger les documents personnels qu'elle sert aussi. Or c'est
# elle qui servait les avatars.
#
# Conséquence : tout avatar référencé dans une page publique est invisible
# pour un visiteur anonyme. Cela vaut pour ces cartes, mais AUSSI pour la page
# des instructeurs — qui paraît fonctionner parce que tu la regardes connecté.
# Un visiteur n'y voit aucun portrait.
#
# Le correctif ne consiste pas à rouvrir le proxy général : ce serait rendre
# les documents personnels publics pour réparer des avatars. Une route dédiée
# `/api/media/public/avatar/[userId]` sert UNIQUEMENT des avatars, qui sont
# publics par nature — ils s'affichent à côté d'un nom sur des pages
# publiques. Le proxy général reste fermé.
#
# Elle ne sert pas non plus l'image de secours quand l'avatar manque : un
# portrait absent doit être absent, pas remplacé par la photo de démonstration
# de Cloudinary.
#
# Usage :
#   bash fix_summary_card_layout.sh
#   AKFC_APPLY_ONLY=1 bash fix_summary_card_layout.sh
#
set -euo pipefail

ROUTE="apps/web/src/app/api/media/public/avatar/[userId]/route.ts"
RESOLVE="packages/backend/src/modules/media/services/resolveAvatarsByUserIds.service.ts"
FORM="apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
CARDS="apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "sm:grid-cols-2" "$CARDS" 2>/dev/null; then
  echo "✓ déjà appliqué (cartes en grille) — rien à faire"
  exit 0
fi

for f in "$RESOLVE" "$FORM" "$CARDS"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ─────────────────────────────────────────────────────────────────────────
#  1 — Route publique d'avatar
# ─────────────────────────────────────────────────────────────────────────

mkdir -p "$(dirname "$ROUTE")"
cat > "$ROUTE" <<'TS'
import { NextRequest } from "next/server";

import { prisma } from "@backend/prisma";
import { fetchAuthenticatedAsset } from "@backend/modules/cloudinary/services/cloudinary.service";

/**
 * Proxy PUBLIC d'avatar.
 *
 * Pourquoi une route à part plutôt que `/api/media/by-public-id/` : cette
 * dernière exige une session, sans condition, parce qu'elle sert aussi des
 * documents personnels. Tout avatar référencé dans une page publique y était
 * donc invisible pour un visiteur anonyme — sur ces cartes comme sur la page
 * des instructeurs.
 *
 * Rouvrir le proxy général aurait rendu les documents personnels accessibles
 * pour réparer des avatars. Cette route-ci ne sert QUE des avatars, qui sont
 * publics par nature : ils s'affichent à côté d'un nom sur des pages
 * publiques.
 *
 * Elle prend un `userId` et non un publicId : c'est ce qui garantit qu'elle
 * ne peut rien servir d'autre. Un publicId en paramètre rouvrirait le proxy
 * général sous un autre nom.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    if (!userId) return new Response("Missing userId", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Pas d'avatar → 404 franc. Servir l'image de secours ferait apparaître
    // une photo de démonstration à la place d'un portrait absent : mieux vaut
    // que le rendu affiche ses initiales.
    if (!user?.avatar) return new Response("Not found", { status: 404 });

    const asset = await fetchAuthenticatedAsset(user.avatar, "large");
    if (!asset || !asset.ok || !asset.body) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(asset.body, {
      status: 200,
      headers: {
        "Content-Type":
          asset.headers.get("content-type") ?? "application/octet-stream",
        // L'URL est stable par utilisateur, donc le cache est court : un
        // changement d'avatar doit se voir sans purge.
        "Cache-Control": "public, max-age=300",
        "X-Asset-Source": "cloudinary",
      },
    });
  } catch (error) {
    console.error("[media] public avatar error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
TS
echo "  + api/media/public/avatar/[userId]/route.ts"

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

RESOLVE = "packages/backend/src/modules/media/services/resolveAvatarsByUserIds.service.ts"
FORM    = "apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
CARDS   = "apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"

# ── 2 — l'avatar passe par la route publique ─────────────────────────────
edit(RESOLVE, """    const url = buildMediaProxyUrl(
      { publicId: user.avatar, fullPath: "" },
      "public",
    );""",
"""    // Route publique dédiée, et non le proxy général : celui-ci exige une
    // session sans condition (il sert aussi des documents personnels), donc
    // il rendait tout avatar invisible aux visiteurs anonymes — ici comme sur
    // la page des instructeurs.
    const url = `/api/media/public/avatar/${encodeURIComponent(user.id)}`;""")

edit(RESOLVE, """import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import type { ResolvedMedia } from "@contracts/page";""",
"""import type { ResolvedMedia } from "@contracts/page";""")

# ── 3 — la palette du builder restreint ──────────────────────────────────
edit(FORM, """/**
 * Palette du builder de présentation synthétique : le seul bloc « texte
 * enrobant une image ».
 *
 * La restriction est ce qui garantit que toutes les cartes d'accueil se
 * ressemblent. Un builder complet y autoriserait galeries et colonnes, et la
 * page d'accueil deviendrait un patchwork qu'aucune règle de style ne
 * rattraperait.
 *
 * Le bloc dégénère proprement en texte simple quand aucune image n'est
 * choisie, donc une présentation sans photo reste possible.
 */
const SUMMARY_BLOCKS = ["float-text"] as const;""",
"""/**
 * Palette du builder de présentation synthétique : le seul bloc
 * « média + texte ».
 *
 * Et NON le bloc « texte enrobant une image », qui a été essayé et ne
 * convient pas : un enrobage suppose un texte assez long pour longer l'image
 * puis se poursuivre dessous. Dans une carte, cette place n'existe pas — le
 * texte reste coincé dans la bande étroite qui longe l'image.
 *
 * Le média-texte, lui, passe à UNE colonne sous 44rem avec le média
 * AU-DESSUS du texte : c'est exactement l'ordre de lecture d'une carte, et
 * les cartes d'accueil sont toujours sous ce seuil.
 *
 * La restriction reste ce qui garantit que toutes les cartes se ressemblent :
 * un builder complet y autoriserait galeries et listes, et l'accueil
 * deviendrait un patchwork qu'aucune règle de style ne rattraperait.
 */
const SUMMARY_BLOCKS = ["media-text"] as const;""")

edit(FORM, """          Quelques lignes autour d&apos;une image, affichées en carte sur la
          page d&apos;accueil avec un lien vers la page complète ci-dessus.
          Laissez vide pour que cette discipline ne figure pas sur
          l&apos;accueil.""",
"""          Une image et quelques lignes, affichées en carte sur la page
          d&apos;accueil avec un lien vers la page complète ci-dessus. Dans la
          carte, l&apos;image se place au-dessus du texte. Laissez vide pour
          que cette discipline ne figure pas sur l&apos;accueil.""")

# ── 4 — les cartes passent en grille ─────────────────────────────────────
edit(CARDS, """const COLLAPSED_HEIGHT = 220;""",
"""const COLLAPSED_HEIGHT = 220;

/**
 * Les cartes sont en GRILLE, et ce n'est pas qu'une question d'allure.
 *
 * Le bloc média-texte n'empile le média au-dessus du texte qu'en dessous de
 * 44rem. Une carte occupant un tiers du puits fait environ 21rem, donc
 * toujours sous le seuil : l'empilement est garanti par construction. En
 * pleine largeur, la carte repasserait à deux colonnes — précisément la mise
 * en page qu'on ne veut pas ici.
 */
const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";""")

edit(CARDS, """    <div className="flex flex-col" style={{ gap: "var(--akfc-block-gap)" }}>""",
"""    <div className={GRID_CLASS}>""")

edit(CARDS, """        <article
          key={card.id}
          className="rounded-lg border border-border bg-white p-6"
        >""",
"""        <article
          key={card.id}
          className="flex h-full flex-col rounded-lg border border-border bg-white p-6"
        >""")

edit(CARDS, """            <div className="mt-4 border-t border-border pt-3">""",
"""            <div className="mt-auto border-t border-border pt-3">""")
PY

echo "✓ cartes en grille sur média-texte, avatar servi publiquement"

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
git commit -m "fix(home): la carte devient media-texte en grille, avatar servi publiquement

Le float etait le mauvais outil pour une carte. Un enrobage suppose un
texte assez long pour longer l'image PUIS se poursuivre dessous ; dans
une carte de 220px cette place n'existe pas, donc le texte reste coince
dans la bande etroite qui longe l'image — d'ou deux mots par ligne et
une carte anormalement haute.

Le bloc media-texte fait deja ce qu'il faut sans rien ecrire de neuf :
sous 44rem sa grille reste a une colonne et le media passe AU-DESSUS du
texte. La palette du builder restreint bascule donc dessus.

Les cartes passent en grille (1 / 2 / 3 colonnes). Ce n'est pas
esthetique : une carte d'un tiers de puits fait ~21rem, donc toujours
sous le seuil de 44rem, et l'empilement est garanti par construction.
En pleine largeur la carte repasserait a deux colonnes.

Bug structurel corrige au passage : /api/media/by-public-id/ exige une
session SANS condition, car elle sert aussi des documents personnels.
Elle servait pourtant les avatars — donc tout avatar d'une page
publique etait invisible aux visiteurs anonymes, sur ces cartes comme
sur la page des instructeurs, qui paraissait fonctionner seulement
parce qu'on la regardait connecte.

Le correctif n'ouvre pas le proxy general : une route dediee
/api/media/public/avatar/[userId] ne sert QUE des avatars, publics par
nature. Elle prend un userId et non un publicId, ce qui garantit
qu'elle ne peut rien servir d'autre, et rend 404 plutot que l'image de
secours quand l'avatar manque."

echo "✓ commité"
git log -1 --oneline