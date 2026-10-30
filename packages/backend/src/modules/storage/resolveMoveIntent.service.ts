import { TRPCError } from "@trpc/server";

import type {
  StorageAdapter,
  StorageMoveIntent,
  StorageMoveOperation,
  StorageMoveSource,
  StorageNode,
} from "@contracts/storage";

/**
 * resolveMoveIntent.service.ts
 *
 * Couche 2 du pipeline de move : résout une intention riche en N opérations atomiques, puis les
 * exécute via l'adapter de stockage.
 *
 *   Couche 3 — INTENTION              StorageMoveIntent (entrée)
 *   Couche 2 — RÉSOLUTION             ce service
 *   Couche 1 — OPÉRATION              StorageMoveOperation (sortie)
 *
 * Deux phases séparées, pour que le router puisse filtrer ou garder entre les deux :
 * `planMoveOperations` (lit et calcule, n'écrit rien), puis `executeMoveOperations`.
 *
 * ─── La structure se déplace avec ce qu'on déplace ────────────────────────
 *
 * La cible d'un élément est `<dossier cible>/<chemin de l'élément relatif au PARENT de sa racine>`.
 * Déplacer le dossier `AKFC/events/forum` dans `AKFC/courses/kali` produit
 * `AKFC/courses/kali/forum/…`, sous-dossiers compris. Une sélection qui contient un dossier
 * le déplace ENTIER (une seule opération dossier) ; on ne descend aux fichiers que si une
 * exclusion vise l'intérieur de ce dossier, et chacun garde alors son chemin relatif.
 *
 * Il ne fait pas : d'appel direct au stockage (tout passe par l'adapter), de validation zod (faite
 * par le router), ni de logique de base (l'adapter réaligne les lignes `MediaAsset`).
 */

export type ResolveMoveIntentParams = {
  adapter: StorageAdapter;
  appRoot: string;
  intent: StorageMoveIntent;
};

/** Phase 1 : l'intention en opérations atomiques, sans rien exécuter. */
export async function planMoveOperations(
  params: ResolveMoveIntentParams
): Promise<StorageMoveOperation[]> {
  const { adapter, intent } = params;

  if (!adapter.move) {
    throw new Error("Adapter does not support move().");
  }

  const targetFolder = trimSlashes(intent.target.path);
  const items = await resolveSource(intent.source, adapter);

  return items.map((item) => {
    // Un dossier ne se dépose ni dans lui-même, ni dans l'un de ses descendants : la boucle
    // déplacerait ses propres objets sous un préfixe qu'elle est en train de vider.
    if (
      item.type === "folder" &&
      (targetFolder === item.path || targetFolder.startsWith(`${item.path}/`))
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Un dossier ne peut pas être déplacé dans lui-même.",
      });
    }
    return {
      source: { type: item.type, path: item.path },
      target: { path: `${targetFolder}/${item.relative}` },
    };
  });
}

/**
 * Phase 2 : exécution des opérations planifiées. Séquentielle : des opérations concurrentes sur
 * des préfixes voisins pourraient se marcher dessus.
 *
 * Tout ou rien, par compensation : un geste multiple n'a pas de transaction commune (chaque
 * opération touche le stockage ET la base). Si l'opération k échoue — l'adapter a déjà ramené ses
 * propres objets —, on défait les opérations 1..k-1 en sens inverse, de la plus récente à la plus
 * ancienne. L'utilisateur retrouve la bibliothèque telle qu'avant son geste, et un message qui le
 * dit. Ce que la compensation ne couvre pas : un arrêt du serveur au milieu du geste.
 */
export async function executeMoveOperations(
  adapter: StorageAdapter,
  operations: readonly StorageMoveOperation[]
): Promise<void> {
  const move = adapter.move?.bind(adapter);
  if (!move) {
    throw new Error("Adapter does not support move().");
  }
  const done: StorageMoveOperation[] = [];
  for (const operation of operations) {
    try {
      await move(operation);
      done.push(operation);
    } catch (err) {
      const notUndone: string[] = [];
      for (const prev of [...done].reverse()) {
        await move({
          source: { type: prev.source.type, path: prev.target.path },
          target: { path: prev.source.path },
        }).catch((undoErr) => {
          notUndone.push(prev.source.path);
          console.error("[move] retour impossible", prev, undoErr);
        });
      }
      console.error("[move] échec, geste annulé", operation, err);
      // SERVICE_UNAVAILABLE et non INTERNAL_SERVER_ERROR : c'est le stockage (ou la base) qui a
      // failli, pas la requête — et le message, qui dit ce qui reste à faire, doit arriver jusqu'à
      // l'administrateur (une erreur interne voit son message remplacé en production).
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message:
          notUndone.length === 0
            ? "Le déplacement a échoué ; rien n'a été déplacé."
            : `Le déplacement a échoué, et ${notUndone.length} élément(s) n'ont pas pu être remis à leur place.`,
        cause: err,
      });
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Résolution de la source                                                   */
/* -------------------------------------------------------------------------- */

type ResolvedItem = {
  type: "file" | "folder";
  path: string;
  /** Chemin à recréer sous le dossier cible : relatif au parent de la racine sélectionnée. */
  relative: string;
};

async function resolveSource(
  source: StorageMoveSource,
  adapter: StorageAdapter
): Promise<ResolvedItem[]> {
  if (source.type === "file" || source.type === "folder") {
    const path = trimSlashes(source.path);
    return [{ type: source.type, path, relative: lastSegment(path) }];
  }

  const excluded = (source.excluded ?? []).map(trimSlashes);
  const isExcluded = (path: string): boolean =>
    excluded.some((ex) => path === ex || path.startsWith(`${ex}/`));

  const out: ResolvedItem[] = [];
  const seen = new Set<string>();
  const push = (item: ResolvedItem): void => {
    if (seen.has(item.path)) return;
    seen.add(item.path);
    out.push(item);
  };

  for (const root of source.roots.map(trimSlashes)) {
    if (isExcluded(root)) continue;
    const name = lastSegment(root);

    const rootNode = adapter.getNode ? await adapter.getNode(root) : null;
    if (rootNode?.type === "file") {
      push({ type: "file", path: root, relative: name });
      continue;
    }

    // Dossier sans exclusion à l'intérieur : déplacé d'un bloc.
    if (!excluded.some((ex) => ex.startsWith(`${root}/`))) {
      push({ type: "folder", path: root, relative: name });
      continue;
    }

    // Dossier avec exclusions : fichier par fichier, chacun gardant son chemin relatif.
    if (!adapter.getTree) {
      throw new Error("Adapter does not support getTree().");
    }
    const subtree = await adapter.getTree({ path: root, depth: Infinity });
    walkTree(subtree.root, (node) => {
      if (node.type !== "file" || isExcluded(node.path)) return;
      push({ type: "file", path: node.path, relative: `${name}/${node.path.slice(root.length + 1)}` });
    });
  }

  return out;
}

function walkTree(node: StorageNode, visit: (node: StorageNode) => void): void {
  visit(node);
  if (node.type === "folder" && node.children) {
    for (const child of node.children) walkTree(child, visit);
  }
}

function trimSlashes(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function lastSegment(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}
