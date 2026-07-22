#!/usr/bin/env bash
#
# fix_getnode_phantom_folder.sh
#
# `cloudinaryStorageAdapter.getNode` ne retourne jamais `null` pour un chemin
# inexistant : sa branche de repli construit l'arbre du préfixe via
# `getCloudinaryFolderTree`, et `buildCloudinaryTree` fabrique TOUJOURS un
# nœud racine — sans ressource ni dossier enregistré, une racine à
# `children: []`. Tout chemin inexistant revient donc sous la forme d'un
# dossier.
#
# Conséquence directe : `storage.rename` teste la collision avec
# `adapter.getNode(targetPath)`, reçoit ce fantôme, et refuse TOUT nouveau
# nom avec « Un élément porte déjà ce nom dans ce dossier. » Le renommage
# est cassé pour Cloudinary comme pour R2 — la façade virtuelle prend le
# fantôme Cloudinary quand R2 répond `null`, ce qu'il fait correctement.
#
# Correctif : un dossier n'existe que s'il porte des enfants, ou s'il est
# inscrit au registre `Folder` — le cas des dossiers vides créés
# explicitement, que le finder doit continuer d'afficher.
#
# Limite assumée : `hasChildren` vient de l'arbre, et `buildCloudinaryTree`
# peut le lever à tort quand le chemin testé est un PRÉFIXE d'un dossier
# existant (« reu » face à « reunion2024 »). Cette imprécision préexiste au
# correctif ; on ne l'aggrave pas, et le registre est interrogé en premier.
#
# Usage :
#   bash fix_getnode_phantom_folder.sh
#   AKFC_APPLY_ONLY=1 bash fix_getnode_phantom_folder.sh
#
set -euo pipefail

ADPT="packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$ADPT" ] || { echo "✗ introuvable : $ADPT"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "registered || node.hasChildren" "$ADPT"; then
  echo "✓ déjà appliqué (marqueur présent dans $ADPT) — rien à faire"
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

ADPT = "packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

edit(ADPT, """        const node = mapClientFolderTreeToStorageNode(tree, /* depth */ 0);
        if (node.type === "folder") return node;""",
"""        const node = mapClientFolderTreeToStorageNode(tree, /* depth */ 0);

        // ⚠️ Recevoir un `folder` n'est PAS la preuve qu'il existe.
        //
        // `buildCloudinaryTree` fabrique toujours un nœud racine : appelé sur
        // un préfixe qui n'existe nulle part, il renvoie une racine à
        // `children: []`. Retourner ce dossier fantôme fait croire à un
        // élément présent — et `storage.rename`, qui détecte ses collisions
        // avec `getNode(targetPath)`, refusait alors TOUT nouveau nom.
        //
        // Un dossier existe s'il est inscrit au registre (y compris vide,
        // cas des dossiers créés explicitement) ou s'il porte des enfants.
        if (node.type === "folder") {
          const registered = await prisma.folder.findFirst({
            where: {
              appRoot,
              OR: [
                { fullPath: path },
                { fullPath: { startsWith: `${path}/` } },
              ],
            },
            select: { fullPath: true },
          });

          if (registered || node.hasChildren) return node;
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
git commit -m "fix(storage): getNode ne renvoie plus de dossier fantome

buildCloudinaryTree fabrique toujours un noeud racine : sur un prefixe
inexistant, getNode retournait un folder a children vides au lieu de
null. storage.rename, qui detecte ses collisions avec getNode, refusait
donc tout nouveau nom comme deja pris.

Un dossier n'est reconnu que s'il est inscrit au registre Folder ou
qu'il porte des enfants."

echo "✓ commité"
git log -1 --oneline