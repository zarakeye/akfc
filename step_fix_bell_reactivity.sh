#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — La cloche : les deux moitiés manquantes
# ═══════════════════════════════════════════════════════════════════════════
#
#  Symptôme : le compteur ne bouge ni après un upload, ni après un changement
#  de statut. Rechargement de la page → il est juste.
#
#  Rien à voir avec le pliage. Deux mécanismes manquaient, chacun rendant
#  l'autre inutile :
#
#    1. La cloche n'est pas dans le cache react-query. `useEffect` + `useState`
#       + `trpcClient.query()` : UN fetch, au montage, et c'est tout. Aucun
#       `invalidate()` ne peut l'atteindre — même bien placé.
#
#    2. Personne n'invalide `getAttentionCounts`. Nulle part. Ni l'uploader
#       biblio, ni l'uploader perso, ni `useStatusChange`, ni `useNodeActions`.
#
#  Le handoff affirme pourtant : « NotificationBell est passée de trpcClient +
#  useState à useQuery → le cache react-query est la source unique, un
#  invalidate() suffit ». Ni l'un ni l'autre n'existait.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. La cloche passe à `useQuery` — elle entre dans le cache.
#   2. Les quatre endroits qui font bouger les compteurs les invalident.
#
#  ─── Pourquoi ces quatre-là ─────────────────────────────────────────────
#
#     DragNDropForm       upload biblio  → `pending` et `generalPending`
#     PersoPhotoUploader  upload perso   → `pending` et `persoPending`
#     useStatusChange     publier / jeter → tous
#     useNodeActions      jeter           → `pending` et `bin`
#
#  Restauration et purge depuis la corbeille bougent aussi `bin` — mais elles
#  vivent dans `useTrashActions`, qui a son propre cache et ses propres
#  invalidations. À traiter séparément si le besoin se confirme.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  USAGE
#  -----
#     bash step_fix_bell_reactivity.sh
#     AKFC_APPLY_ONLY=1 bash step_fix_bell_reactivity.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — la cloche : useQuery + les invalidations manquantes"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

BELL="apps/web/src/features/app-shell/NotificationBell.tsx"
[ -f "$BELL" ] || { echo "✗ Fichier introuvable : $BELL"; exit 1; }

if grep -q "getAttentionCounts.useQuery" "$BELL"; then
  echo "✓ Déjà appliqué (la cloche est sur useQuery)."
  exit 0
fi

python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

BELL = "apps/web/src/features/app-shell/NotificationBell.tsx"
FC = "apps/web/src/features/finder-core"

# ── 1. La cloche entre dans le cache ─────────────────────────────────────
sub_once(BELL,
'''import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { Bell, HardDrive } from "lucide-react";

import { trpcClient } from "@trpc/trpcClient";''',
'''import { type JSX } from "react";
import Link from "next/link";
import { Bell, HardDrive } from "lucide-react";

import { trpc } from "@trpc/trpcClient";''',
    "cloche — imports")

sub_once(BELL,
'''/**
 * La forme de `storage.getAttentionCounts`, DÉRIVÉE de la procédure.
 *
 * Elle était écrite à la main — `{ pending: number; bin: number }` — et n'a
 * pas suivi quand le backend a gagné `generalPending` et `persoPending`. Le
 * corps du composant les lisait déjà : `pnpm typecheck` restait rouge sans
 * que rien ne pointe vers la cause, l'annotation étant syntaxiquement
 * irréprochable.
 *
 * Dérivée, elle ne peut plus décrocher : ajouter un champ à la procédure le
 * rend disponible ici, en retirer un fait échouer les lectures à l'endroit
 * exact où elles se font.
 */
type AttentionCounts = Awaited<
  ReturnType<typeof trpcClient.storage.getAttentionCounts.query>
>;

export function NotificationBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const [counts, setCounts] = useState<AttentionCounts | null>(null);

  const canSee = (user?.role?.permissions.length ?? 0) > 0;

  useEffect(() => {
    if (!canSee) return;
    let cancelled = false;
    void trpcClient.storage.getAttentionCounts.query().then((data) => {
      if (!cancelled) setCounts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [canSee]);

  if (!canSee) return null;''',
'''export function NotificationBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const canSee = (user?.role?.permissions.length ?? 0) > 0;

  // ─── Pourquoi useQuery et pas useEffect + useState ──────────────────────
  //
  // Ce composant faisait UN fetch au montage, dans un `useEffect([canSee])`,
  // et stockait le résultat dans un `useState`. Il ne se rafraîchissait donc
  // jamais : ni après un upload, ni après une publication. Il fallait
  // recharger la page pour voir un compteur juste.
  //
  // Et surtout, il était HORS du cache react-query. Un `invalidate()` posé
  // au bon endroit n'aurait rien fait — il n'avait rien à invalider. Les
  // deux moitiés du mécanisme manquaient, chacune rendant l'autre inutile.
  //
  // Avec `useQuery`, le cache devient la source unique : les quatre endroits
  // qui font bouger les compteurs (les deux uploaders, `useStatusChange`,
  // `useNodeActions`) invalident, et la cloche suit — sans rien savoir d'eux.
  //
  // Le type vient de la procédure, il n'y a plus rien à écrire à la main.
  // L'annotation précédente disait `{ pending, bin }` alors que le backend
  // en renvoyait quatre depuis un moment.
  const { data: counts } = trpc.storage.getAttentionCounts.useQuery(undefined, {
    enabled: canSee,
  });

  if (!canSee) return null;''',
    "cloche — useQuery")

