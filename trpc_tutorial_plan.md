# tRPC / Backend Tutorial Plan (Canonical)

## 🎯 Objectif du tutoriel

Construire un tutoriel immersif qui fait ressentir au lecteur :
- les limites de REST dans un monorepo TypeScript
- pourquoi tRPC devient une évidence
- comment les données circulent réellement dans le projet

Style :
- narration en “nous”
- tension pédagogique
- progression logique depuis Prisma et Forms

---

## 🧩 SECTION 0 — Fracture mentale : REST ne tient plus

### Intention
Créer un inconfort.

### Contenu
- On sort de Prisma → on a notre DB propre
- On sort des Forms → on sait envoyer des données
- Mais quelque chose cloche…

### Problèmes REST
- duplication des types
- désynchronisation frontend/backend
- endpoints verbaux vs logique métier

### Moment clé
> “Ok… là… il y a clairement un truc qui casse.”

### Callout
- REST = découplage fort mais friction TypeScript
- duplication = dette silencieuse

---

## 🔥 SECTION 1 — Pourquoi tRPC devient inévitable

### Intention
Faire comprendre que tRPC n’est pas “cool”, mais nécessaire.

### Contenu
- monorepo TypeScript → types partagés
- besoin d’un contrat unique
- suppression des couches inutiles

### Comparaison REST vs tRPC (code réel)
- endpoint REST
- appel fetch
- validation manuelle

VS

- procedure tRPC
- appel typé direct

### Callout
- tRPC = contrat partagé
- zéro sérialisation mentale

---

## 🧠 SECTION 2 — Vision globale du système

### Intention
Donner une carte mentale claire.

### Diagramme logique

Client → React Query → tRPC → Context → Service → Prisma → DB

### Explication de chaque couche
- client (hooks)
- router tRPC
- context
- services
- Prisma

### Callout
- chaque couche a un rôle strict
- aucune logique dupliquée

---

## ⚙️ SECTION 3 — Le cœur : initTRPC et core.ts

### Fichiers
- packages/backend/src/trpc/core.ts

### Contenu
- initTRPC
- context
- publicProcedure / protectedProcedure

### Tension
> “Tout part d’ici… si on ne comprend pas ça, on ne comprend rien.”

### Callout
- tRPC = framework minimal
- tout repose sur le context

---

## 🔐 SECTION 4 — Le contexte (le vrai pivot)

### Fichiers
- createTRPCContext
- getSessionFromRequest

### Contenu
- injection session
- prisma
- request metadata

### Moment clé
> “Le backend n’est pas stateless… il est reconstruit à chaque appel.”

### Callout
- context = cerveau de la requête
- transport de la session

---

## 🧱 SECTION 5 — Les routers (logique métier exposée)

### Fichiers
- modules/*/router.ts

### Contenu
- structure d’un router
- procédures
- validation Zod

### Exemple réel
- login
- user.profile

### Callout
- router = API logique
- Zod = garde-fou

---

## 🧪 SECTION 6 — Les services (la vraie logique)

### Fichiers
- modules/*/services

### Contenu
- séparation logique métier
- pourquoi ne pas tout mettre dans le router

### Moment clé
> “Le router ne pense pas. Il délègue.”

### Callout
- services = logique pure
- testabilité

---

## 🔄 SECTION 7 — Le circuit complet de la data

### Intention
Vision end-to-end

### Parcours
1. Form submit
2. Server Action / mutation
3. tRPC call
4. router
5. service
6. Prisma
7. retour client

### Callout
- flux unique
- aucune magie

---

## ⚡ SECTION 8 — Côté frontend (React Query + hooks)

### Contenu
- useQuery / useMutation
- typage automatique

### Comparaison REST
- plus de fetch
- plus de parsing JSON

### Callout
- DX incroyable
- zéro friction

---

## 🧨 SECTION 9 — Erreurs, validation et UX

### Contenu
- erreurs Zod
- erreurs métier
- mapping vers UI

### Callout
- backend = source de vérité
- frontend = UX

---

## 🧭 SECTION 10 — Pourquoi ce système est supérieur ici

### Intention
Conclusion forte

### Contenu
- monorepo + TypeScript → tRPC naturel
- cohérence globale
- maintenabilité

### Callout final
- un seul langage
- un seul contrat
- un seul flux mental

---

## 📌 BONUS — Lien avec les autres tutos

- Prisma → stockage
- Forms → input
- tRPC → transport
- Auth → sécurité
- Cloudinary → assets

---

## 🧱 Livrables attendus

- CodeExample avec vrais fichiers
- Callout à chaque section
- narration immersive
- comparaisons REST visibles
