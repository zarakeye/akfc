import type {
  StorageAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
  StoragePath,
} from '@contracts/storage';

import {
  isFoldedStratumPath,
  physicalCandidates,
  physicalResolutionOrder,
  toLogicalPath,
} from '@backend/modules/storage/logicalPath';

/**
 * StatusFoldingReadView — la strate de statut cesse d'être un lieu.
 *
 * ─── Ce que c'est ─────────────────────────────────────────────────────────
 *
 * Un décorateur `StorageAdapter` qui enveloppe un autre `StorageAdapter`
 * (en pratique `VirtualStorage`) et présente une vue où le nœud logique
 * `AKFC/cours/x` FUSIONNE les nœuds physiques `AKFC/pending/cours/x` et
 * `AKFC/published/cours/x`.
 *
 *   AKFC                          AKFC
 *   ├── pending                   ├── cours
 *   │   └── cours                 │   └── tchoy-lee-fut
 *   │       └── tchoy-lee-fut     │       ├── photo-1   (pending)
 *   │           └── photo-1       │       └── photo-2   (published)
 *   ├── published                 ├── general
 *   │   └── cours                 └── bin
 *   │       └── tchoy-lee-fut
 *   │           └── photo-2
 *   ├── general
 *   └── bin
 *
 * Le statut ne disparaît pas de l'écran : il redevient ce qu'il aurait
 * toujours dû être, une MÉTADONNÉE portée par `MediaAsset.status` (déjà
 * exposée en `MediaMeta.status` depuis l'étape S1). Le badge « En attente »
 * et la colonne Statut continuent de la lire ; le filtre segmenté à venir
 * filtrera dessus. Simplement, le statut n'est plus un DOSSIER.
 *
 * ─── LECTURE UNIQUEMENT — et ce n'est pas un oubli ────────────────────────
 *
 * `move()` et `delete()` ne sont VOLONTAIREMENT pas implémentés. Le contrat
 * `StorageAdapter` les déclare optionnels, donc cette vue reste conforme.
 *
 * La raison est structurelle, pas un manque de temps. `planMoveOperations`
 * lit la source via l'adapter qu'on lui passe, puis calcule la cible avec
 * `resolveTargetPath`. Or `resolveTargetPath`, pour une cible
 * `status-folder`, exige que `segment[1]` du chemin source soit un statut
 * connu — et LÈVE une erreur explicite sinon. Lui donner des chemins
 * logiques (où ce segment n'existe plus, par construction) casserait
 * `useStatusChange`, c'est-à-dire précisément la publication.
 *
 * ⚠️ NE PAS passer cette vue à `planMoveOperations` / `resolveMoveIntent`.
 * La traduction des intentions de move logique → physique est un incrément
 * à part, avec sa propre logique (une réorganisation doit hériter de la
 * strate de sa source, sinon déplacer une photo la publierait par accident).
 *
 * ─── Coût ─────────────────────────────────────────────────────────────────
 *
 * Chaque lecture interroge jusqu'à trois emplacements. Sur Cloudinary c'est
 * quasi gratuit : `resourcesCache` a un hit hiérarchique, et le premier
 * candidat (le chemin logique lui-même, donc l'ancêtre des deux autres à la
 * racine) est lu SÉQUENTIELLEMENT pour réchauffer le cache avant les deux
 * suivants. Cf. `physicalCandidates` pour le raisonnement complet.
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire, comme `logicalPath.ts`. À l'étape 5 du chantier, tous les
 * binaires sont à plat, le pliage devient l'identité, et ce fichier se
 * supprime.
 */
export class StatusFoldingReadView implements StorageAdapter {
  constructor(
    private readonly inner: StorageAdapter,
    private readonly appRoot: string,
  ) {}

  /* ====================================================================== */
  /*  Lecture                                                               */
  /* ====================================================================== */

  async list(options: ListOptions): Promise<ListResult> {
    const results = await this.readCandidates(
      (path) => this.inner.list({ ...options, path }),
      options.path,
      'list',
    );

    // Les dossiers fusionnent par path logique ; les fichiers, JAMAIS.
    // Cf. `mergeFoldedFolders` pour le raisonnement sur les collisions.
    const folders = new Map<string, StorageFolderNode>();
    const files: StorageFileNode[] = [];

    for (const result of results) {
      for (const folder of result.folders) {
        if (isFoldedStratumPath(folder.path, this.appRoot)) continue;
        const folded = this.foldFolder(folder);
        const existing = folders.get(folded.path);
        folders.set(
          folded.path,
          existing ? mergeFoldedFolders(existing, folded) : folded,
        );
      }
      for (const file of result.files) {
        files.push(this.foldFile(file));
      }
    }

    return {
      folders: [...folders.values()],
      files,
      // Les candidats sont consommés intégralement avant retour, comme dans
      // les adapters sous-jacents. Pas de pagination composée à ce stade.
      nextCursor: null,
    };
  }

