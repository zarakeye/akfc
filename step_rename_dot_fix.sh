#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FIX CRITIQUE — un point DANS le nom était pris pour un séparateur d'extension.
#
# Exemple réel : « CNI recto PORQUET (ep. BAZZE) Yvonne Louise Julie »
#   - `baseNameOf` coupait au dernier point  → champ d'édition tronqué à
#     « CNI recto PORQUET (ep »
#   - la procédure `rename` en déduisait l'extension « . BAZZE) Yvonne Louise
#     Julie » et la RÉAPPLIQUAIT → le renommage aurait mutilé le fichier.
#
# Deux règles pour y remédier :
#
#   CLIENT — on connaît `meta.format`, source autoritaire. La base est le nom
#   privé de ce suffixe s'il est présent ; sinon le nom EST déjà la base. Plus
#   aucune devinette sur les points.
#
#   SERVEUR — le format n'est pas transmis, mais un suffixe n'est une extension
#   que s'il en a la forme : 1 à 8 caractères alphanumériques, sans espace.
#   « .jpg » oui ; « . BAZZE) Yvonne Louise Julie » non.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FT="apps/web/src/features/finder-core/utils/fileType.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

for f in "$FT" "$ROUTER" "$GRID" "$TREE"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done
grep -q "baseNameOf" "$FT" || { echo "✗ baseNameOf absent — le renommage n'est pas en place."; exit 1; }

if grep -q "EXTENSION_PATTERN" "$ROUTER"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

FT = "apps/web/src/features/finder-core/utils/fileType.ts"
ROUTER = "packages/backend/src/modules/storage/router.ts"
GRID = "apps/web/src/features/finder-core/components/GridItem.tsx"
TREE = "apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

# ── 1) baseNameOf : s'appuyer sur `format`, pas sur le dernier point ────────
edit(FT,
     """/** Nom sans son extension — ce que l'utilisateur édite lors d'un renommage. */
export function baseNameOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
}""",
     """/**
 * Nom sans son extension — ce que l'utilisateur édite lors d'un renommage.
 *
 * ⚠️ On NE coupe PAS au dernier point : un nom peut légitimement en contenir
 * (« CNI recto PORQUET (ep. BAZZE) Yvonne »), et couper là tronquerait le
 * nom. On retire uniquement le suffixe `.{format}` quand `format` — la
 * source autoritaire, issue du metadata — est connu et présent en fin de nom.
 */
export function baseNameOf(
  name: string,
  format?: string | null,
): string {
  if (format) {
    const suffix = `.${format.toLowerCase()}`;
    if (name.toLowerCase().endsWith(suffix)) {
      return name.slice(0, -suffix.length);
    }
    return name;
  }
  // Sans format : on ne retire un suffixe que s'il A LA FORME d'une extension
  // (1 à 8 caractères alphanumériques). Sinon le nom est déjà la base.
  const match = /\\.([A-Za-z0-9]{1,8})$/.exec(name);
  return match ? name.slice(0, -match[0].length) : name;
}""",
     "baseNameOf : plus de coupe au dernier point")

# ── 2) Les appelants passent le format ──────────────────────────────────────
edit(GRID,
     "initial={baseNameOf(node.name)}",
     "initial={baseNameOf(node.name, node.meta?.format)}",
     "grille : baseNameOf reçoit le format")

edit(TREE,
     "initial={baseNameOf(node.name)}",
     "initial={baseNameOf(node.name, node.meta?.format)}",
     "arbre : baseNameOf reçoit le format")

# Le hook compare la base courante : même correction.
edit("apps/web/src/features/finder-core/hooks/useNodeActions.ts",
     "if (clean === baseNameOf(node.name)) return null; // rien à faire",
     "if (clean === baseNameOf(node.name, node.meta?.format)) return null;",
     "hook : comparaison avec le format")

# ── 3) Backend : n'accepter comme extension que ce qui en a la forme ────────
edit(ROUTER,
     """      // Extension de la SOURCE, réappliquée telle quelle (voir doc ci-dessus).
      const dot = currentName.lastIndexOf(".");
      const extension = dot > 0 ? currentName.slice(dot) : "";""",
     """      // Extension de la SOURCE, réappliquée telle quelle.
      //
      // ⚠️ Un point dans un nom n'est PAS forcément un séparateur
      // d'extension : « CNI recto PORQUET (ep. BAZZE) Yvonne » en contient
      // un. Couper au dernier point produirait une pseudo-extension
      // « . BAZZE) Yvonne » et mutilerait le fichier au renommage. On
      // n'accepte donc qu'un suffixe AYANT LA FORME d'une extension.
      const extensionMatch = EXTENSION_PATTERN.exec(currentName);
      const extension = extensionMatch ? extensionMatch[0] : "";""",
     "backend : détection prudente de l'extension")

edit(ROUTER,
     'import { TRPCError } from "@trpc/server";',
     '''import { TRPCError } from "@trpc/server";

/**
 * Ce qui compte comme extension en fin de nom : 1 à 8 caractères
 * alphanumériques. Exclut les points internes d'un libellé (« (ep. BAZZE) »).
 */
const EXTENSION_PATTERN = /\\.[A-Za-z0-9]{1,8}$/;''',
     "backend : motif d'extension")
PYEOF

echo
echo "→ contrôle"
grep -q "EXTENSION_PATTERN" "$ROUTER" && echo "  ✓ motif backend" || { echo "  ✗"; exit 1; }
grep -q "format?: string | null" "$FT" && echo "  ✓ baseNameOf paramétré" || { echo "  ✗"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "fix(finder): un point dans un nom n'est plus pris pour un separateur d'extension"
echo "✓ commité."