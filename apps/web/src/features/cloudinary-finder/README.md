# Cloudinary Finder

Le **Cloudinary Finder** est un explorateur de médias (type “Finder/Explorer”) construit sur Next.js (App Router) + tRPC, avec :

- une **Tree View** (navigation dossiers + racines virtuelles),
- une **Grid View** (liste fichiers/dossiers),
- un système de **multi-sélection**,
- du **drag & drop** (avec ghost custom),
- une gestion “corbeille” (Bin/Trash) cohérente avec les contraintes Cloudinary + DB.

Objectif principal : une feature **présentable** (exposé / tutoriels) et **crédible** (architecture lisible, responsabilité claire des couches).

---

## Où est le module ?

`src/features/cloudinary-finder/`

Structure (résumé) :

- `ui/` : composants React (Tree, Grid, Layout, Trash, Preview, …)
- `state/` : stores Zustand (multi-select)
- `model/` : types + règles de domaine côté client
- `utils/` : helpers purs (mapping tree, breadcrumb, tri-state…)
- `dnd/` : dragGhost et logique DnD
- `adapters/` : mapping UI → intents métiers (move mapper)
- `guards/` : garde-fous métier côté UI
- `hooks/` : hooks utilitaires spécifiques au Finder

---

## Points d’entrée (UI)

### Layout global

- `ui/layout/FinderLayout.tsx`
  - orchestre la page Finder : Tree + Content + Preview + Multiselect

### Navigation Tree

- `ui/tree/TreeView.tsx`
- `ui/tree/AppTreeWrapper.tsx`
- `ui/tree/FolderNodeComponent.tsx`
- `ui/tree/VirtualFolderNodeComponent.tsx`

### Contenu (grid + actions + preview)

- `ui/content/FolderContentView.tsx`
- `ui/grid/GridFileItem.tsx`
- `ui/grid/GridFolderItem.tsx`
- `ui/preview/FilePreviewSidebar.tsx`

### Breadcrumb

- `ui/breadcrumb/BreadCrumb.tsx`

### Corbeille (Trash/Bin)

- `ui/trash/bin/BinRootView.tsx`
- `ui/trash/bin/BinGridFileItem.tsx`
- `ui/trash/bin/BinGridFolderItem.tsx`
- `ui/trash/navigator/TrashNavigatorView.tsx`
- `ui/trash/navigator/TrashFolderView.tsx`
- `ui/trash/navigator/TrashFileView.tsx`

### Multi-select (UI)

- `ui/multiSelect/MultiSelectSidebar.tsx`

---

## State management : sélection (Zustand)

### Store principal

- `state/selection/useSelectionStore.ts`

Ce store centralise :

- les items sélectionnés (fichiers/dossiers),
- la logique de toggle / range / mode,
- les helpers “is selected”, “count”, etc.

Types et helpers associés :

- `model/selection/selection.types.ts`
- `model/selection/selection.utils.ts`
- `utils/tri-state/triState.ts` (utile pour les états “partiel/plein/vide”)

---

## Drag & Drop (DnD)

### Gestion du ghost / dataset

- `dnd/dragGhost.manager.ts`

Rôle :

- supprimer proprement le drag image natif (ou le rendre transparent),
- afficher un ghost custom (et un badge),
- transporter les infos de source/selection dans le dataset,
- améliorer l’UX (z-index, offset, style).

Le DnD interagit fortement avec :

- la multi-sélection (si on drag un item sélectionné, on drag “le groupe”),
- les règles de move/capabilities (cibles autorisées),
- le mapping vers un intent métier (voir ci-dessous).

---

## Mapping UI → intent métier (Move / Trash / Restore)

Le Finder ne doit pas appeler “n’importe quelle mutation” directement au clic.
On passe par une couche de mapping et des garde-fous.

### Mapper principal

- `adapters/mappers/explorer.move.mapper.ts`

Responsabilités :

- convertir un DragSource + DropTarget en **MoveIntent** exploitable côté serveur,
- gérer les différences entre :
  - déplacement normal,
  - déplacement vers une racine virtuelle (bin/published/pending…),
  - restauration,
  - suppression définitive (si exposée).

### Factories / règles

- `model/move/move.factories.ts`
- `guards/finder.guards.ts`

Objectif :

- concentrer les règles “autorisé / interdit” et les normalisations d’intent,
- éviter la logique métier dispersée dans les composants.

---

## Utils importants

### Mapping tree

- `utils/mapping/injectStatusRoots.ts`
- `utils/mapping/tree.utils.ts`

Ces helpers servent à :

- enrichir / transformer le modèle d’arbre,
- injecter les racines virtuelles (si utilisées),
- uniformiser la structure attendue par la TreeView.

### Breadcrumb

- `utils/buildBreadCrumb.ts`
  - construit la breadcrumb depuis un path/location courant

### Trash UI / display

- `utils/binDisplayPath.ts`
- `utils/binTrashUI.ts`
  - conversions d’affichage spécifiques à la corbeille / bin

---

## Hooks spécifiques Finder

- `hooks/useLongPress.ts`
  - utile pour mobile/trackpad (ex: multi-select via long press)

---

## Flux “happy path” (du clic au rendu)

### 1) Navigation

1. TreeView sélectionne un dossier/racine.
2. FolderContentView reçoit la nouvelle “location”.
3. FolderContentView déclenche la récupération des données via tRPC.
4. Grid items render.

### 2) Sélection

1. Grid item click/shift/ctrl → appelle `useSelectionStore`.
2. Le store met à jour la sélection.
3. MultiSelectSidebar affiche le contexte (compte, actions possibles).

### 3) Drag & Drop

1. Démarrage du drag : `dragGhost.manager.ts` fabrique le ghost + dataset.
2. Drop sur un dossier/racine : `explorer.move.mapper.ts` calcule un MoveIntent.
3. Mutation tRPC appelée (move/trash/restore).
4. Invalidation / refetch, UI se met à jour.

---

## Relations avec le serveur (tRPC)

Le Finder est un client de :

- `cloudinary.router.ts` (listing, tree, move…)
- `trash.router.ts` (list bin, restore, delete forever, read trash folder…)

Côté serveur, les services pertinents vivent dans :

- `src/server/cloudinary/**`
- `src/server/services/trash/**`

Et la persistance Trash s’appuie sur Prisma :

- modèle `TrashEntry` (et éventuellement `CloudinaryFolder` selon ton design)

---

## Pièges connus (à surveiller)

- **Stale closures / hooks** : les handlers passés à des listeners (scroll/keydown/matchMedia/DnD) doivent éviter les captures obsolètes.
- **Multi-select + DnD** : décider clairement si on drag “un item” ou “le groupe sélectionné”.
- **Racines virtuelles** : garder une séparation nette entre “UI root” et “données réellement persistées”.
- **Invalidation tRPC** : s’assurer que les mutations déclenchent bien le refetch des listes impactées.
- **Performance** :
  - throttling sur scroll/resize,
  - éviter de rebind des listeners à chaque render,
  - virtualiser si la grid grossit.

---

## TODO (liste utile et actionnable)

- [ ] Documenter précisément le modèle de “location” (path, root, status) et ses invariants.
- [ ] Ajouter des tests (unit) sur :
  - mapping drag source/target → MoveIntent
  - règles guards (autorisé/interdit)
  - helpers selection.utils (range, toggle)
- [ ] Ajouter un “barrel export” (`index.ts`) si on veut une API publique stable du Finder.
- [ ] Clarifier le contrat exact Bin vs Trash (vue, règles, capabilities) dans la doc.
- [ ] Instrumenter la UX DnD (ghost offsets multiples, feedback forbidden drop).
