#!/usr/bin/env bash
#
# fix_float_media_refs.sh
#
# Suite de step_float_text_block.sh — deux oublis que le nouveau bloc a
# révélés. Le premier a arrêté le typecheck, le second serait passé inaperçu.
#
# ─── 1. Le cas manquant (l'erreur que tu as vue) ───────────────────────────
#
# `extractMediaIdsFromBlock` balaie tous les types de bloc pour recenser les
# médias qu'ils référencent, et se termine par une garde `assertNever`. Ajouter
# un type au contrat sans ajouter son cas ici casse la compilation — c'est
# voulu, et c'est exactement ce qui vient de se produire.
#
# Ce n'est pas une formalité : cette liste alimente la table
# `PageMediaReference` au save. Sans le cas float, l'image d'un bloc float ne
# serait jamais enregistrée comme référencée — l'asset passerait pour orphelin.
#
# Le corps est le MÊME que celui du média-texte (même modèle de média, même
# texte riche), donc les deux cas se partagent une seule branche.
#
# ─── 2. Le bug silencieux (que le typecheck n'aurait pas signalé) ──────────
#
# `PageRenderer` collecte les avatars à résoudre en ne regardant QUE les blocs
# `media-text`. Un bloc float référençant un avatar aurait donc reçu un
# `resolveAvatar` rendant `null` : image absente, sans la moindre erreur.
#
# C'est précisément le cas d'usage visé (portrait d'instructeur en float), donc
# le défaut serait apparu au pire moment. Le filtre accepte désormais les deux
# types.
#
# En revanche l'ALTERNANCE gauche/droite reste réservée au média-texte : le
# côté d'un float est une donnée du bloc, choisie dans l'éditeur, pas une
# décision de position. Ce filtre-là n'est pas touché.
#
# Ce script termine le chantier float et commite l'ensemble (le script
# précédent s'était arrêté avant de commiter).
#
# Usage :
#   bash fix_float_media_refs.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_media_refs.sh
#
set -euo pipefail

EXTRACT="packages/contracts/src/page/extractMediaIds.ts"
RENDERER="apps/web/src/features/page-builder/PageRenderer.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (AVANT les prérequis) ────────────────────
if grep -q '"float-text"' "$EXTRACT" 2>/dev/null; then
  echo "✓ déjà appliqué (cas float-text présent dans extractMediaIds) — rien à faire"
  exit 0
fi

for f in "$EXTRACT" "$RENDERER"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

[ -d "apps/web/src/features/page-builder/blocks/float-text" ] || {
  echo "✗ le bloc float doit être posé d'abord (step_float_text_block.sh)"; exit 1; }

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

EXTRACT  = "packages/contracts/src/page/extractMediaIds.ts"
RENDERER = "apps/web/src/features/page-builder/PageRenderer.tsx"

# ── 1/2 : le cas manquant, partagé avec le média-texte ────────────────────
edit(EXTRACT, """    case "media-text":
      // Seul un média de bibliothèque a un mediaId à résoudre ; une référence
      // avatar est résolue dynamiquement ailleurs (via User.avatar).""",
"""    case "media-text":
    case "float-text":
      // Même corps pour les deux : ils partagent le modèle de média (un seul
      // média, bibliothèque OU avatar) et le texte riche. Seule leur mise en
      // page diffère, ce qui ne regarde pas l'extraction des références.
      //
      // Seul un média de bibliothèque a un mediaId à résoudre ; une référence
      // avatar est résolue dynamiquement ailleurs (via User.avatar).""")

# ── 2/2 : la collecte d'avatars, élargie au float ─────────────────────────
edit(RENDERER, """  // Résolution des avatars référencés par les blocs media-text (référence
  // logique { kind: "avatar", userId } → avatar courant du user).
  const avatarUserIds = content.blocks.flatMap((b) =>
    b.type === "media-text" && b.media?.kind === "avatar"
      ? [b.media.userId]
      : [],
  );""",
"""  // Résolution des avatars référencés par les blocs media-text ET float-text
  // (référence logique { kind: "avatar", userId } → avatar courant du user).
  //
  // Oublier le float ici ne casserait RIEN à la compilation : le bloc aurait
  // simplement reçu un resolveAvatar rendant null, donc une image absente,
  // sans erreur. Le cas d'usage visé étant le portrait d'instructeur en
  // float, le défaut serait apparu au pire endroit.
  const avatarUserIds = content.blocks.flatMap((b) =>
    (b.type === "media-text" || b.type === "float-text") &&
    b.media?.kind === "avatar"
      ? [b.media.userId]
      : [],
  );""")
PY

echo "✓ cas float-text ajouté, collecte d'avatars élargie"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ─────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(page-builder): bloc texte enrobant une image (float)

Sixieme type de bloc, aux cotes du media-texte et non a sa place : le
media-texte separe image et texte en deux colonnes, le float integre
l'image DANS le texte qui l'enrobe. Deux moteurs de mise en page
distincts — flexbox et grid ne peuvent pas produire un enrobage, seul
le float garde l'image dans le flux inline.

Reutilise le modele de media (bibliotheque ou avatar via
mediaTextItemSchema), le noeud image serveur, le rendu du texte riche.
De neuf : la disposition (float + clear + shape-outside), deux
variables reglables (largeur image, gouttiere d'enrobage) et son repli
mobile (image pleine largeur sous 34rem).

Deux raccords que le nouveau type a reveles :
- extractMediaIdsFromBlock partage sa branche avec le media-texte, sans
  quoi l'image d'un bloc float ne serait pas enregistree dans
  PageMediaReference et l'asset passerait pour orphelin ;
- PageRenderer collecte desormais les avatars des DEUX types de bloc.
  Cet oubli-la ne cassait pas la compilation : il rendait juste l'image
  absente, en silence, precisement pour le portrait d'instructeur."

echo "✓ commité"
git log -1 --oneline