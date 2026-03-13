# Project Architecture

Ce document décrit l’architecture globale du projet.

Le projet est le **site d’un club d’arts martiaux** et sert également de base à une **série de tutoriels techniques** expliquant comment construire une application fullstack moderne.

Les technologies principales sont :

- Next.js (App Router)
- React 19
- TypeScript
- tRPC
- Prisma
- Cloudinary
- Zustand
- Zod

L’architecture est conçue pour permettre à terme l’ajout d’une **application mobile React Native via Expo**.

---

# Objectifs de l’architecture

L’architecture vise à :

- séparer clairement les responsabilités
- maintenir un backend fortement typé
- isoler la logique métier
- faciliter la réutilisation du code
- préparer l’intégration future d’une application mobile

---

# Architecture générale

Le projet suit une architecture en couches.

```text
UI
↓
State / Hooks
↓
Domain Model
↓
API Client
↓
Backend Services
↓
Database / External APIs
```

Chaque couche possède une responsabilité claire.

---

# Organisation du repository

Le projet est organisé sous forme de **workspace monorepo**.

```text
project-root
│
├─ apps
│  ├─ web
│  └─ mobile (future)
│
├─ packages
│  ├─ backend
│  └─ contracts
│
├─ docs
├─ prisma
└─ public
```

---

# Applications

## apps/web

Contient l’application **Next.js**.

Structure :

```text
apps/web/src
├─ app
├─ components
├─ features
├─ hooks
├─ lib
└─ styles
```

Responsabilités :

- UI
- état client
- appels API

---

## apps/mobile (future)

Contiendra l’application **React Native / Expo**.

Elle réutilisera :

- les contrats API
- certains types
- certaines règles métier

---

# Packages partagés

## packages/backend

Contient la logique backend réutilisable :

```text
routers
services
schemas
mappers
guards
cloudinary
auth
middlewares
```

---

## packages/contracts

Contient les **contrats partagés** :

- types TypeScript
- schémas Zod
- DTO
- constantes

Ce package garantit la cohérence entre :

- frontend web
- backend
- future application mobile

---

# Services externes

## Cloudinary

Cloudinary est utilisé pour :

- stockage d’images
- transformations
- CDN
- gestion des dossiers

Le projet inclut un **Finder Cloudinary personnalisé**.

---

## Base de données

La base de données est gérée via **Prisma**.

Elle stocke notamment :

- utilisateurs
- rôles
- posts
- métadonnées d’images
- corbeille

---

# Documentation

La documentation du projet se trouve dans :

```text
docs/
```

Elle sert à :

- expliquer l’architecture
- documenter les décisions techniques
- servir de base à des tutoriels
