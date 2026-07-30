#!/usr/bin/env bash
#
# fix_upload_path_guard.sh
#
# « Uploads are only allowed under pending. » — une garde devenue fausse.
#
# ─── Ce n'est pas le SVG ───────────────────────────────────────────────────
#
# Le message ne parle pas du type de fichier mais du DOSSIER de destination.
# Tous les téléversements sont concernés, quel que soit le format : tu l'as
# simplement rencontré en essayant un SVG.
#
# ─── Une garde restée en arrière de son architecture ───────────────────────
#
# `assertSafeCloudinaryPath` exige que le chemin commence par
# `${appRoot}/pending/`. Or `resolvePendingUploadFolder` — qui construit ces
# chemins — ne produit plus jamais rien de tel. Il rend :
#
#   ${appRoot}/${categorie}/${discipline}
#   ${appRoot}/general[/${dossier}]
#   ${appRoot}/events/${event}
#   ${appRoot}/persos/${personne}/photos
#
# Son propre commentaire l'explique : depuis l'étape 3, un upload naît
# `pending` parce que `registerUploadedAssets` écrit `status: "pending"` EN
# BASE — pas parce qu'il atterrit sous un dossier de ce nom. Le chemin ne dit
# plus le statut, il dit seulement où est le fichier. `stratumSegmentOf` le
# confirme de son côté : `AKFC/cours/x → null (déjà à plat, post-étape 4)`.
#
# La garde est donc un vestige du modèle par dossiers, et elle refuse tout.
#
# ─── Ce qu'elle doit vérifier à la place ───────────────────────────────────
#
# Le vrai verrou est ailleurs, et il est intact : juste après cet appel,
# `registerUploadedAssets` compare `asset.folder` au dossier calculé PAR LE
# SERVEUR à partir de la destination signée, et refuse toute divergence. Un
# client ne peut donc pas choisir son chemin.
#
# Cette fonction reste utile en défense de profondeur, avec ce qui garde du
# sens : rester sous l'appRoot, et pas de traversée ni de corbeille.
#
# Le confinement passe par `isUnderAppRoot`, qui compare SEGMENT PAR SEGMENT
# plutôt que par préfixe — sans quoi une racine nommée `AKFC-bis` passerait
# pour être sous `AKFC`. Le piège existait déjà résolu ailleurs dans le
# projet ; autant s'en servir que le reproduire.
#
# ─── Ce que je ne touche pas ───────────────────────────────────────────────
#
# `folder.utils.ts` déduit encore un statut applicatif depuis le chemin, ce
# qui relève du même modèle dépassé. Il sert peut-être encore aux assets
# antérieurs à l'aplatissement, et le débusquer demande de vérifier ses
# appelants — un autre incrément, pas celui qui débloque tes uploads.
#
# Usage :
#   bash fix_upload_path_guard.sh
#   AKFC_APPLY_ONLY=1 bash fix_upload_path_guard.sh
#
set -euo pipefail

guard_file="packages/backend/src/modules/cloudinary/utils/path-validation.utils.ts"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "isUnderAppRoot" "$guard_file" 2>/dev/null; then
  echo "✓ déjà appliqué (garde corrigée) — rien à faire"
  exit 0
fi

[ -f "$guard_file" ] || { echo "✗ introuvable : $guard_file"; exit 1; }

grep -q "export function isUnderAppRoot" \
  packages/backend/src/modules/storage/logicalPath.ts || {
  echo "✗ isUnderAppRoot introuvable dans storage/logicalPath"; exit 1; }

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

guard_file = "packages/backend/src/modules/cloudinary/utils/path-validation.utils.ts"

edit(guard_file, """import { TRPCError } from "@trpc/server";""",
"""import { TRPCError } from "@trpc/server";

import { isUnderAppRoot } from "@backend/modules/storage/logicalPath";""")

edit(guard_file, """export function assertSafeCloudinaryPath(path: string, appRoot: string): void {
  if (!path.startsWith(`${appRoot}/pending/`)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Uploads are only allowed under pending.",
    });
  }

  if (path.includes("..") || path.includes("/.trash/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid asset path.",
    });
  }
}""",
"""/**
 * Contrôle de sûreté du chemin d'un asset téléversé.
 *
 * ─── Ce qu'elle ne vérifie PLUS ─────────────────────────────────────────
 *
 * Elle exigeait un chemin sous `${appRoot}/pending/`. Ce n'est plus vrai
 * depuis que le statut a quitté l'arborescence : un upload naît `pending`
 * parce que `registerUploadedAssets` écrit `status: "pending"` en base, pas
 * parce qu'il atterrit dans un dossier de ce nom. `resolvePendingUploadFolder`
 * ne produit plus aucun chemin de cette forme — la garde refusait donc TOUS
 * les téléversements.
 *
 * ─── Où est le vrai verrou ──────────────────────────────────────────────
 *
 * Dans `registerUploadedAssets`, juste après cet appel : `asset.folder` y est
 * comparé au dossier calculé PAR LE SERVEUR depuis la destination signée, et
 * toute divergence est refusée. Un client ne choisit donc pas son chemin.
 *
 * Cette fonction est une défense de profondeur : elle empêche qu'un chemin
 * sorte de l'arborescence de l'application ou vise la corbeille.
 */
export function assertSafeCloudinaryPath(path: string, appRoot: string): void {
  // Comparaison SEGMENT PAR SEGMENT et non par préfixe : une racine nommée
  // `AKFC-bis` ne doit pas passer pour être sous `AKFC`.
  if (!isUnderAppRoot(path, appRoot)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Upload path is outside the application root.",
    });
  }

  if (path.includes("..") || path.includes("/.trash/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid asset path.",
    });
  }
}""")
PY

echo "✓ garde de chemin corrigée"

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
git commit -m "fix(upload): garde de chemin restee en arriere de son architecture

« Uploads are only allowed under pending. » bloquait TOUS les
televersements, quel que soit le format — rencontre en essayant un SVG,
mais sans rapport avec lui.

assertSafeCloudinaryPath exigeait un chemin sous appRoot/pending/. Or
resolvePendingUploadFolder ne produit plus rien de tel : il rend
appRoot/categorie/discipline, appRoot/general, appRoot/events/... ou
appRoot/persos/.../photos. Son propre commentaire l'explique — depuis
l'etape 3, un upload nait pending parce que registerUploadedAssets
ecrit status: pending EN BASE, pas parce qu'il atterrit dans un dossier
de ce nom. stratumSegmentOf le confirme : AKFC/cours/x est deja a plat.

Le vrai verrou est intact et se trouve juste apres : asset.folder y est
compare au dossier calcule PAR LE SERVEUR depuis la destination signee,
et toute divergence refusee. Le client ne choisit pas son chemin.

La fonction garde donc ce qui a du sens en defense de profondeur :
rester sous l'appRoot, pas de traversee ni de corbeille. Le confinement
passe par isUnderAppRoot, qui compare segment par segment plutot que
par prefixe — une racine AKFC-bis ne doit pas passer pour etre sous
AKFC. Le piege etait deja resolu ailleurs dans le projet.

Non traite : folder.utils.ts deduit encore un statut applicatif depuis
le chemin, meme modele depasse. Il sert peut-etre aux assets anterieurs
a l'aplatissement — un autre increment."

echo "✓ commité"
git log -1 --oneline