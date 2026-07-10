#!/bin/bash
# DIAGNOSTIC (temporaire) : trace source/target/ops resolus lors d'un move.
# À lancer depuis la RACINE : bash diag_move.sh   (a retirer ensuite)
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
echo "-> packages/backend/src/modules/storage/resolveMoveIntent.service.ts"
cat > 'packages/backend/src/modules/storage/resolveMoveIntent.service.ts' << 'FILE_EOF'
import type {
  StorageAdapter,
  StorageMoveIntent,
  StorageMoveOperation,
  StorageMoveSource,
  StorageMoveTarget,
} from "@contracts/storage";

/**
 * resolveMoveIntent.service.ts
 *
 * Couche 2 du pipeline de move : résout une intention riche en N opérations
 * atomiques, et les exécute via l'adapter de stockage.
 *
 *   Couche 3 — INTENTION              StorageMoveIntent (entrée de ce service)
 *   Couche 2 — RÉSOLUTION             ce service
 *   Couche 1 — OPÉRATION              StorageMoveOperation (sortie)
 *
 * ─── Ce que ce service fait, et ce qu'il ne fait pas ──────────────────────
 *
 * Il fait :
 *   - expanse une `selection` (roots + excluded) en N items concrets en
 *     interrogeant l'adapter (`list` ou `getTree`)
 *   - traduit une cible `status-folder` (lifecycle status applicatif) en
 *     path concret en respectant la convention `${appRoot}/${status}/...`
 *   - produit N `StorageMoveOperation` atomiques
 *   - les exécute séquentiellement via `adapter.move()`
 *
 * Il ne fait pas :
 *   - aucun appel direct à un provider (Cloudinary, R2, etc.). Tout passe
 *     par l'interface `StorageAdapter` reçue en paramètre.
 *   - aucune validation Zod (l'input est supposé déjà validé en amont,
 *     typiquement par `storageMoveIntentSchema` au niveau du router).
 *   - aucune logique de DB (l'adapter ou le service métier qui l'appelle
 *     se charge de propager les changements en DB si nécessaire).
 *
 * ─── Note importante sur la convention de path ────────────────────────────
 *
 * La traduction d'un `status-folder` en path concret repose sur la
 * convention `${appRoot}/${status}/...`. Cette convention est applicative
 * (imposée par le projet à tous ses stockages) et est documentée dans le
 * contrat `move.intent.ts`. Si demain le projet change cette convention,
 * c'est ici qu'il faudra la refléter.
 *
 * Le suffixe préservé d'un asset déplacé par `status-folder` correspond à
 * tout ce qui suit le `<status>` actuel dans son path. Exemple :
 *   source : `AKFC/pending/cours/12/photo.jpg`
 *   target : `{ type: 'status-folder', status: 'published' }`
 *   → path concret : `AKFC/published/cours/12/photo.jpg`
 */

export type ResolveMoveIntentParams = {
  adapter: StorageAdapter;
  appRoot: string;
  intent: StorageMoveIntent;
};

/**
 * Résout et exécute une intention de move.
 *
 * Renvoie le tableau des opérations atomiques effectivement exécutées —
 * utile pour les caller qui veulent logger, auditer, ou rejouer.
 *
 * Wrapper rétrocompatible équivalent à `planMoveOperations` suivi de
 * `executeMoveOperations`. Si tu as besoin d'insérer une garde ou un
 * audit entre les deux phases (ex: le router `storage.move` qui refuse
 * de sortir un asset référencé de published — sous-chantier 7), utilise
 * les deux fonctions séparément plutôt que ce wrapper.
 */
export async function resolveMoveIntent(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const operations = await planMoveOperations(params);
  await executeMoveOperations(params.adapter, operations);
  return operations;
}

/**
 * Phase 1 du pipeline : résout l'intention en N opérations atomiques,
 * **sans rien exécuter**. Ne fait que lire (via l'adapter) et calculer.
 *
 * Permet d'insérer des gardes sur les opérations planifiées avant
 * exécution. Utilisé par le router `storage.move` pour faire passer
 * les opérations à `assertOperationsDontUnpublishReferencedAssets`
 * avant l'appel à `executeMoveOperations`.
 */
export async function planMoveOperations(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const { adapter, appRoot, intent } = params;

  if (!adapter.move) {
    throw new Error(
      "Adapter does not support move(). " +
        "Cannot resolve a StorageMoveIntent on a read-only adapter."
    );
  }

  // 1) Résoudre la SOURCE en items concrets (file ou folder).
  const items = await resolveSource(intent.source, adapter);

  // 2) Pour chaque item, traduire la TARGET en path concret et produire
  //    une opération atomique.
  const ops = items.map((item) => ({
    source: item,
    target: { path: resolveTargetPath(item, intent.target, appRoot) },
  }));

  // [DIAG 2026-07-03] à retirer une fois le DnD dossier validé.
  console.log(
    "[resolveMoveIntent] intent.source =",
    JSON.stringify(intent.source),
    "\n  intent.target =",
    JSON.stringify(intent.target),
    "\n  ops =",
    JSON.stringify(ops, null, 2),
  );

  return ops;
}

/**
 * Phase 2 du pipeline : exécute des opérations atomiques pré-planifiées
 * via l'adapter.
 *
 * Séquentiel et non parallèle : certains backends (Cloudinary
 * notamment) n'aiment pas les opérations concurrentes sur des prefixes
 * voisins.
 */
