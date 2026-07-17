#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — incrément B2 : LE FLIP. Publier cesse d'être un déplacement.
#
# Prérequis : step_e3a2 (media.setStatus) ET step_e3b1 (la garde).
#
# Les deux moitiés partent ENSEMBLE, et ce n'est pas négociable :
#   - `useStatusChange` bascule sur `media.setStatus` ;
#   - les 4 sites qui redérivaient `MediaAsset.status` d'un chemin se taisent.
#
# Retirer les écritures avant la bascule casserait la publication (aujourd'hui
# c'est `reconcileMovedAsset` qui publie). Basculer sans les retirer ferait
# pire : une photo publiée, puis glissée vers une autre discipline, verrait son
# statut redérivé du chemin physique — resté sous `pending/` — et serait
# DÉPUBLIÉE en silence.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HOOK="apps/web/src/features/finder-core/hooks/useStatusChange.ts"
VS="packages/backend/src/modules/storage/virtualStorage.ts"
R2="packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"

# ── Gardes de prérequis ─────────────────────────────────────────────────────
for f in "$HOOK" "$VS" "$R2"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine du repo."; exit 1; }
done
grep -q "setStatus: protectedProcedure" packages/backend/src/modules/media/router.ts \
  || { echo "✗ media.setStatus absent — lance d'abord step_e3a2_set_status_mutation.sh."; exit 1; }
