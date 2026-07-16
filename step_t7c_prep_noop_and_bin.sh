#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T7c-prep : deux trous découverts en préparant la bascule
# ═══════════════════════════════════════════════════════════════════════════
#
#  ─── Trou 1 : aucune garde no-op dans le pipeline de move ───────────────
#
#  `executeMoveOperations` boucle et appelle `adapter.move(op)`. Rien ne
#  filtre une opération dont la source ET la cible sont le même chemin.
#
#  Aujourd'hui c'est marginal (sélection mixte + clic sur le statut déjà
#  porté par une partie des items). Après la bascule, ça devient SYSTÉMATIQUE :
#
#      publier le dossier logique AKFC/cours/x
#        → toPhysicalMoveIntents émet une intention par strate occupée
#        → intention 1 : AKFC/pending/cours/x    → published   ✅ déplace
#        → intention 2 : AKFC/published/cours/x  → published   ⚠️  X → X
#
#  La seconde est un rename sur soi-même. Cloudinary la refuse, l'exception
#  remonte, et TOUTE la publication échoue — y compris la partie qui avait du
#  sens.
#
#  Une opération dont la source est déjà à destination n'a rien à faire. Ce
#  n'est pas un contournement du pliage : c'est vrai dans tous les cas, en
#  logique comme en physique.
#
#  ─── Trou 2 : deux appelants de trashToBin oubliés par T7a ──────────────
#
#      Breadcrumb.tsx:135        drop sur la racine du bin depuis le fil d'Ariane
#      FinderTreeFolder.tsx:283  drop sur la racine du bin depuis l'arbre
#
#  Ils envoient `fullPath: it.path` — le chemin LOGIQUE d'un `DragItem` après
#  la bascule. T7a n'avait corrigé que `useStatusChange` et `useNodeActions` ;
#  je n'avais pas cherché les appelants de la mutation, seulement ceux des
#  hooks. `DragItem` porte déjà `storagePath` depuis T7a — il suffit de le lire.
#
#  INERTE : le filtre no-op ne retire que des opérations sans effet, et
#  `it.storagePath` est `undefined` tant que `logical` est baissé.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  PRÉREQUIS : T4 (procédure move) et T7a (DragItem.storagePath).
#
#  USAGE
#  -----
#     bash step_t7c_prep_noop_and_bin.sh
#     AKFC_APPLY_ONLY=1 bash step_t7c_prep_noop_and_bin.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T7c-prep : garde no-op + deux appelants de trashToBin (inerte)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

R="packages/backend/src/modules/storage/router.ts"
grep -q "toPhysicalMoveIntents" "$R" || { echo "✗ T4 n'est pas appliqué."; exit 1; }
grep -q "storagePath" apps/web/src/features/finder-core/dnd/payload.ts \
  || { echo "✗ T7a n'est pas appliqué (DragItem.storagePath absent)."; exit 1; }

if grep -q "effectiveOperations" "$R"; then
  echo "✓ Déjà appliqué (garde no-op présente)."
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

R = "packages/backend/src/modules/storage/router.ts"
C = "apps/web/src/features/finder-core/components"

# ── 1. La garde no-op ────────────────────────────────────────────────────
sub_once(R,
"""      const operations = plans.flat();

      await assertOperationsDontUnpublishReferencedAssets(""",
"""      // ─── Une opération sur place n'est pas une opération ───────────
      //
      // Rien en aval ne filtre `{ source: X, target: X }` : `adapter.move`
      // partirait renommer un objet sur lui-même, le provider refuserait, et
      // l'exception ferait échouer TOUT le geste — y compris sa partie utile.
      //
      // Le cas devient courant avec le pliage : publier un dossier logique
      // émet une intention par strate occupée, et celle qui vit DÉJÀ dans la
      // strate cible se résout en X → X. Elle n'a simplement rien à faire.
      //
      // Le filtre est posé AVANT les gardes, pour qu'elles ne raisonnent que
      // sur des opérations réelles — une opération sur place ne dépublie
      // rien, elle n'a donc pas à peser dans leur verdict. Et il est posé
      // avant `return { operations }` : l'appelant reçoit ce qui a bougé, pas
      // ce qu'on a envisagé.
      const effectiveOperations = plans
        .flat()
        .filter((operation) => operation.source.path !== operation.target.path);

      await assertOperationsDontUnpublishReferencedAssets(""",
    "router.move — garde no-op")

