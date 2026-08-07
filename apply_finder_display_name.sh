#!/usr/bin/env bash
#
# AKFC — Afficher le nom humain au lieu du slug (increment 2a/2 : point unique).
#
# Depuis l'increment 1, la clé de stockage (publicId) est slugifiée. Le finder
# affiche `node.name`, qui vient du dernier segment de la clé → il montrerait
# le slug. Ce patch rend le nom lisible au SEUL endroit qui joint déjà chaque
# FileNode à son `MediaAsset` : `enrichFilesWithStatus` (appelé par
# `storage.list` ET `storage.getTree`). On y ramène `displayName`/
# `originalFileName` et on pose `node.name = displayName ?? originalFileName`.
#
# Aucun composant à toucher : tous lisent `node.name`, et les opérations
# s'appuient sur `node.path` / `node.id` (identité = storagePath), pas sur
# `name`. Le format/extension reste géré par les helpers d'affichage du front
# (`displayName`/`baseNameOf`), qui savent traiter un nom pointé.
#
# NON couvert ici (increment 2b) : `media.searchRecursive` (procédure de
# recherche distincte, non enrichie) affichera encore le slug ; et la source
# de données du picker de blocs reste à confirmer.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-finder-display-name.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-finder-display-name.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/storage/services/enrichStatus.service.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "metaByKey" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

OLD = """async function statusByKey(
  prisma: PrismaClient,
  appRoot: string,
  keys: string[],
): Promise<Map<string, LifecycleStatus>> {
  const map = new Map<string, LifecycleStatus>();
  if (keys.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: keys } }, { fullPath: { in: keys } }],
    },
    select: { publicId: true, fullPath: true, status: true },
  });

  for (const row of rows) {
    if (!isLifecycleStatus(row.status)) continue;
    if (row.publicId) map.set(row.publicId, row.status);
    if (row.fullPath) map.set(row.fullPath, row.status);
  }
  return map;
}

/** Pose `metadata.status` sur chaque fichier d'une liste plate. */
export async function enrichFilesWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  files: ReadonlyArray<StorageFileNode>,
): Promise<void> {
  if (files.length === 0) return;

  const allKeys = files.flatMap(candidateKeys);
  const byKey = await statusByKey(prisma, appRoot, allKeys);

  for (const file of files) {
    for (const key of candidateKeys(file)) {
      const status = byKey.get(key);
      if (status) {
        file.metadata = { ...(file.metadata ?? {}), status };
        break;
      }
    }
  }
}"""

NEW = """type ResolvedMeta = { status?: LifecycleStatus; human?: string };

async function metaByKey(
  prisma: PrismaClient,
  appRoot: string,
  keys: string[],
): Promise<Map<string, ResolvedMeta>> {
  const map = new Map<string, ResolvedMeta>();
  if (keys.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: keys } }, { fullPath: { in: keys } }],
    },
    select: {
      publicId: true,
      fullPath: true,
      status: true,
      displayName: true,
      originalFileName: true,
    },
  });

  for (const row of rows) {
    // La cle de stockage (publicId) est desormais slugifiee : c'est ici qu'on
    // rend au finder le nom lisible. displayName cure sinon nom d'origine ;
    // l'extension/format est geree par les helpers d'affichage du front.
    const human = row.displayName?.trim() || row.originalFileName || undefined;
    const status = isLifecycleStatus(row.status) ? row.status : undefined;
    const meta: ResolvedMeta = { status, human };
    if (row.publicId) map.set(row.publicId, meta);
    if (row.fullPath) map.set(row.fullPath, meta);
  }
  return map;
}

/** Pose `metadata.status` ET le nom d'affichage humain sur chaque fichier. */
export async function enrichFilesWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  files: ReadonlyArray<StorageFileNode>,
): Promise<void> {
  if (files.length === 0) return;

  const allKeys = files.flatMap(candidateKeys);
  const byKey = await metaByKey(prisma, appRoot, allKeys);

  for (const file of files) {
    for (const key of candidateKeys(file)) {
      const hit = byKey.get(key);
      if (hit) {
        if (hit.status) {
          file.metadata = { ...(file.metadata ?? {}), status: hit.status };
        }
        // Le `name` stocke est le slug ; on affiche le nom humain quand connu.
        if (hit.human) file.name = hit.human;
        break;
      }
    }
  }
}"""

assert s.count(OLD) == 1, "ancre enrichStatus introuvable/multiple — abandon avant tout commit"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("patch enrichStatus OK (node.name = nom humain)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(finder): afficher le nom humain (displayName/originalFileName) au lieu du slug, via enrichStatus" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi