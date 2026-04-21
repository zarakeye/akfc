# 📦 Backend Architecture – README (Version Formation)

## 🎯 Objectif

Ce backend est structuré pour :
- comprendre facilement le code
- apprendre une architecture scalable
- séparer clairement les responsabilités

---

## 🧱 Structure globale

```
src/
├── email/
├── lib/
├── mappers/
├── middlewares/
├── modules/
├── trpc/
├── types/
├── prisma.ts
```

---

## 🧠 Philosophie

### 1. Modules = logique métier
Chaque dossier dans `modules/` correspond à un domaine :
- auth
- users
- cloudinary
- etc.

### 2. Infrastructure
- `trpc/` → expose l’API
- `lib/` → outils partagés

### 3. Services transverses
- `email/`
- `mappers/`

---

## 📦 Exemple : module auth

```
auth/
├── router.ts
├── getSessionFromRequest.ts
├── services/
│   ├── auth.service.ts
│   └── passwordReset.service.ts
```

### Rôles

- `router.ts` → point d’entrée
- `services/` → logique métier
- `getSessionFromRequest.ts` → gestion session

---

## 🧩 Règles importantes

### ✅ À faire

- garder les routers simples
- mettre la logique dans services
- organiser progressivement (pas trop tôt)

### ❌ À éviter

- logique métier dans router
- duplication de code
- mélange des responsabilités

---

## 🔁 Flow complet

```
Client
 → router tRPC
   → validation (Zod)
   → service métier
     → DB / API
 → réponse
```

---

## 🧠 Ce qu’il faut retenir

- Zod protège les entrées
- tRPC structure les routes
- les services contiennent la vraie logique
- l’architecture est modulaire

---

## 🎓 Pourquoi cette architecture est pédagogique

Elle permet de comprendre :

- où écrire quoi
- comment découper un backend
- comment évoluer sans casser le code

---

## 🚀 Étape suivante

- ajouter des rôles et permissions
- renforcer les middlewares
- documenter chaque module