sub_once(R,
"""      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        operations,
        ctx.appRoot,
      );

      // Exécution séquentielle, comme avant : Cloudinary n'aime pas les
      // opérations concurrentes sur des préfixes voisins.
      await executeMoveOperations(adapter, operations);

      return { operations };""",
"""      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        effectiveOperations,
        ctx.appRoot,
      );

      // Exécution séquentielle, comme avant : Cloudinary n'aime pas les
      // opérations concurrentes sur des préfixes voisins.
      await executeMoveOperations(adapter, effectiveOperations);

      return { operations: effectiveOperations };""",
    "router.move — gardes et exécution sur les opérations effectives")

# ── 2. Les deux appelants oubliés ────────────────────────────────────────
sub_once(f"{C}/Breadcrumb.tsx",
"""            sources: items.map((it) => ({
              kind: it.type === 'folder' ? ('folder' as const) : ('file' as const),
              fullPath: it.path,
            })),""",
"""            sources: items.map((it) => ({
              kind: it.type === 'folder' ? ('folder' as const) : ('file' as const),
              // Le LOCALISATEUR, pas le chemin logique : `trash.trashToBin`
              // met en quarantaine un binaire, pas une vue. Un dossier n'en
              // porte pas (il vit dans 1..N strates) — c'est le backend qui
              // résout, cf. `resolvePhysicalLocations`.
              fullPath: it.storagePath ?? it.path,
            })),""",
    "Breadcrumb — drop sur le bin par localisateur")

sub_once(f"{C}/FinderTreeFolder.tsx",
"""          sources: items.map((it) => ({
            kind:
              it.type === "folder" ? ("folder" as const) : ("file" as const),
            fullPath: it.path,
          })),""",
"""          sources: items.map((it) => ({
            kind:
              it.type === "folder" ? ("folder" as const) : ("file" as const),
            // Le LOCALISATEUR, pas le chemin logique : `trash.trashToBin`
            // met en quarantaine un binaire, pas une vue. Un dossier n'en
            // porte pas (il vit dans 1..N strates) — c'est le backend qui
            // résout, cf. `resolvePhysicalLocations`.
            fullPath: it.storagePath ?? it.path,
          })),""",
    "FinderTreeFolder — drop sur le bin par localisateur")
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
git commit -m "fix(storage): une opération de move sur place n'est pas une opération

Rien ne filtrait { source: X, target: X } : adapter.move partait renommer un
objet sur lui-même, le provider refusait, et l'exception faisait échouer TOUT
le geste — y compris sa partie utile.

Marginal aujourd'hui (sélection mixte + clic sur un statut déjà porté par une
partie des items). Systématique après la bascule du finder : publier un
dossier logique émet une intention par strate occupée, et celle qui vit déjà
dans la strate cible se résout en X -> X.

Le filtre est posé avant les gardes : une opération sur place ne dépublie
rien, elle n'a pas à peser dans leur verdict. Et avant le retour : l'appelant
reçoit ce qui a bougé, pas ce qu'on a envisagé.

Complète au passage la balayage de T7a : Breadcrumb et FinderTreeFolder
appellent trash.trashToBin sur un drop vers la racine du bin et envoyaient
encore it.path. T7a n'avait corrigé que useStatusChange et useNodeActions —
j'avais cherché les appelants des hooks, pas ceux de la mutation. DragItem
porte storagePath depuis T7a, il suffisait de le lire.

Inerte : le filtre ne retire que des opérations sans effet, et it.storagePath
est undefined tant que logical est baissé."

echo "✅ T7c-prep appliqué, typechecké et commité."