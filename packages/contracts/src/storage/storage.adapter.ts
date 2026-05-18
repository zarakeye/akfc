import type {
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageMetadata,
  StorageMoveOperation,
  StoragePath,
} from './storage.types';

/**
 * Contrat de base d'un adapter de stockage.
 *
 * ─── La philosophie ────────────────────────────────────────────────────────
 *
 * Ce contrat définit le vocabulaire neutre que tout backend (Cloudinary, R2,
 * S3, FS local…) doit savoir parler pour s'intégrer au router storage du
 * finder. Aucune mention de provider concret ici, par construction.
 *
 * Il couvre les opérations génériques sur un sac de fichiers : lister, lire,
 * déplacer, supprimer. Toute opération qui dépendrait fondamentalement du
 * provider — au premier rang desquelles la fabrication d'autorisations
 * d'upload — est extraite vers une interface séparée (UploadCapableAdapter).
 *
 * ─── Pourquoi cette séparation noyau/capabilities ──────────────────────────
 *
 * Lister, déplacer ou lire des fichiers sont des opérations qui ont une
 * sémantique cohérente entre tous les providers : un dossier reste un
 * dossier, un fichier reste un fichier, même si le stockage sous-jacent
 * est radicalement différent. Le contrat agnostique tient debout.
 *
 * En revanche, "fabriquer une autorisation d'upload" est une mécanique
 * qui diffère trop d'un provider à l'autre pour qu'un type unique puisse
 * la couvrir sans renier toute information utile :
 *   - Cloudinary signe un hash SHA1 sur (folder, public_id, timestamp, type)
 *     et renvoie une signature + apiKey + cloudName.
 *   - R2 délivre une presigned URL avec une expiration et des headers HTTP.
 *   - Un FS local n'a même pas le concept (l'upload est un POST direct).
 *
 * Forcer un type unique sur ces sorties reviendrait à un `unknown` déguisé.
 * On préfère donc un design où le NOYAU reste agnostique (et tout le reste
 * du finder peut s'appuyer dessus sans connaître le provider), pendant que
 * les capabilities provider-spécifiques vivent dans des interfaces dédiées,
 * paramétrables par génériques.
 *
 * Toutes les méthodes sont async. Toutes peuvent throw — la sémantique
 * exacte des erreurs (réseau, autorisation, asset introuvable) est à la
 * charge de l'adapter. Le router storage qui orchestre les appels les
 * traduira en TRPCError au bon code.
 */
export interface StorageAdapter {
  /**
   * Liste les enfants directs d'un dossier (un seul niveau).
   *
   * Pour la grille de contenu central et toute lecture où on n'a pas
   * besoin de la sous-arborescence. Cursor-based pour scaler aux
   * gros dossiers.
   */
  list(options: ListOptions): Promise<ListResult>;

  /**
   * Lit un sous-arbre jusqu'à `depth` niveaux.
   *
   * Pour la TreeView dépliable et le DnD : permet à la UI de connaître
   * un voisinage hiérarchique en un seul aller-retour, ce qui rend
   * fluide le déplacement par drag-and-drop entre branches voisines.
   *
   * `depth: 1` par défaut équivaut à `list` en termes de couverture
   * (un seul niveau d'enfants), avec un retour structuré en arbre.
   */
  getTree(options: GetTreeOptions): Promise<GetTreeResult>;

  /**
   * (optionnel) Lit un node précis à un path donné.
   *
   * Renvoie `null` si le path n'existe pas. Utile pour valider une cible
   * avant move ou pour rafraîchir un node dans le cache UI.
   */
  getNode?(path: StoragePath): Promise<StorageNode | null>;

  /**
   * (optionnel) Lit les métadonnées brutes d'un asset.
   *
   * Utile pour les revérifications de cohérence à la persistance
   * (cf. couche 5 du registerUploadedAssets — relecture serveur).
   */
  getMetadata?(path: StoragePath): Promise<StorageMetadata | null>;

