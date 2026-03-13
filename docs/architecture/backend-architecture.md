# Backend Architecture

Le backend est construit avec **tRPC** et suit une architecture en couches.

Objectifs :

- séparer les responsabilités
- isoler la logique métier
- garantir la sécurité
- faciliter les tests

---

# Structure du backend

```text
packages/backend/src
│
├─ routers
├─ services
├─ schemas
├─ mappers
├─ guards
├─ cloudinary
├─ auth
└─ middlewares
```

---

# Routers

Les routers exposent l’API.

Responsabilités :

- définir les procédures tRPC
- valider les entrées
- appeler les services

Exemples :

```text
cloudinary.router.ts
auth.router.ts
post.router.ts
```

---

# Services

Les services contiennent la **logique métier**.

Responsabilités :

- coordination des opérations
- accès à la base de données
- appels à des services externes

Exemples :

```text
cloudinary.service.ts
post.service.ts
user.service.ts
```

---

# Schemas

Les schemas utilisent **Zod**.

Ils permettent :

- validation runtime
- inférence de types
- uniformisation des données

Exemples :

```text
createUser.schema.ts
updatePost.schema.ts
moveAsset.schema.ts
```

---

# Mappers

Les mappers convertissent les données entre les différentes couches.

Exemples :

```text
Prisma → DTO
Cloudinary → modèle interne
```

---

# Guards

Les guards gèrent la sécurité.

Exemples :

- vérification d’authentification
- RBAC
- vérification d’accès à une ressource

Exemples :

```text
requireAdmin
requireAuthenticatedUser
```

---

# Cloudinary

La logique liée à Cloudinary est isolée dans :

```text
cloudinary/
```

Responsabilités :

- navigation dans les dossiers
- déplacement d’assets
- suppression
- restauration

Cette logique est utilisée par le **Cloudinary Finder** côté frontend.
