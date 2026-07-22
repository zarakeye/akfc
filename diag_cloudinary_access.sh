#!/usr/bin/env bash
#
# diag_cloudinary_access.sh
#
# TEMPORAIRE — se revert avec le commit précédent.
#
# Ce qu'on sait maintenant : le publicId est propre (aucun caractère
# invisible), l'URL est bien formée, la signature est calculée sur la même
# chaîne que pour les quatorze voisins qui marchent — et Cloudinary répond
# quand même « 401 Unauthenticated access ».
#
# Ce message ne dit pas seulement « signature refusée ». C'est aussi celui
# que Cloudinary renvoie quand l'asset porte un `access_control` en mode
# `token` : une URL signée ne suffit alors PAS à y accéder, il faut un cookie
# de jeton. L'asset reste parfaitement visible depuis l'Admin API — ce qui
# colle avec l'inventaire déjà fait (assetCount 1, 107 972 octets).
#
# Cette hypothèse est testable et se lit dans un seul champ. Ce script ajoute
# au bloc [DIAG] existant un dump de la fiche Admin API : `type`,
# `resource_type`, `format`, `version`, `bytes`, `access_mode`,
# `access_control`.
#
# ⚠️ Le dump seul ne conclut pas. Il faut le COMPARER à un voisin qui marche.
# Deux lancements, deux relevés :
#
#     AKFC_DIAG_MATCH=CNI pnpm dev                  # les deux cassés
#     AKFC_DIAG_MATCH="<nom d'un fichier OK>" pnpm dev   # le témoin
#
# ouvrir le finder à chaque fois, et comparer les deux lignes `admin image =`.
# Le champ qui diffère est la cause.
#
# Usage :
#   bash diag_cloudinary_access.sh
#   AKFC_APPLY_ONLY=1 bash diag_cloudinary_access.sh
#
set -euo pipefail

B_SVC="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$B_SVC" ] || { echo "✗ introuvable : $B_SVC"; exit 1; }
grep -q "AKFC_DIAG_MATCH" "$B_SVC" || {
  echo "✗ diag_cloudinary_delivery.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "diag] admin" "$B_SVC"; then
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

edit(B_SVC, """  if (diagOn) {
    console.log("[diag] publicId =", JSON.stringify(publicId));
  }""",
"""  if (diagOn) {
    console.log("[diag] publicId =", JSON.stringify(publicId));

    // La fiche Admin API, à comparer entre un fichier cassé et un témoin qui
    // marche. `access_control` en mode `token` rend une URL signée
    // insuffisante — Cloudinary répond alors « Unauthenticated access » alors
    // même que l'asset existe et que la signature est bonne.
    for (const rt of ["image", "video", "raw"] as const) {
      try {
        const info = (await cloudinary.api.resource(publicId, {
          type: "authenticated",
          resource_type: rt,
        })) as Record<string, unknown>;

        console.log(
          `[diag] admin ${rt} =`,
          JSON.stringify({
            type: info.type,
            resource_type: info.resource_type,
            format: info.format,
            version: info.version,
            bytes: info.bytes,
            access_mode: info.access_mode,
            access_control: info.access_control,
          }),
        );
      } catch {
        // absent de ce resource_type — silence, c'est attendu sur deux des trois
      }
    }
  }""")
PY

echo "✓ 1 substitution appliquée"

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
git commit -m "chore(diag): dump de la fiche Admin API dans la trace Cloudinary

Ajoute access_mode et access_control au bloc [DIAG], pour comparer un
asset dont la livraison echoue en 401 avec un voisin qui passe.

A revert avec le commit de diagnostic precedent."

echo "✓ commité"
git log -1 --oneline
echo
echo "→ AKFC_DIAG_MATCH=CNI pnpm dev, puis relancer avec le nom d'un fichier OK."