export async function executeMoveOperations(
  adapter: StorageAdapter,
  operations: readonly StorageMoveOperation[]
): Promise<void> {
  if (!adapter.move) {
    throw new Error(
      "Adapter does not support move(). " +
        "Cannot execute move operations on a read-only adapter."
    );
  }
  for (const operation of operations) {
    await adapter.move(operation);
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la source                                                   */
/* -------------------------------------------------------------------------- */

type ResolvedItem = StorageMoveOperation["source"];

/**
 * Expanse la source d'une intention en une liste d'items concrets.
 *
 * - `file` ou `folder` : un seul item, retourné tel quel.
 * - `selection`        : on liste sous chaque root et on filtre les excluded.
 *                        On préserve les types (file/folder) découverts pour
 *                        que `adapter.move()` puisse traiter chaque cas.
 */
async function resolveSource(
  source: StorageMoveSource,
  adapter: StorageAdapter
): Promise<ResolvedItem[]> {
  if (source.type === "file" || source.type === "folder") {
    return [{ type: source.type, path: source.path }];
  }

  // source.type === 'selection'
  const excluded = new Set(source.excluded ?? []);

  // Exclusion par préfixe : un asset `cours/12/draft/x.jpg` est exclu si
  // `cours/12/draft` est dans excluded. C'est la même règle que celle
  // appliquée par moveService Cloudinary actuellement.
  const isExcluded = (path: string): boolean => {
    if (excluded.has(path)) return true;
    for (const ex of excluded) {
      if (path.startsWith(`${ex}/`)) return true;
    }
    return false;
  };

  const out: ResolvedItem[] = [];
  const seen = new Set<string>();

  for (const rootPath of source.roots) {
    if (isExcluded(rootPath)) continue;

    // 1) Le root est-il un fichier ?
    //    Stratégie : tenter getNode pour discriminer file/folder.
    //    Si l'adapter n'a pas getNode, on assume folder et on liste.
    const rootNode = adapter.getNode
      ? await adapter.getNode(rootPath)
      : null;

    if (rootNode?.type === "file") {
      if (!seen.has(rootPath)) {
        out.push({ type: "file", path: rootPath });
        seen.add(rootPath);
      }
      continue;
    }

    // 2) Sinon, c'est un dossier : on liste son contenu récursif via getTree
    //    pour récupérer tous les descendants.
    if (!adapter.getTree) {
      throw new Error(
        "Adapter does not support getTree(). " +
          "Cannot resolve a 'selection' source without recursive listing."
      );
    }

    const subtree = await adapter.getTree({ path: rootPath, depth: Infinity });

    // Parcourir le sous-arbre en profondeur, ramasser tous les files non exclus.
    walkTree(subtree.root, (node) => {
      if (node.type === "file" && !isExcluded(node.path) && !seen.has(node.path)) {
        out.push({ type: "file", path: node.path });
        seen.add(node.path);
      }
    });
  }

  return out;
}

/**
 * Visite récursive d'un arbre de StorageNode.
 */
function walkTree(
  node: import("@contracts/storage").StorageNode,
  visit: (node: import("@contracts/storage").StorageNode) => void
): void {
  visit(node);
  if (node.type === "folder" && node.children) {
    for (const child of node.children) {
      walkTree(child, visit);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la target                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Calcule le path concret d'arrivée pour un item donné.
 *
 * Pour une target de type `folder`, le path concret est `<targetFolder>/<sourceTail>`
 * où `sourceTail` est le dernier segment du path source (le nom du fichier
 * ou du dossier).
 *
 * Pour une target de type `status-folder`, on remplace le segment de statut
 * dans le path source. Convention : le statut est le SECOND segment du path
 * (juste après l'appRoot). Exemple : `AKFC/pending/cours/12/photo.jpg`
 *   → segment[0] = `AKFC` (appRoot)
 *   → segment[1] = `pending` (statut courant)
 *   → segments[2..] = `cours/12/photo.jpg` (suffixe à préserver)
 */
function resolveTargetPath(
  item: ResolvedItem,
  target: StorageMoveTarget,
  appRoot: string
): string {
  if (target.type === "folder") {
    const tail = lastSegment(item.path);
    return `${target.path}/${tail}`;
  }

  // target.type === 'status-folder'
  // On remplace le segment de statut dans le path source.
  const parts = item.path.split("/").filter(Boolean);

  // Invariant 1 : le path doit commencer par appRoot.
  // Toute source bien gérée par le système est sous appRoot.
  if (parts[0] !== appRoot) {
    throw new Error(
      `Cannot resolve status-folder target: source path does not start with appRoot. ` +
        `path="${item.path}" appRoot="${appRoot}"`
    );
  }

  // Invariant 2 : le segment de statut (parts[1]) doit être un statut connu.
  // Cet invariant traduit la règle applicative : un asset géré par le système
  // ne peut vivre que sous un status-folder ('pending' | 'published' | 'bin').
  // Si parts[1] est inconnu, c'est qu'on tente un move sur un asset qui
  // n'a pas été produit par le pipeline d'upload du système — bug en amont
  // qui mérite d'échouer fort plutôt que d'être bricolé silencieusement.
  const currentStatus = parts[1];
  if (
    currentStatus !== "pending" &&
    currentStatus !== "published" &&
    currentStatus !== "bin"
  ) {
    throw new Error(
      `Cannot resolve status-folder target: source path is not under a known ` +
        `lifecycle status segment. Expected segment[1] in {'pending', 'published', 'bin'}, ` +
        `got "${currentStatus ?? "<missing>"}". path="${item.path}"`
    );
  }

  // [appRoot, <oldStatus>, ...rest] → [appRoot, newStatus, ...rest]
  parts[1] = target.status;
  return parts.join("/");
}

function lastSegment(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}
FILE_EOF
echo "Trace posee. Refais le DnD fautif, puis colle la sortie du terminal serveur."