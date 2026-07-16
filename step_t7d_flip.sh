#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T7d : LA BASCULE
# ═══════════════════════════════════════════════════════════════════════════
#
#  Huit `logical: true`, et rien d'autre. Aucune logique, aucun renommage,
#  aucun refactor — pour que `git revert` de ce commit soit chirurgical et
#  ramène à l'état inerte que tu viens de valider.
#
#  Ce que ça change à l'écran :
#
#     AVANT                        APRÈS
#     AKFC                         AKFC
#     ├── pending                  ├── cours
#     │   └── cours                │   └── tchoy-lee-fut
#     │       └── tchoy-lee-fut    │       ├── photo-1  ← badge « En attente »
#     │           └── photo-1      │       └── photo-2
#     ├── published                ├── general
#     │   └── cours                └── bin
#     │       └── tchoy-lee-fut
#     │           └── photo-2
#     ├── general
#     └── bin
#
#  Le statut ne disparaît pas : il redevient une métadonnée. Badge sur les
#  tuiles, colonne en vue tableau, radios — tout ça lit `MediaAsset.status`
#  depuis l'étape S1 et continue de marcher. Ce qui disparaît, c'est le
#  statut comme LIEU.
#
#  ─── Les huit sites ─────────────────────────────────────────────────────
#
#     finderStorage.adapter   getTree ×2 (list + getTree), move ×1
#     useFinderSearch         searchRecursive ×1
#     trashToBin              useStatusChange, useNodeActions,
#                             Breadcrumb, FinderTreeFolder
#
#  `getMetadata` n'y est PAS, et c'est voulu : le front lui passe déjà un
#  `storagePathOf(node)`, donc un chemin physique. Il n'a rien à plier.
#
#  ─── Le flag est indivisible ────────────────────────────────────────────
#
#  Lire en plié et écrire en physique (ou l'inverse) est incohérent : les
#  chemins qui remontent d'une lecture pliée sont logiques, et le pipeline
#  d'écriture ne sait travailler qu'en physique. C'est pour ça que les huit
#  partent ensemble.
#
#  ─── Le retour arrière ──────────────────────────────────────────────────
#
#     git revert HEAD
#
#  Rien à défaire côté DB : aucun binaire n'a bougé, aucune migration n'a
#  tourné. Le pliage est une VUE. C'est toute la thèse de ce chantier.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  PRÉREQUIS : T7c-prep (garde no-op + les deux appelants du bin).
#
#  USAGE
#  -----
#     bash step_t7d_flip.sh
#     AKFC_APPLY_ONLY=1 bash step_t7d_flip.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T7d : LA BASCULE (huit logical: true)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

grep -q "effectiveOperations" packages/backend/src/modules/storage/router.ts \
  || { echo "✗ T7c-prep n'est pas appliqué (garde no-op absente)."; exit 1; }
grep -q "export function statusOf" apps/web/src/features/finder-core/utils/statusFolders.ts \
  || { echo "✗ T7b n'est pas appliqué (statusOf absent)."; exit 1; }

if grep -rq "logical: true" apps/web/src 2>/dev/null; then
  echo "✓ Déjà appliqué (logical: true présent côté front)."
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

A = "apps/web/src/features/finder-adapters/cloudinary/finderStorage.adapter.ts"
FC = "apps/web/src/features/finder-core"

# ── 1. adapter.list ──────────────────────────────────────────────────────
sub_once(A,
"""    const { root } = await trpcClient.storage.getTree.query({
      path: options.path,
      depth: 1,
    });""",
"""    // ─── Vue LOGIQUE ────────────────────────────────────────────────
    //
    // Le nœud `AKFC/cours/x` fusionne les physiques `AKFC/pending/cours/x`
    // et `AKFC/published/cours/x`. Le statut cesse d'être un lieu et
    // redevient une métadonnée (`meta.status`, cf. `statusOf`).
    //
    // Les chemins qui ressortent d'ici sont donc LOGIQUES. Chaque fichier
    // porte son emplacement réel dans `meta.storagePath` — c'est lui, et
    // pas `path`, qu'attendent le provider et la DB (cf. `storagePathOf`).
    //
    // ⚠️ Ce flag est indivisible : lire en plié impose d'écrire en plié
    // (`move`, `trashToBin`, `searchRecursive`). Les mélanger enverrait des
    // chemins logiques à `resolveTargetPath`, qui lève.
    const { root } = await trpcClient.storage.getTree.query({
      path: options.path,
      depth: 1,
      logical: true,
    });""",
    "adapter.list")

# ── 2. adapter.getTree ───────────────────────────────────────────────────
sub_once(A,
"""    const { root } = await trpcClient.storage.getTree.query({
      path: options.path,
      depth: options.depth ?? 1,
    });""",
"""    const { root } = await trpcClient.storage.getTree.query({
      path: options.path,
      depth: options.depth ?? 1,
      logical: true,
    });""",
    "adapter.getTree")

