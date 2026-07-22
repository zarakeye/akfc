#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# TREE VIEW — distinction visuelle du statut + badge play sur les vidéos.
#
#   1) PASTILLE BICOLORE. Jusqu'ici seul « en attente » était marqué (point
#      orange) : « publié » se déduisait d'une absence, ce qui ne se lit pas.
#      Désormais les DEUX états portent une pastille — orange (en attente) /
#      verte (publié) — et les « en attente » sont légèrement estompés pour
#      que les publiés (les sélectionnables dans le picker) ressortent.
#      Possible seulement depuis que le listing rapatrie `MediaAsset.status`.
#
#   2) BADGE PLAY sur les vignettes vidéo, pour ne plus les confondre avec des
#      images. Les vignettes passent de 16px à 20px pour lui laisser la place ;
#      les icônes suivent, par cohérence de gabarit.
#
# Si 20px te paraît trop gros, c'est une classe à changer : `h-5 w-5` → `h-4 w-4`.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
test -f "$TREE" || { echo "✗ $TREE introuvable — lance depuis la racine."; exit 1; }
grep -q "function TreeFileVisual" "$TREE" || { echo "✗ TreeFileVisual absent (UX1 pas appliqué)."; exit 1; }

if grep -q "isPublished" "$TREE"; then
  echo "→ déjà appliqué (pastille bicolore présente), rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib, re

p = pathlib.Path("apps/web/src/features/finder-core/components/FinderTreeFile.tsx")
src = p.read_text(encoding="utf-8")

def sub(old, new, label, count=1):
    global src
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    src = src.replace(old, new)
    print(f"  ✓ {label}")

# ── 1) import Play ──────────────────────────────────────────────────────────
m = re.search(r"import \{ ([^}]*) \} from 'lucide-react';", src)
assert m, "import lucide introuvable"
if "Play" not in m.group(1):
    src = src.replace(m.group(0), f"import {{ {m.group(1).rstrip()}, Play }} from 'lucide-react';", 1)
    print("  ✓ import Play")

# ── 2) statut : pending ET published ────────────────────────────────────────
sub("""  const isPending = statusOf(node) === 'pending';""",
    """  const status = statusOf(node);
  const isPending = status === 'pending';
  const isPublished = status === 'published';""",
    "calcul du statut (2 états)")

# ── 3) vignette image : 20px ────────────────────────────────────────────────
sub("""      <img
        src={url}
        alt={node.name}
        className="h-4 w-4 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />""",
    """      <img
        src={url}
        alt={node.name}
        className="h-5 w-5 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />""",
    "vignette image 20px")

# ── 4) vignette vidéo : 20px + badge play ───────────────────────────────────
sub("""      <img
        src={videoThumb}
        alt={node.name}
        className="h-4 w-4 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />""",
    """      <span className="relative inline-flex h-5 w-5 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={videoThumb}
          alt={node.name}
          className="h-5 w-5 rounded-sm object-cover"
          onError={() => setImgFailed(true)}
        />
        {/* Badge play : distingue une vidéo d'une image au premier coup d'œil. */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-black/55">
            <Play className="h-2 w-2 text-white fill-white translate-x-[0.5px]" />
          </span>
        </span>
      </span>""",
    "vignette vidéo 20px + badge play")

# ── 5) icônes : même gabarit 20px ───────────────────────────────────────────
n_icons = src.count('className="h-4 w-4 shrink-0')
assert n_icons >= 3, f"attendu >=3 icones h-4, trouve {n_icons}"
src = src.replace('className="h-4 w-4 shrink-0', 'className="h-5 w-5 shrink-0')
print(f"  ✓ {n_icons} icônes alignées sur 20px")

# ── 6) pastille bicolore + estompage ────────────────────────────────────────
sub("""  if (!isPending) return inner;

  // Statut « en attente » : point orange en surimpression.
  return (
    <span className="relative inline-flex shrink-0">
      {inner}
      <span
        className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-orange-400 ring-1 ring-white"
        aria-label="En attente"
      />
    </span>
  );""",
    """  // Statut inconnu (ou corbeille) : pas de pastille, rendu nu.
  if (!isPending && !isPublished) return inner;

  // Les DEUX états sont marqués — « publié » ne se déduit plus d'une absence.
  // Les « en attente » sont estompés pour que les publiés ressortent.
  return (
    <span className="relative inline-flex shrink-0">
      <span className={clsx('inline-flex', isPending && 'opacity-60')}>
        {inner}
      </span>
      <span
        className={clsx(
          'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-white',
          isPending ? 'bg-orange-400' : 'bg-emerald-500',
        )}
        aria-label={isPending ? 'En attente' : 'Publié'}
      />
    </span>
  );""",
    "pastille bicolore + estompage")

p.write_text(src, encoding="utf-8")
PYEOF

echo
echo "→ contrôle"
grep -q "isPublished" "$TREE" && echo "  ✓ deux états gérés" || { echo "  ✗"; exit 1; }
grep -q "bg-emerald-500" "$TREE" && echo "  ✓ pastille publiée" || { echo "  ✗"; exit 1; }
grep -q "Play className" "$TREE" && echo "  ✓ badge play vidéo" || { echo "  ✗"; exit 1; }
grep -q "clsx" "$TREE" && echo "  ✓ clsx disponible" || { echo "  ⚠ clsx à importer manuellement"; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): pastille de statut bicolore et badge play dans la tree"
echo "✓ commité."