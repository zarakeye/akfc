# Roadmap pédagogique du projet

Ce projet sert de base à une série de tutoriels autour du développement
d'une application fullstack moderne avec **Next.js**, **React 19**,
**TypeScript**, **tRPC**, **Prisma** et **Cloudinary**.

Le fil rouge du projet est la création du **site d'un club d'arts
martiaux**, comprenant :

-   gestion des utilisateurs
-   gestion des rôles et permissions
-   gestion des contenus (posts)
-   gestion des médias
-   gestion des cours et stages
-   une galerie d'images
-   un explorateur de fichiers Cloudinary (Finder)

Chaque fonctionnalité du projet est utilisée comme support pédagogique
pour expliquer un aspect spécifique du développement d'une application
moderne.

------------------------------------------------------------------------

# Objectifs pédagogiques

Ce projet vise à démontrer :

-   la conception d'une **architecture fullstack cohérente**
-   la séparation claire des responsabilités dans une application
    moderne
-   la mise en place d'un **backend typé**
-   la gestion avancée des médias
-   l'utilisation de **React 19 et de ses nouveaux patterns**
-   la création d'interfaces riches et interactives

Chaque partie du projet est accompagnée d'explications détaillées et de
tutoriels.

------------------------------------------------------------------------

# Structure des tutoriels

Les tutoriels sont organisés par thèmes et suivent une progression
logique, depuis l'architecture générale du projet jusqu'aux
fonctionnalités avancées.

------------------------------------------------------------------------

# Phase 1 --- Architecture du projet

Objectif : comprendre l'organisation globale du projet.

Tutoriels associés :

-   Présentation du projet
-   Pourquoi Next.js App Router
-   Organisation du repository
-   Architecture feature-based
-   Séparation UI / state / model / adapters
-   Organisation du backend (routers / services / schemas / mappers /
    guards)

------------------------------------------------------------------------

# Phase 2 --- Modélisation du domaine

Objectif : comprendre comment modéliser une application métier.

Tutoriels associés :

-   Analyse du domaine d'un club d'arts martiaux
-   Définition des entités principales
-   Relations entre les entités
-   Justification des propriétés
-   Mise en place du RBAC (Role Based Access Control)

------------------------------------------------------------------------

# Phase 3 --- Backend

Objectif : construire un backend structuré et typé.

Tutoriels associés :

-   Introduction à tRPC
-   Organisation des routers
-   Organisation des services
-   Validation avec Zod
-   Création de DTO
-   Utilisation des mappers
-   Guards et sécurité

------------------------------------------------------------------------

# Phase 4 --- Authentification

Objectif : mettre en place un système d'authentification complet.

Tutoriels associés :

-   Architecture de l'authentification
-   Gestion du login
-   Gestion des sessions
-   Hash des mots de passe
-   Reset password
-   Guards frontend
-   Guards backend

------------------------------------------------------------------------

# Phase 5 --- Formulaires fullstack

Objectif : simplifier la gestion des formulaires dans une application
fullstack.

Tutoriels associés :

-   Introduction à useForm
-   Introduction à useActionState
-   Validation serveur avec Zod
-   Gestion des erreurs
-   Gestion des états serveur

------------------------------------------------------------------------

# Phase 6 --- Gestion des médias (Cloudinary)

Objectif : gérer efficacement les images dans une application moderne.

Tutoriels associés :

-   Introduction à Cloudinary
-   Upload d'images
-   Gestion des dossiers
-   Création d'un Finder Cloudinary
-   Drag & Drop
-   Gestion de la corbeille
-   Cropper d'image

------------------------------------------------------------------------

# Phase 7 --- Finder Cloudinary

Objectif : créer un explorateur de fichiers riche.

Tutoriels associés :

-   Architecture du Finder
-   Tree View
-   Grid View
-   Multi-sélection
-   Drag & Drop
-   Gestion de la corbeille
-   Mapping des actions
-   Guards de déplacement

------------------------------------------------------------------------

# Phase 8 --- Gestion des contenus

Objectif : créer un système de publication.

Tutoriels associés :

-   Introduction à l'éditeur Tiptap
-   Création d'un éditeur riche
-   Gestion des images dans l'éditeur
-   Stockage du contenu
-   Rendu des posts

------------------------------------------------------------------------

# Phase 9 --- Hooks personnalisés

Objectif : comprendre et créer des hooks réutilisables.

Hooks présentés :

-   useThrottledCallback
-   useElementRect
-   useMenuNavigation
-   useIsBreakpoint
-   useUnmount
-   useLongPress

------------------------------------------------------------------------

# Phase 10 --- Optimisation

Objectif : améliorer la qualité et les performances de l'application.

Tutoriels associés :

-   Patterns React 19
-   gestion des effets
-   optimisation des hooks
-   gestion des listeners
-   accessibilité
-   architecture finale

------------------------------------------------------------------------

# Conclusion

Cette roadmap structure la progression pédagogique du projet et sert de
guide pour la création des tutoriels.