# ── 2. Les invalidations ─────────────────────────────────────────────────
sub_once(f"{FC}/hooks/useStatusChange.ts",
"""            logical: true,
          });
          utils.trash.listBin.invalidate();""",
"""            logical: true,
          });
          utils.trash.listBin.invalidate();
          utils.storage.getAttentionCounts.invalidate();""",
    "useStatusChange → bin : invalide les compteurs")

sub_once(f"{FC}/hooks/useNodeActions.ts",
"""          sources,
          logical: true,
        });""",
"""          sources,
          logical: true,
        });
        utils.storage.getAttentionCounts.invalidate();""",
    "useNodeActions → bin : invalide les compteurs")
PYEOF

# ── 3. useStatusChange : la branche pending ↔ published ──────────────────
python3 - <<'PYEOF'
import io, re

p = "apps/web/src/features/finder-core/hooks/useStatusChange.ts"
with io.open(p, encoding="utf-8") as f:
    s = f.read()

# La branche non-bin appelle adapter.moveItems ; on invalide juste après.
anchor = "          await adapter.moveItems({"
assert s.count(anchor) == 1, "[useStatusChange] ancre moveItems introuvable"
start = s.index(anchor)
end = s.index("});", s.index("target:", start)) + 3
s = (
    s[:end]
    + "\n          // Publier ou dépublier fait bouger `pending` (et, selon la zone,\n"
    + "          // `generalPending` / `persoPending`). La cloche est dans le cache\n"
    + "          // depuis sa migration `useQuery` : un invalidate suffit.\n"
    + "          utils.storage.getAttentionCounts.invalidate();"
    + s[end:]
)
with io.open(p, "w", encoding="utf-8") as f:
    f.write(s)
print("  ✓ useStatusChange → publier/dépublier : invalide les compteurs")
PYEOF

# ── 4. Les deux uploaders ────────────────────────────────────────────────
python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

sub_once("apps/web/src/features/admin/perso/PersoPhotoUploader.tsx",
    "      await utils.storage.getPersoPhotoQuota.invalidate();",
    "      await utils.storage.getPersoPhotoQuota.invalidate();\n"
    "      // Un dépôt perso alimente `pending` et `persoPending`.\n"
    "      await utils.storage.getAttentionCounts.invalidate();",
    "PersoPhotoUploader — invalide les compteurs")

DND = "apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
with io.open(DND, encoding="utf-8") as f:
    s = f.read()

anchor = "  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);"
assert s.count(anchor) == 1, "[DragNDropForm] ancre reloadFolderContent introuvable"
s = s.replace(anchor, anchor + "\n  const utils = trpc.useUtils();", 1)

anchor = "        reloadFolderContent();"
assert s.count(anchor) == 1, "[DragNDropForm] ancre reloadFolderContent() introuvable"
s = s.replace(
    anchor,
    anchor
    + "\n        // Un dépôt biblio alimente `pending`, et `generalPending` si la\n"
    + "        // destination est le dossier « général ».\n"
    + "        void utils.storage.getAttentionCounts.invalidate();",
    1,
)
with io.open(DND, "w", encoding="utf-8") as f:
    f.write(s)
print("  ✓ DragNDropForm — invalide les compteurs")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "fix(app-shell): la cloche se rafraîchit enfin

Le compteur ne bougeait ni après un upload, ni après un changement de statut.
Il fallait recharger la page. Deux mécanismes manquaient, chacun rendant
l'autre inutile :

- NotificationBell faisait UN fetch au montage (useEffect + useState +
  trpcClient.query) et vivait donc HORS du cache react-query. Un invalidate()
  posé au bon endroit n'aurait rien fait : il n'avait rien à invalider.
- personne n'invalidait getAttentionCounts. Nulle part.

Le handoff de la session précédente affirmait pourtant que la migration
useQuery était faite et qu'un invalidate() suffisait. Ni l'un ni l'autre
n'existait.

- la cloche passe à useQuery : le cache devient la source unique, et le type
  vient de la procédure — plus rien à écrire à la main.
- les quatre endroits qui font bouger les compteurs les invalident :
  DragNDropForm (upload biblio), PersoPhotoUploader (upload perso),
  useStatusChange (publier / jeter), useNodeActions (jeter).

Restauration et purge bougent aussi bin, mais vivent dans useTrashActions,
avec son propre cache. À traiter séparément si le besoin se confirme.

Sans rapport avec le chantier « arbre sans strate de statut » : le bug est
antérieur, et se reproduit à l'identique avec logical baissé."

echo "✅ Cloche réparée, typechecké et commité."