  /**
   * (optionnel) Déplace un file ou un folder vers un nouveau path.
   *
   * Opération bas-niveau, atomique du point de vue de l'adapter : un
   * seul item, paths source et target concrets. Toute l'expressivité
   * riche du domaine (multi-sélection, cibles par statut applicatif)
   * est portée par `StorageMoveIntent` au niveau du contrat, et résolue
   * en N appels `move()` par le service `resolveMoveIntent` côté backend.
   *
   * Sémantique (atomique ? recursif côté provider ? que se passe-t-il
   * si la cible existe ?) à la charge de l'adapter, qui doit la
   * documenter. Le router storage doit aussi documenter les attentes
   * minimales que tout adapter doit satisfaire.
   */
  move?(operation: StorageMoveOperation): Promise<void>;

  /**
   * (optionnel) Soft-delete un file ou un folder.
   *
   * Sémantique exacte (où vont les éléments ? sont-ils vraiment
   * effaçables ensuite ?) à la charge de l'adapter. Pour Cloudinary,
   * c'est un déplacement vers `${appRoot}/bin/.trash/<uuid>/`.
   */
  delete?(path: StoragePath): Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*  Capability d'upload — interface séparée, paramétrable par génériques      */
/* -------------------------------------------------------------------------- */

/**
 * Capability d'upload direct client → stockage tiers.
 *
 * À implémenter EN COMPLÉMENT de StorageAdapter par les adapters qui
 * supportent l'upload. Un adapter en lecture seule (un index r/o sur
 * un bucket existant, par exemple) peut très bien implémenter
 * StorageAdapter sans implémenter UploadCapableAdapter.
 *
 * Les types `TAuthInput`, `TAuthOutput`, `TRegisterInput`, `TRegisterOutput`
 * sont laissés génériques parce qu'ils sont, par nature, provider-spécifiques.
 * Chaque adapter concret les concrétise selon sa propre API :
 *
 *   class CloudinaryAdapter implements
 *     StorageAdapter,
 *     UploadCapableAdapter<
 *       CreateUploadSignaturesInput,
 *       CreateUploadSignaturesOutput,
 *       RegisterUploadedAssetsInput,
 *       RegisterUploadedAssetsOutput
 *     > { ... }
 *
 * Cette concrétion est ensuite portée par le router storage : la procédure
 * `storage.createUploadAuthorization` discrimine sur le `provider` reçu en
 * input et type son retour selon l'adapter sélectionné.
 *
 * Le client qui consomme l'autorisation doit donc savoir quel provider
 * il manipule — ce qui est attendu et même souhaitable, parce que la
 * mécanique d'upload qu'il devra exécuter (POST FormData vers Cloudinary
 * vs PUT vers une presigned URL R2) lui est intrinsèquement liée.
 */
export interface UploadCapableAdapter<
  TAuthInput = unknown,
  TAuthOutput = unknown,
  TRegisterInput = unknown,
  TRegisterOutput = unknown,
> {
  /**
   * Délivre une autorisation d'upload bornée pour un ou plusieurs assets.
   *
   * Le client utilisera cette autorisation pour POSTer/PUTer directement
   * vers le service de stockage, sans passer par le backend. La nature
   * exacte de l'autorisation (signature SHA1, presigned URL…) est
   * provider-spécifique.
   */
  createUploadAuthorization(input: TAuthInput): Promise<TAuthOutput>;

  /**
   * Persiste les assets uploadés en base, après revérification serveur.
   *
   * Le client appelle cette méthode après un upload réussi. C'est ici
   * que se joue le travail de "reconstruire la confiance" : le backend
   * relit l'asset depuis le service de stockage et compare aux assertions
   * du client avant d'écrire en base.
   */
  registerUploadedAsset(input: TRegisterInput): Promise<TRegisterOutput>;
}
