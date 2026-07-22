#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# URL MÉDIA — encoder les caractères qu'`encodeURIComponent` laisse passer.
#
# `encodeURIComponent` ne touche PAS à ces six caractères : ( ) ! ' * ~
# Ils arrivent donc littéralement dans l'URL, qui traverse ensuite le routage
# Next (`[...publicId]`), la signature Cloudinary et le cache HTTP — autant de
# couches susceptibles de les traiter différemment.
#
# Deux fichiers du dossier perso portent des parenthèses :
#   « CNI recto PORQUET (ep. BAZZE) Yvonne Louise Julie »
#   « CNI verso PORQUET (ep. BAZZE) Yvonne Louise Julie »
# et sont les seuls à afficher un placeholder. Leur binaire est pourtant
# présent (assetCount:1, authenticated) et le proxy ne journalise aucun
# fallback : l'encodage est la dernière variable non maîtrisée du trajet.
#
# On passe donc en encodage RFC 3986 strict. Sans effet sur les noms sans
# caractère spécial ; le proxy décode de toute façon côté serveur.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

UTILS="apps/web/src/features/finder-adapters/cloudinary/utils.ts"
test -f "$UTILS" || { echo "✗ $UTILS introuvable — lance depuis la racine."; exit 1; }

if grep -q "encodeSegment" "$UTILS"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("apps/web/src/features/finder-adapters/cloudinary/utils.ts")
src = p.read_text(encoding="utf-8")

OLD = """  const encoded = source.publicId
    .split('/')
    .map(encodeURIComponent)
    .join('/');"""

NEW = """  const encoded = source.publicId
    .split('/')
    .map(encodeSegment)
    .join('/');"""

n = src.count(OLD)
assert n == 1, f"ancre getMediaUrl trouvee {n}x, attendu 1"
src = src.replace(OLD, NEW)

HELPER = '''
/**
 * Encodage RFC 3986 d'un segment de chemin.
 *
 * `encodeURIComponent` laisse littéraux six caractères — ( ) ! ' * ~ — qui
 * traversent alors le routage Next, la signature Cloudinary et le cache HTTP
 * sans garantie de traitement uniforme. On les encode explicitement : sans
 * effet sur les noms ordinaires, et sans risque puisque le serveur décode.
 */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*~]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}
'''

# Inséré juste avant getMediaUrl, à qui il sert.
marker = "export function getMediaUrl("
i = src.find(marker)
assert i != -1, "getMediaUrl introuvable"
# remonter au début du bloc de commentaire qui la précède
j = src.rfind("/**", 0, i)
insert_at = j if j != -1 else i
src = src[:insert_at] + HELPER.lstrip("\n") + "\n" + src[insert_at:]

p.write_text(src, encoding="utf-8")
print("  ✓ encodage RFC 3986 des segments d'URL")
PYEOF

echo
echo "→ contrôle"
grep -q "function encodeSegment" "$UTILS" && echo "  ✓ helper défini" || { echo "  ✗"; exit 1; }
grep -q "map(encodeSegment)" "$UTILS" && echo "  ✓ utilisé par getMediaUrl" || { echo "  ✗"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "fix(media): encodage RFC 3986 des segments d'URL (parentheses et apostrophes)"
echo "✓ commité."