# ── 3. adapter.moveItems ─────────────────────────────────────────────────
sub_once(A,
"""    await trpcClient.storage.move.mutate({
      intent: { source, target },
    });""",
"""    // Les sources sont des localisateurs (fichiers) ou des chemins logiques
    // de dossier ; la cible est logique. `toPhysicalMoveIntents` redescend le
    // tout dans l'espace physique, en émettant une intention par strate
    // réellement occupée, et en faisant hériter chaque cible de la strate de
    // sa source — un DnD réorganise, il ne publie pas.
    await trpcClient.storage.move.mutate({
      intent: { source, target },
      logical: true,
    });""",
    "adapter.moveItems")

# ── 4. useFinderSearch ───────────────────────────────────────────────────
sub_once(f"{FC}/hooks/useFinderSearch.ts",
"""          caseSensitive: flags.caseSensitive,
          wholeWord: flags.wholeWord,
          useRegex: flags.useRegex,
        });""",
"""          caseSensitive: flags.caseSensitive,
          wholeWord: flags.wholeWord,
          useRegex: flags.useRegex,
          // `currentPath` est désormais un chemin logique : sans ce flag, le
          // prefix ne matcherait aucun `MediaAsset.fullPath`, et les rares
          // résultats reviendraient en chemins physiques dans une grille qui
          // affiche du logique.
          logical: true,
        });""",
    "useFinderSearch")

# ── 5. useStatusChange → bin ─────────────────────────────────────────────
sub_once(f"{FC}/hooks/useStatusChange.ts",
"""              fullPath: storagePathOf(n),
            })),
          });
          utils.trash.listBin.invalidate();""",
"""              fullPath: storagePathOf(n),
            })),
            // Un DOSSIER n'a pas de localisateur unique (il vit dans 1..N
            // strates) : c'est le backend qui résout, contre le registre
            // `Folder`. Jeter `AKFC/cours/x` jette les deux copies.
            logical: true,
          });
          utils.trash.listBin.invalidate();""",
    "useStatusChange → bin")

# ── 6. useNodeActions → bin ──────────────────────────────────────────────
sub_once(f"{FC}/hooks/useNodeActions.ts",
"""        await trashToBinMutation.mutateAsync({
          appRoot: APP_ROOT,
          sources,
        });""",
"""        await trashToBinMutation.mutateAsync({
          appRoot: APP_ROOT,
          sources,
          logical: true,
        });""",
    "useNodeActions → bin")

# ── 7. Breadcrumb → drop sur le bin ──────────────────────────────────────
sub_once(f"{FC}/components/Breadcrumb.tsx",
"""              fullPath: it.storagePath ?? it.path,
            })),
          });""",
"""              fullPath: it.storagePath ?? it.path,
            })),
            logical: true,
          });""",
    "Breadcrumb → drop sur le bin")

# ── 8. FinderTreeFolder → drop sur le bin ────────────────────────────────
sub_once(f"{FC}/components/FinderTreeFolder.tsx",
"""            fullPath: it.storagePath ?? it.path,
          })),
        });""",
"""            fullPath: it.storagePath ?? it.path,
          })),
          logical: true,
        });""",
    "FinderTreeFolder → drop sur le bin")
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
git commit -m "feat(finder): bascule sur la vue logique — le statut n'est plus un lieu

Huit logical: true, et rien d'autre.

Le noeud AKFC/cours/x fusionne désormais les physiques AKFC/pending/cours/x
et AKFC/published/cours/x. Les strates disparaissent de l'arbre et du fil
d'Ariane. Le statut ne disparaît pas — il redevient ce qu'il aurait toujours
dû être, une métadonnée : badge sur les tuiles, colonne en vue tableau,
radios, tout lit MediaAsset.status et continue de marcher.

Les huit sites :
  finderStorage.adapter   getTree x2 (list + getTree), move x1
  useFinderSearch         searchRecursive x1
  trashToBin              useStatusChange, useNodeActions, Breadcrumb,
                          FinderTreeFolder

getMetadata n'y est pas : le front lui passe déjà un storagePathOf, donc un
chemin physique. Rien à plier.

Le flag est indivisible : lire en plié impose d'écrire en plié. Les chemins
qui remontent d'une lecture pliée sont logiques, et le pipeline d'écriture ne
sait travailler qu'en physique — les mélanger enverrait des chemins logiques
à resolveTargetPath, qui lève.

Retour arrière : git revert de ce seul commit. Rien à défaire côté DB — aucun
binaire n'a bougé, aucune migration n'a tourné. Le pliage est une VUE.

Ne fait PAS : publier reste un move (le binaire se déplace encore). C'est
l'étape 3 du chantier, et elle devient enfin possible : l'arbre ne traite
plus le statut comme un lieu, donc useStatusChange peut passer à un UPDATE
sans que l'asset publié reste affiché sous /pending."

echo "✅ T7d appliqué, typechecké et commité."
echo
echo "   ▶ Relance pnpm dev et regarde. Dans cet ordre :"
echo "       1. l'arbre         → plus de pending/published, bin toujours là"
echo "       2. publier une PHOTO"
echo "       3. publier un DOSSIER   ← le cas de la garde no-op"
echo "       4. un DnD entre disciplines → ne doit RIEN publier"
echo "       5. la corbeille (drop + restaurer)"
echo "       6. la recherche"
echo "       7. le picker du page-builder  ← isPickable"