  async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
    const results = await this.readCandidates(
      (path) => this.inner.getTree({ ...options, path }),
      options.path,
      'getTree',
    );

    const folded = results.map((result) => this.foldFolder(result.root));

    // Tous les candidats repliés partagent désormais le même path logique
    // (celui demandé) : la réduction les empile deux à deux.
    return {
      root: folded.reduce((accumulator, tree) =>
        mergeFoldedFolders(accumulator, tree),
      ),
    };
  }

  async getNode(path: StoragePath): Promise<StorageNode | null> {
    const innerGetNode = this.inner.getNode?.bind(this.inner);
    if (!innerGetNode) return null;

    const answers: StorageNode[] = [];
    for (const candidate of physicalResolutionOrder(path, this.appRoot)) {
      const outcome = await this.settle(
        () => innerGetNode(candidate),
        `getNode(${candidate})`,
      );
      if (outcome.ok && outcome.value) answers.push(outcome.value);
    }

    // ⚠️ On PRÉFÈRE une réponse `file` concrète à une réponse `folder`, pour
    // la même raison que `VirtualStorage.getNode` : un provider répond
    // volontiers « folder » sur un simple préfixe. Ici le risque est même
    // plus grand — le premier candidat est le chemin à plat, qui n'existe
    // pas encore avant l'étape 5 mais dont Cloudinary peut rapporter le
    // préfixe de façon optimiste, masquant le vrai fichier sous sa strate.
    const file = answers.find((node) => node.type === 'file');
    const resolved = file ?? answers[0];
    return resolved ? this.foldNode(resolved) : null;
  }

  async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
    const innerGetMetadata = this.inner.getMetadata?.bind(this.inner);
    if (!innerGetMetadata) return null;

    // `physicalResolutionOrder` essaie le chemin TEL QUEL en premier : un
    // appelant qui détient déjà le `storagePath` (le cas normal) paie un
    // seul aller-retour. Les autres candidats sont un filet, pas la règle.
    for (const candidate of physicalResolutionOrder(path, this.appRoot)) {
      const outcome = await this.settle(
        () => innerGetMetadata(candidate),
        `getMetadata(${candidate})`,
      );
      if (outcome.ok && outcome.value) return outcome.value;
    }
    return null;
  }

  /* ====================================================================== */
  /*  Interrogation des candidats                                           */
  /* ====================================================================== */

  /**
   * Lit les emplacements physiques d'un chemin logique et retourne les
   * réponses obtenues.
   *
   * Le premier candidat est lu SÉQUENTIELLEMENT, les suivants en parallèle :
   * à la racine le premier est l'ancêtre des autres, donc il réchauffe le
   * cache hiérarchique de `resourcesCache` et les deux suivants sont servis
   * en mémoire.
   *
   * Un candidat en échec est ignoré (un emplacement peut légitimement ne pas
   * exister — c'est même le cas normal pendant toute la transition). On ne
   * propage l'erreur que si AUCUN candidat n'a répondu : même discipline de
   * tolérance aux pannes que `VirtualStorage`.
   */
  private async readCandidates<T>(
    read: (path: string) => Promise<T>,
    requestedPath: string,
    label: string,
  ): Promise<T[]> {
    const [first, ...rest] = physicalCandidates(requestedPath, this.appRoot);

    const firstOutcome = await this.settle(
      () => read(first),
      `${label}(${first})`,
    );
    const restOutcomes = await Promise.all(
      rest.map((path) => this.settle(() => read(path), `${label}(${path})`)),
    );

    const outcomes = [firstOutcome, ...restOutcomes];
    const values = outcomes
      .filter((outcome): outcome is { ok: true; value: T } => outcome.ok)
      .map((outcome) => outcome.value);

    if (values.length === 0) {
      const firstFailure = outcomes.find((outcome) => !outcome.ok);
      throw firstFailure && !firstFailure.ok
        ? firstFailure.reason
        : new Error(`[StatusFoldingReadView] ${label}: aucun candidat lisible.`);
    }

    return values;
  }

  private async settle<T>(
    run: () => Promise<T>,
    context: string,
  ): Promise<{ ok: true; value: T } | { ok: false; reason: unknown }> {
    try {
      return { ok: true, value: await run() };
    } catch (reason) {
      console.warn(
        `[StatusFoldingReadView] ${context} a échoué — candidat ignoré.`,
        reason,
      );
      return { ok: false, reason };
    }
  }

  /* ====================================================================== */
  /*  Pliage des nodes                                                      */
  /* ====================================================================== */

  private foldNode(node: StorageNode): StorageNode {
    return node.type === 'file' ? this.foldFile(node) : this.foldFolder(node);
  }

  /**
   * Un fichier garde son emplacement réel dans `storagePath` et prend son
   * chemin logique dans `path`.
   *
   * `storagePath` est renseigné SYSTÉMATIQUEMENT, même quand il est déjà
   * égal à `path` (asset à plat, ou fichier de corbeille). L'invariant
   * « tout fichier sorti de cette vue porte son storagePath » évite aux
   * consommateurs un `?? path` défensif, et rend la suppression du champ
   * à l'étape 5 mécanique.
   */
  private foldFile(file: StorageFileNode): StorageFileNode {
    return {
      ...file,
      path: toLogicalPath(file.path, this.appRoot),
      storagePath: file.path,
    };
  }

  /**
   * Un dossier prend son chemin logique — et PAS de `storagePath`.
   *
   * C'est délibéré : un dossier logique correspond à plusieurs dossiers
   * physiques (un par strate), il n'a donc pas d'emplacement réel unique à
   * désigner. Poser un `storagePath` arbitraire serait un mensonge sur
   * lequel du code finirait par s'appuyer.
   *
   * Deux dossiers logiques ne peuvent pas entrer en collision (ils
   * fusionnent), donc leur `path` suffit comme identité côté UI.
   */
  private foldFolder(folder: StorageFolderNode): StorageFolderNode {
    const path = toLogicalPath(folder.path, this.appRoot);
    const name = path.split('/').filter(Boolean).pop() ?? folder.name;

    // Les strates elles-mêmes (`AKFC/pending`, `AKFC/published`) sont des
    // lieux qui n'existent plus dans l'espace logique : on les masque quand
    // elles apparaissent comme enfants directs de la racine. Leur contenu
    // remonte par ailleurs, via les autres candidats. `bin` n'est pas
    // concerné — c'est un vrai dossier, il reste.
    const children = folder.children
      ?.filter(
        (child) =>
          !(
            child.type === 'folder' &&
            isFoldedStratumPath(child.path, this.appRoot)
          ),
      )
      .map((child) => this.foldNode(child));

    return {
      type: 'folder',
      name,
      path,
      children,
      hasChildren: folder.hasChildren,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*  Fusion des arbres repliés                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fusionne deux arbres qui partagent le même path logique.
 *
 * Cousin de `mergeFolderTrees` (virtualStorage.ts), qui fusionne DEUX
 * PROVIDERS. Celui-ci fusionne DEUX STRATES du même provider. Deux règles
 * les distinguent, et elles comptent :
 *
 * ─── 1. Les fichiers ne sont JAMAIS dédupliqués ───────────────────────────
 *
 * Entre providers, un fichier n'appartient qu'à un seul backend : une
 * concaténation suffit. Entre strates, `pending/cours/x/photo` et
 * `published/cours/x/photo` sont DEUX fichiers distincts qui, une fois
 * repliés, portent le MÊME path logique — une photo publiée et sa
 * remplaçante homonyme en attente de relecture, cas parfaitement banal.
 * Dédupliquer par path en cacherait une. On les garde tous les deux ; c'est
 * leur `storagePath` qui les distingue, et c'est lui qui sert d'identité.
 *
 * ─── 2. La frontière de profondeur est préservée ──────────────────────────
 *
 * `children === undefined` (« non chargé ») ne doit jamais devenir `[]`
 * (« vide pour de vrai ») : la TreeView en conclurait que le dossier est
 * vide et refuserait de le déplier. Même discipline que `mergeFolderTrees`
 * — dont c'était précisément le bug corrigé juste avant ce chantier.
 */
function mergeFoldedFolders(
  a: StorageFolderNode,
  b: StorageFolderNode,
): StorageFolderNode {
  const hasChildrenHint = (a.hasChildren ?? false) || (b.hasChildren ?? false);

  const aLoaded = a.children !== undefined;
  const bLoaded = b.children !== undefined;

  if (!aLoaded && !bLoaded) {
    return {
      type: 'folder',
      name: a.name,
      path: a.path,
      hasChildren: hasChildrenHint,
    };
  }

  const folders = new Map<string, StorageFolderNode>();
  const files: StorageFileNode[] = [];

  for (const child of [...(a.children ?? []), ...(b.children ?? [])]) {
    if (child.type === 'file') {
      files.push(child);
      continue;
    }
    const existing = folders.get(child.path);
    folders.set(
      child.path,
      existing ? mergeFoldedFolders(existing, child) : child,
    );
  }

  const children = [...folders.values(), ...files];

  return {
    type: 'folder',
    name: a.name,
    path: a.path,
    children,
    hasChildren: hasChildrenHint || children.length > 0,
  };
}
