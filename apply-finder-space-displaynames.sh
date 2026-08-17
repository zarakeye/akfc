#!/usr/bin/env bash
#
# AKFC — Finder : nom d'affichage EXACT des dossiers d'espace (groupe / perso),
# résolu côté backend (remplace la version frontend « slug » précédente).
#
#   - Backend : query `storage.spaceDisplayNames` → map `cuid → nom exact`
#     (noms de groupes toujours ; noms d'utilisateurs = espaces perso, réservés
#     aux ADMINS pour la confidentialité).
#   - Front : util `friendlySpaceFolderLabel(name, path, map?)` → pour une racine
#     d'espace, renvoie le nom exact de la map (repli : slug sans cuid,
#     titre-casé). Consommé au rendu ARBRE (FinderTreeFolder) et GRILLE
#     (GridItem), via la query (cache react-query, dédupliquée).
#
# Idiomatique (le finder fait déjà pareil avec le `trashMap`). Front NON testé
# → valider à l'écran. Pas de migration. Ne PAS avoir appliqué l'ancien
# `apply-finder-space-friendly-names.sh` (celui-ci le remplace).
#
# Usage : bash apply-finder-space-displaynames.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-space-displaynames.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
UTIL="apps/web/src/features/finder-core/utils/spaceFolderLabel.ts"
TREE="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

for f in "package.json" "$ROUTER" "$TREE" "$GRID"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── util (réécrit : version exacte avec map) ────────────────────────────────
cat > "$UTIL" <<'TS'
/**
 * Étiquette conviviale des dossiers d'ESPACE (groupe / perso) du finder.
 *
 * Chemin d'un espace : `${appRoot}/groups|persos/<slug>-<cuid>` (cuid = id DB,
 * garant d'unicité/stabilité au renommage). Illisible tel quel. On affiche le
 * nom EXACT (résolu par le backend via `storage.spaceDisplayNames`, indexé par
 * cuid) ; à défaut (map absente), on retire le cuid et on titre-case le slug.
 *
 * Renvoie `null` si le dossier n'est PAS une racine d'espace (sous-dossiers,
 * dossiers ordinaires) → l'appelant garde `node.name`.
 */
const CUID_RE = /-(c[a-z0-9]{24})$/;
const SPACE_ROOT_PATH = /\/(groups|persos)\/[^/]+$/;

