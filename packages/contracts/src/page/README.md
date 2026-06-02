# Page Content Contracts

Ce dossier contient les **contrats versionnés** décrivant la structure du
contenu d'une page — c'est-à-dire l'objet composite produit par le
**builder** et consommé par le  **renderer** .

Ces contrats définissent ce que l'application comprend comme « page » :
une liste ordonnée de blocs discriminés par leur `type`, où chaque type
porte sa propre forme et son propre comportement de rendu.

---

## 🎯 Objectifs

* Formaliser une **vision métier stable** du contenu d'une page
* Séparer clairement :
  * les **données** (le composite sérialisable, ce dossier)
  * le **builder** (UI d'édition, `features/page-builder`)
  * le **renderer** (UI de lecture, `features/page-renderer`)
* Permettre une **évolution maîtrisée** via le versioning
* Servir de **source de vérité unique** pour la validation tRPC,
  l'extraction de références, et la migration entre versions

---

## 🧱 Structure d'une page

Un `PageContent` est un envelope versionné :

```ts
{
  version: 1,
  blocks: [Block, Block, Block, ...]
}
```

Chaque `Block` est une union discriminée sur `type`. Quatre types
définis en v1 :

| `type`             | Forme du contenu                              | Renderer attendu            |
| -------------------- | --------------------------------------------- | --------------------------- |
| `tiptap`           | ProseMirror JSON (opaque pour le contrat)     | HTML enrichi, RSC           |
| `image-gallery`    | Liste de `{ mediaId, caption? }`+`layout` | Galerie d'images            |
| `audio-collection` | Liste de `{ mediaId, title? }`              | Lecteur audio multi-piste   |
| `document-list`    | Liste de `{ mediaId, label? }`              | Liste de liens télécharg. |

---

## 📐 Référence stable, pas chemin volatile

Les blocs média stockent un `mediaId` (cuid stable de `MediaAsset`),
**jamais** un `fullPath` ni une URL.

Pourquoi : un asset peut être renommé ou déplacé à l'intérieur de
`published` sans casser la page qui le référence — le `mediaId` reste
stable, c'est `MediaAsset.publicId` / `MediaAsset.fullPath` qui se
mettent à jour côté DB lors d'un rename Cloudinary.

La résolution `mediaId → URL` se fait au moment du rendu, via une query
batch côté serveur, et n'apparaît jamais dans le composite persisté.

---

## 🧮 L'extracteur (`extractMediaIds.ts`)

Deux fonctions pures qui collectent les `mediaId` :

* `extractMediaIdsFromBlock(block)` — un seul bloc
* `extractMediaIdsFromContent(content)` — un contenu entier, dédupliqué

Utilisations :

* **Backend** , au save d'une page : calculer le diff entre les
  références anciennes et nouvelles pour synchroniser
  `PageMediaReference` dans la même transaction Prisma que la mise à
  jour de la page (cf. sous-chantier 4 du plan).
* **Frontend** , dans le builder : afficher *« si tu supprimes ce bloc,
  N médias seront libérés »* — affordance pour comprendre l'effet d'une
  suppression sur la table de jointure.

Le `switch` sur `block.type` est exhaustif : ajouter un type au
`pageBlockSchemaV1` sans étendre l'extracteur produit une erreur de
compilation (grâce à `assertNever`). C'est le garde-fou principal
contre les références fantômes au moment où le contrat évolue.

### Cas particulier : ProseMirror

Le contenu d'un bloc `tiptap` est traité comme opaque par le schema
(`Record<string, unknown>`). L'extracteur le traverse récursivement
pour trouver les nodes `library-image` (introduits par l'extension
TipTap du builder — cf. sous-chantier 3) et collecter leurs
`attrs.mediaId`.

La traversée est **défensive** : un payload mal formé ou inattendu
rend une liste vide plutôt que de jeter. Le save d'une page ne doit
pas exploser à cause d'un artefact d'édition.

---

## 🗓️ Versioning

Une version = un fichier (`blocks.v1.ts`, puis `blocks.v2.ts`...).

Les noms de types canoniques (`PageBlock`, `PageContent`) sont
suffixés par leur version (`PageBlockV1`, `PageContentV1`) pour qu'on
puisse importer deux versions côte-à-côte si jamais on écrit un
migrateur :

```ts
import { pageContentSchemaV1 } from '@contracts/page/blocks.v1'
import { pageContentSchemaV2 } from '@contracts/page/blocks.v2'
import { migrate as migrateV1toV2 } from '@contracts/page/migrate.v1ToV2'
```

### Quand créer une v2

Créer une nouvelle version si :

* un champ change de sens
* un champ devient obligatoire / optionnel d'une façon qui casse les
  payloads existants
* la structure d'un bloc évolue
* un nouveau type de bloc apparaît **et** modifie la sémantique des
  blocs existants

### Cas légers qui ne justifient PAS une v2

* ajout d'un nouveau type de bloc sans toucher aux autres : on étend
  `pageBlockSchemaV1` (les payloads existants restent valides)
* ajout d'un champ optionnel non porteur de sens
* renommage interne d'un type ou d'une variable

### Règles d'or

* ❌ Ne jamais importer deux versions du même contrat dans un même
  fichier de production (réservé aux migrateurs)
* ❌ Ne jamais modifier un schema vN après sa publication en prod
* ✅ Toujours préfixer les types canoniques par leur version (`V1`,
  `V2`...) pour éviter les collisions
* ✅ Écrire le migrateur `vN → vN+1` **en même temps** que la nouvelle
  version (pas plus tard)

---

## 🧠 Frontière contrat / builder / renderer

```
                   ┌──────────────────────────┐
                   │  @contracts/page         │
                   │                          │
                   │  - pageBlockSchemaV1     │
                   │  - pageContentSchemaV1   │
                   │  - extractMediaIds...    │
                   └──────────┬───────────────┘
                              │ source de vérité
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │  builder   │ │   backend  │ │  renderer  │
        │            │ │            │ │            │
        │ - Editor   │ │ - validate │ │ - View     │
        │ - +menu    │ │ - sync ref │ │ - dispatch │
        │ - DnD      │ │ - enforce  │ │ - resolve  │
        └────────────┘ └────────────┘ └────────────┘
```

Le builder, le backend et le renderer ne se parlent jamais directement.
Ils partagent uniquement ce contrat. C'est la même discipline appliquée
à `@contracts/storage` (un contrat agnostique consommé par des adapters
concrets) ou `@contracts/cloudinary/tree.contract.v1` (un contrat
versionné consommé par un mapper). Le composite de page rejoue ce motif
sur un nouveau terrain.