grep -q "assertStatusChangeDoesntUnpublishReferencedAssets" packages/backend/src/modules/media/router.ts \
  || { echo "✗ la garde n'est pas branchée — lance d'abord step_e3b1_unpublish_guard.sh."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if grep -q "trpc.media.setStatus.useMutation" "$HOOK"; then
  echo "→ le flip est déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def sub(path, old, new, label):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    assert src.count(old) == 1, f"[{label}] ancre trouvee {src.count(old)} fois, attendu 1"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

HOOK = "apps/web/src/features/finder-core/hooks/useStatusChange.ts"
VS   = "packages/backend/src/modules/storage/virtualStorage.ts"
R2   = "packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"

print("─── front ───")

# 1) L'import du payload DnD n'a plus lieu d'etre : on n'emet plus de move.
sub(HOOK,
    "import { dragItemFromNode } from '@features/finder-core/dnd/payload';\n",
    "",
    "useStatusChange : import dragItemFromNode retire")

# 2) La doc d'en-tete decrivait la mecanique qu'on supprime.
sub(HOOK,
    """ *   - `pending` ↔ `published` → `adapter.moveItems` (même primitive que le
 *     DnD), mais avec une cible `status-folder` au lieu de `folder` : la
 *     résolution backend (`resolveMoveIntent`) remplace le segment de statut
 *     en PRÉSERVANT le sous-chemin (`pending/cours/12/x.jpg` →
 *     `published/cours/12/x.jpg`). Le DnD, lui, vise un `folder` et aplatit.""",
    """ *   - `pending` ↔ `published` → `media.setStatus`. **Un UPDATE, pas un
 *     déplacement.** Le binaire ne bouge plus : `MediaAsset.status` est
 *     devenu la vérité, le segment de statut du chemin n'est plus qu'un
 *     décor que les étapes 4-5 effaceront.
 *
 *     Ce qu'on passe au backend n'est pas symétrique, et c'est voulu :
 *       - un FICHIER porte son localisateur → `storagePathOf(node)`, le
 *         chemin PHYSIQUE, seul à matcher `MediaAsset.fullPath` ;
 *       - un DOSSIER n'en a pas (il vit dans 1..N strates) → on envoie le
 *         chemin LOGIQUE et `logical: true`, le backend résout via
 *         `physicalCandidates`. Même forme que `trash.trashToBin`.""",
    "useStatusChange : doc d'en-tete")

# 3) Le hook de mutation.
sub(HOOK,
    "  const trashToBinMutation = trpc.trash.trashToBin.useMutation();",
    "  const trashToBinMutation = trpc.trash.trashToBin.useMutation();\n"
    "  const setStatusMutation = trpc.media.setStatus.useMutation();",
    "useStatusChange : hook de mutation")

# 4) LE FLIP.
sub(HOOK,
    """        } else {
          if (!adapter.moveItems) {
            setError('Déplacement non supporté par cet adaptateur.');
            return;
          }
          setIsMoving(true);
          await adapter.moveItems({
            items: nodes.map(dragItemFromNode),
            target: { type: 'status-folder', status: target },
          });
          // Publier ou dépublier fait bouger `pending` (et, selon la zone,
          // `generalPending` / `persoPending`). La cloche est dans le cache
          // depuis sa migration `useQuery` : un invalidate suffit.
          utils.storage.getAttentionCounts.invalidate();
        }""",
    """        } else {
          setIsMoving(true);
          await setStatusMutation.mutateAsync({
            appRoot: APP_ROOT,
            sources: nodes.map((node) =>
              node.type === 'folder'
                ? { kind: 'folder' as const, path: node.path }
                : { kind: 'file' as const, path: storagePathOf(node) },
            ),
            status: target,
            // Ne concerne que les `folder.path` ci-dessus : le backend les
            // résout contre les strates. Les fichiers passent déjà physiques.
            logical: true,
          });
          // Publier ou dépublier change le décompte `pending`. La cloche est
          // dans le cache depuis sa migration `useQuery` : un invalidate suffit.
          utils.storage.getAttentionCounts.invalidate();
        }""",
    "useStatusChange : LE FLIP")

# 5) L'etat d'attente.
sub(HOOK,
    "    isPending: isMoving || trashToBinMutation.isPending,",
    "    isPending:\n"
    "      isMoving || trashToBinMutation.isPending || setStatusMutation.isPending,",
    "useStatusChange : isPending")

# 6) Les deps du useCallback.
sub(HOOK,
    """      adapter,
      trashToBinMutation,""",
    """      setStatusMutation,
      trashToBinMutation,""",
    "useStatusChange : deps du useCallback")

print("─── backend ───")

# 7) Le bloc statusFromPath de virtualStorage ne sert plus qu'a lui-meme.
sub(VS,
    """const STATUS_SEGMENTS = ['pending', 'published', 'bin'] as const;
type LifecycleStatus = (typeof STATUS_SEGMENTS)[number];

/**
 * Statut applicatif dérivé d'un path : le segment juste après l'appRoot.
 * `AKFC/published/cours/x/trotinette` → 'published'. Renvoie null si le
 * segment n'est pas un statut connu. Convention identique au front
 * (statusFromPath) et à resolveMoveIntent, dupliquée ici pour ne pas créer
 * de dépendance backend → features front.
 */
function statusFromPath(path: string, appRoot: string): LifecycleStatus | null {
  const parts = path.split('/').filter(Boolean);
  const rootParts = appRoot.split('/').filter(Boolean);
  const seg = parts[rootParts.length];
  return (STATUS_SEGMENTS as readonly string[]).includes(seg)
    ? (seg as LifecycleStatus)
    : null;
}
""",
    """/*
 * `statusFromPath` vivait ici — quatrième copie d'une même règle, avec sa
 * propre opinion sur le segment inconnu. Elle servait à redériver
 * `MediaAsset.status` du chemin d'arrivée après chaque move.
 *
 * Elle est supprimée, pas désactivée. `status` a maintenant une source, et
 * une seule : `media.setStatus`. Un move est redevenu ce qu'il aurait
 * toujours dû être — une réorganisation, qui ne dit rien du cycle de vie.
 */
""",
    "virtualStorage : bloc statusFromPath supprime")

# 8) reconcileMovedAsset, branche R2.
sub(VS,
    """      await prisma.mediaAsset.updateMany({
        where: { appRoot, fullPath: oldPath },
        data: {
          fullPath: newPath,
          ...(statusFromPath(newPath, appRoot)
            ? { status: statusFromPath(newPath, appRoot)! }
            : {}),
        },
      });
      return;""",
    """      await prisma.mediaAsset.updateMany({
        where: { appRoot, fullPath: oldPath },
        data: { fullPath: newPath },
      });
      return;""",
    "virtualStorage : reconcileMovedAsset, branche R2")

# 9) reconcileMovedAsset, branche Cloudinary.
sub(VS,
    """    const nextStatus = statusFromPath(newPath, appRoot);
    const nextFullPath = `${newPath}${info?.format ? "." + info.format : ""}`;""",
    """    const nextFullPath = `${newPath}${info?.format ? "." + info.format : ""}`;""",
    "virtualStorage : nextStatus retire")

sub(VS,
    """        fullPath: nextFullPath,
        publicId: newPath,
        ...(nextStatus ? { status: nextStatus } : {}),""",
    """        fullPath: nextFullPath,
        publicId: newPath,""",
    "virtualStorage : reconcileMovedAsset, branche Cloudinary")

# 10) r2StorageAdapter : la derivation.
sub(R2,
    """      const topSegment = operation.target.path.split("/")[1];
      const nextStatus =
        topSegment === "pending" || topSegment === "published"
          ? topSegment
          : null;
""",
    "",
    "r2StorageAdapter : derivation du statut retiree")

# 11) r2StorageAdapter : move d'un fichier.
sub(R2,
    """          data: {
            fullPath: operation.target.path,
            ...(nextStatus ? { status: nextStatus } : {}),
          },""",
    """          data: { fullPath: operation.target.path },""",
    "r2StorageAdapter : move d'un fichier")

# 12) r2StorageAdapter : move d'un dossier (SQL raw).
sub(R2,
    """        SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
            "status" = COALESCE(${nextStatus}, "status")""",
    """        SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int)""",
    "r2StorageAdapter : move d'un dossier (SQL raw)")
PYEOF

echo
echo "→ plus aucune dérivation de statut depuis un chemin côté storage :"
grep -rc "statusFromPath\|nextStatus" "$VS" "$R2" || true

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(finder): publier devient un UPDATE — le binaire ne bouge plus (etape 3, increment B2)"
echo "✓ commité."