function slugFallback(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function friendlySpaceFolderLabel(
  name: string,
  path: string,
  displayNames?: Record<string, string>,
): string | null {
  if (!SPACE_ROOT_PATH.test(path)) return null;
  const m = name.match(CUID_RE);
  if (!m) return null;
  const exact = displayNames?.[m[1]];
  if (exact) return exact;
  return slugFallback(name.replace(CUID_RE, ""));
}
TS
echo "util (ré)écrit : $UTIL"

# ── backend : query spaceDisplayNames ───────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "spaceDisplayNames" in s:
    print("router storage déjà à jour"); sys.exit(0)

OLD = ("export const storageRouter = router({\n"
       "  /* ====================================================================== */\n"
       "  /*  Lecture (inchangé)                                                    */\n"
       "  /* ====================================================================== */")
NEW = ("export const storageRouter = router({\n"
       "  /**\n"
       "   * Noms d'affichage EXACTS des espaces (groupe / perso), indexés par cuid.\n"
       "   * Permet au finder d'afficher « Administrateurs » au lieu de\n"
       "   * « administrateurs-<cuid> ». Noms de groupes : toujours ; noms\n"
       "   * d'utilisateurs (espaces perso) : réservés aux admins (confidentialité).\n"
       "   */\n"
       "  spaceDisplayNames: protectedProcedure.query(async ({ ctx }) => {\n"
       "    const map: Record<string, string> = {};\n"
       "\n"
       "    const groups = await ctx.prisma.memberGroup.findMany({\n"
       "      select: { id: true, name: true },\n"
       "    });\n"
       "    for (const g of groups) map[g.id] = g.name;\n"
       "\n"
       "    const me = await ctx.prisma.user.findUnique({\n"
       "      where: { id: ctx.user.id },\n"
       "      select: { role: { select: { name: true } } },\n"
       "    });\n"
       "    if (me?.role?.name === \"ADMIN\") {\n"
       "      const users = await ctx.prisma.user.findMany({\n"
       "        select: {\n"
       "          id: true,\n"
       "          firstName: true,\n"
       "          lastName: true,\n"
       "          pseudo: true,\n"
       "          email: true,\n"
       "        },\n"
       "      });\n"
       "      for (const u of users) {\n"
       "        const full = [u.firstName, u.lastName].filter(Boolean).join(\" \").trim();\n"
       "        map[u.id] = full || u.pseudo || u.email;\n"
       "      }\n"
       "    }\n"
       "\n"
       "    return map;\n"
       "  }),\n"
       "\n"
       "  /* ====================================================================== */\n"
       "  /*  Lecture (inchangé)                                                    */\n"
       "  /* ====================================================================== */")
assert s.count(OLD) == 1, "ancre ouverture storageRouter introuvable"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8")
print("router storage patché (spaceDisplayNames)")
PY

# ── FinderTreeFolder (arbre) ────────────────────────────────────────────────
python3 - "$TREE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "friendlySpaceFolderLabel" in s:
    print("FinderTreeFolder déjà à jour"); sys.exit(0)

IMP_OLD = 'import { useFinderStore } from "@features/finder-core/state/useFinderStore";'
IMP_NEW = (IMP_OLD + "\n"
           'import { friendlySpaceFolderLabel } from "@features/finder-core/utils/spaceFolderLabel";')
assert s.count(IMP_OLD) == 1, "ancre import (tree) introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

Q_OLD = "  const trashToBinMutation = trpc.trash.trashToBin.useMutation();"
Q_NEW = (Q_OLD + "\n"
         "  const { data: spaceDisplayNames } = trpc.storage.spaceDisplayNames.useQuery();")
assert s.count(Q_OLD) == 1, "ancre hook (tree) introuvable"
s = s.replace(Q_OLD, Q_NEW)

L_OLD = "  let displayLabel = node.name;"
L_NEW = "  let displayLabel = friendlySpaceFolderLabel(node.name, node.path, spaceDisplayNames) ?? node.name;"
assert s.count(L_OLD) == 1, "ancre displayLabel (tree) introuvable"
s = s.replace(L_OLD, L_NEW)

p.write_text(s, encoding="utf-8")
print("FinderTreeFolder patché")
PY

# ── GridItem (grille) ───────────────────────────────────────────────────────
python3 - "$GRID" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "friendlySpaceFolderLabel" in s:
    print("GridItem déjà à jour"); sys.exit(0)

IMP_OLD = "import { getFileExtension, isAudioFile, isPdfFile, videoPosterUrl, isTextFile, displayName, baseNameOf } from '@features/finder-core/utils/fileType';"
IMP_NEW = (IMP_OLD + "\n"
           "import { trpc } from '@trpc/trpcClient';\n"
           "import { friendlySpaceFolderLabel } from '@features/finder-core/utils/spaceFolderLabel';")
assert s.count(IMP_OLD) == 1, "ancre import (grid) introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

Q_OLD = "  const [imgFailed, setImgFailed] = useState(false);"
Q_NEW = (Q_OLD + "\n"
         "  const { data: spaceDisplayNames } = trpc.storage.spaceDisplayNames.useQuery();")
assert s.count(Q_OLD) == 1, "ancre hook (grid) introuvable"
s = s.replace(Q_OLD, Q_NEW)

L_OLD = "            {displayName(node.name, node.meta?.format)}"
L_NEW = ("            {isFolder\n"
         "              ? friendlySpaceFolderLabel(node.name, node.path, spaceDisplayNames) ?? node.name\n"
         "              : displayName(node.name, node.meta?.format)}")
assert s.count(L_OLD) == 1, "ancre label (grid) introuvable"
s = s.replace(L_OLD, L_NEW)

p.write_text(s, encoding="utf-8")
print("GridItem patché")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(finder): displayName exact des espaces (query spaceDisplayNames + rendu tree/grid)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : arbre + grille affichent le nom exact (« Administrateurs », « Bureau »)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi