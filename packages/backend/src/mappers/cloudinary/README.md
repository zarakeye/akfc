# Cloudinary Tree Mappers

Ce dossier contient les **mappers responsables de la transformation**
entre les **contrats Cloudinary versionnés côté backend**
et les **modèles utilisés côté frontend**.

Un mapper est une **frontière explicite** entre deux mondes :

- le backend (Cloudinary, sécurité, contrats)
- le frontend (UI, navigation, interactions)

---

## 🎯 Rôle d’un mapper

Un mapper sert à :

- traduire un **contrat backend** en un **modèle frontend**
- protéger le frontend des évolutions backend
- garantir un typage strict et prévisible
- centraliser toute logique de transformation

> Le frontend ne connaît **jamais** Cloudinary
> Il ne manipule que ses **propres modèles**

---

## 📦 Organisation

Chaque mapper est **aligné sur une version de contrat** :

- tree.v1.mapper.ts
- tree.v2.mapper.ts (à venir)

👉 **Un contrat = un mapper**
👉 Le versioning est porté par le **nom du fichier**

---

## 🔗 Dépendances autorisées

Un mapper peut importer :

- ✅ un **contrat backend versionné**
- ✅ des **types frontend**
- ❌ jamais l’inverse

Exemple :

```ts
import type { CloudinaryNode } 
  from '@server/contracts/cloudinary/tree.contract.v1';

import type { FolderNode, FileNode } 
  from '@contracts/finder';
```

---



## **🔄 Flux de données**

Cloudinary raw data
        ↓
buildCloudinaryTree()
        ↓
CloudinaryNode (v1)
        ↓
tree.v1.mapper.ts
        ↓
FolderNode / FileNode (frontend)
        ↓
UI (Finder)


Le mapper est le **seul endroit** où cette transformation est autorisée.

---

## **🧩 Principes de conception**

### **1. Mapping explicite**

Chaque type possède sa fonction dédiée :

* mapCloudinaryFolderToClient
* mapCloudinaryFileToClient

Cela permet :

* une lecture claire
* une évolution ciblée
* des tests simples

---

### **2. Discriminated unions**

Les mappers s’appuient sur le champ :

type: 'folder' | 'file'


➡️ Pas de **instanceof**

➡️ Pas de heuristique fragile

➡️ Un comportement déterministe

---

### **3. Pas de logique métier**

Un mapper :

* ❌ ne valide pas
* ❌ ne filtre pas selon des règles business
* ❌ ne fait pas de permission checking

Il **traduit**, point.

---

## **🧪 Tests**

**Les mappers sont de ****bons candidats pour les tests unitaires** :

* entrée : contrat backend figé
* sortie : modèle frontend attendu

Aucune dépendance externe requise.

---

## **🚀 Évolution et versioning**

Créer un nouveau mapper si :

* le contrat backend change
* le modèle frontend change
* la correspondance n’est plus 1:1

Exemple :

- tree.contract.v2.ts
- tree.v2.mapper.ts


Les versions peuvent coexister temporairement sans conflit.

---

## **🧭 Philosophie**

> Le contrat décrit **ce que l’app sait**

> Le mapper décrit **comment elle le comprend**

> Le frontend ne doit jamais deviner

Ce dossier matérialise cette frontière.
