#!/usr/bin/env bash
#
# diag_cloudinary_delivery.sh
#
# TEMPORAIRE — à retirer une fois le diagnostic posé (git revert du commit).
#
# On sait que le proxy tombe sur son image de secours (x-asset-source:
# fallback), donc que les trois resource_types Cloudinary ont échoué. Ce
# qu'on ne sait toujours pas, c'est POURQUOI — et Cloudinary le dit lui-même
# dans un en-tête de réponse, `x-cld-error` : « Resource not found »,
# « Invalid signature », « Invalid extension in transformation »… trois causes
# distinctes qui appellent trois correctifs distincts.
#
# Ce script ajoute deux logs dans `fetchAuthenticatedAsset` :
#   - le publicId passé au SDK, en JSON.stringify — ce qui rend visibles les
#     caractères invisibles (espace final, espace insécable, tiret exotique)
#     qu'aucun test NFC/NFD n'attrape ;
#   - pour chacun des trois essais : resource_type, code HTTP, `x-cld-error`,
#     et l'URL signée réellement appelée.
#
# Les logs sont MUETS par défaut. Ils ne parlent que si `AKFC_DIAG_MATCH` est
# défini et que le publicId le contient :
#
#     AKFC_DIAG_MATCH="CNI recto" pnpm dev
#
# puis ouvrir le picker. Attendu : 4 lignes. Colle-les telles quelles.
#
# Usage :
#   bash diag_cloudinary_delivery.sh
#   AKFC_APPLY_ONLY=1 bash diag_cloudinary_delivery.sh
#
set -euo pipefail

B_SVC="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$B_SVC" ] || { echo "✗ introuvable : $B_SVC"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "AKFC_DIAG_MATCH" "$B_SVC"; then
  echo "✓ déjà appliqué (marqueur présent dans $B_SVC) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

B_SVC = "packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"

# Les deux ancres sont indépendantes du correctif `format` : elles matchent
# que fix_media_format_param.sh ait été appliqué ou non.

# `fileExists` ouvre la même boucle sur les trois resource_types : l'ancre
# remonte donc jusqu'au type de retour, qui lui est propre à cette fonction
# et que le correctif `format` ne touche pas.
edit(B_SVC, """): Promise<Response | null> {
  for (const rt of ["image", "video", "raw"] as const) {
    try {""",
"""): Promise<Response | null> {
  // [DIAG TEMPORAIRE] Muet sauf si AKFC_DIAG_MATCH est défini et que le
  // publicId le contient. JSON.stringify pour rendre lisibles les caractères
  // invisibles (espace final, U+00A0, tiret long…).
  const diagMatch = process.env.AKFC_DIAG_MATCH;
  const diagOn = Boolean(diagMatch) && publicId.includes(diagMatch as string);
  if (diagOn) {
    console.log("[diag] publicId =", JSON.stringify(publicId));
  }

  for (const rt of ["image", "video", "raw"] as const) {
    try {""")

edit(B_SVC, """      const res = await fetch(url, {
        cache: "no-store",
      });

      if (!res.ok) continue;""",
"""      const res = await fetch(url, {
        cache: "no-store",
      });

      // [DIAG TEMPORAIRE] `x-cld-error` porte le motif du refus en clair.
      if (diagOn) {
        console.log(
          `[diag] ${rt} → ${res.status}`,
          res.headers.get("x-cld-error") ?? "(pas d'en-tête x-cld-error)",
          url,
        );
      }

      if (!res.ok) continue;""")
PY

echo "✓ 2 substitutions appliquées"

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
git commit -m "chore(diag): trace temporaire de la livraison Cloudinary

Log muet par defaut, actif via AKFC_DIAG_MATCH. Affiche le publicId
en JSON.stringify et, pour chacun des trois resource_types, le code
HTTP et l'en-tete x-cld-error qui porte le motif du refus.

A revert une fois le diagnostic pose."

echo "✓ commité"
git log -1 --oneline
echo
echo "→ AKFC_DIAG_MATCH=\"CNI recto\" pnpm dev, puis ouvrir le picker."