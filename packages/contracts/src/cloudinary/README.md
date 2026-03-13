# Cloudinary Tree Contracts

Ce dossier contient les **contrats métier versionnés** décrivant la représentation
de l’arborescence Cloudinary telle qu’utilisée par l’application.

Ces contrats définissent **ce que l’application comprend et manipule**,
indépendamment du format brut renvoyé par l’API Cloudinary.

---

## 🎯 Objectifs

- Formaliser une **vision métier stable** de Cloudinary
- Séparer clairement :
  - les données **brutes Cloudinary**
  - la **représentation interne de l’application**
- Permettre une **évolution maîtrisée** via le versioning
- Servir de **contrat tRPC** entre backend et frontend

---

## 🧱 Concept fondamental

Cloudinary **ne stocke que des fichiers**.
Les dossiers sont une **convention logique** déduite du `public_id`.

L’application, elle, travaille avec une **arborescence explicite** composée de :

- dossiers
- fichiers

Ces contrats décrivent cette arborescence.

---

## 📦 Structure des versions

Chaque version de contrat est isolée dans son propre fichier :

- tree.contract.v1.ts
- tree.contract.v2.ts (à venir)

👉 **Une version = un fichier**
👉 **Les noms de types restent stables**

Exemple :

- `CloudinaryNode` existe en v1, v2, etc.
- La version est portée par le **chemin d’import**, pas par le nom du type.

---

## 🧩 Contrat v1 — `tree.contract.v1.ts`

### Types exposés

- `CloudinaryNode`Union discriminée représentant un nœud de l’arbre.
- `CloudinaryFolderNode`Représente un dossier logique Cloudinary.
- `CloudinaryFileNode`
  Représente un fichier image Cloudinary.

### Discriminated Union

Chaque nœud possède un champ :

```ts
type: 'folder' | 'file'
```


Cela permet :

* un typage sûr
* des type guards simples
* une logique claire côté frontend

---

## **📐 Pourquoi ces champs existent (v1)**

### **Champs communs (BaseNode)**

| **Champ** | **Rôle**                      |
| --------------- | ------------------------------------ |
| type            | Discriminant de type                 |
| name            | Nom lisible du dossier ou du fichier |

---



### **Dossier (CloudinaryFolderNode)**

| **Champ** | **Rôle**                       |
| --------------- | ------------------------------------- |
| path            | Identifiant logique unique du dossier |
| children        | Contenu récursif du dossier          |


➡️ Le **path** est la **clé fonctionnelle** du dossier

➡️ Il permet navigation, sélection, comparaison

---

### **Fichier (CloudinaryFileNode)**

➡️ Le **publicId** est utilisé pour :

* suppression
* déplacement
* validation métier

---

## **🔁 Mapping et responsabilité**

**Les contrats ** **ne sont jamais exposés directement au frontend** **.**

Un **mapper versionné** est responsable de :

* transformer le contrat Cloudinary → modèle client
* protéger le frontend des changements backend

Exemple :

tree.v1.mapper.ts


Chaque version de contrat possède son mapper dédié.

---

## **🧠 Règles d’or**

* ❌ Ne jamais importer deux versions d’un même contrat dans un même fichier
* ❌ Ne jamais exposer directement les types Cloudinary au frontend
* ✅ Toujours mapper via un fichier versionné
* **✅ Créer une nouvelle version ****uniquement si le contrat change**

---

## **🚀 Quand créer une nouvelle version ?**

Créer une **v2** si :

* un champ change de sens
* un champ devient obligatoire / optionnel
* la structure de l’arbre évolue
* un nouveau type de nœud apparaît

Ne PAS créer de nouvelle version pour :

* un renommage interne
* une optimisation technique
* un changement de mapper uniquement

---

## **🧭 Philosophie**

> Cloudinary est une **source de données**

> Le contrat est une **interprétation métier**

> Le mapper est une **frontière**

Ce dossier est la **référence canonique** de ce que Cloudinary représente

pour l’application.
