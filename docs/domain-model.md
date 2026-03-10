# Domain Model

Ce document décrit la **modélisation du domaine métier** du projet.

Le projet représente le **site d'un club d'arts martiaux**, comprenant :

-   la gestion des utilisateurs
-   la gestion des rôles et permissions
-   la gestion des cours et stages
-   la publication de contenus
-   la gestion des médias (images)
-   une galerie d'images
-   un explorateur de fichiers Cloudinary

------------------------------------------------------------------------

# Entités principales

-   User
-   Role
-   Permission
-   Course
-   Stage
-   Post
-   Category
-   Media
-   TrashEntry

------------------------------------------------------------------------

# Diagramme conceptuel

``` mermaid
erDiagram

User {
  string id
  string email
  string password
  string roleId
}

Role {
  string id
  string name
}

Permission {
  string id
  string name
}

Course {
  string id
  string name
}

Stage {
  string id
  string title
  datetime date
}

Post {
  string id
  string title
  string content
}

Category {
  string id
  string name
}

Media {
  string id
  string publicId
  string url
}

TrashEntry {
  string id
  string resourceId
  datetime deletedAt
}

User }o--|| Role : belongs_to
Role }o--o{ Permission : has
Post }o--|| Category : categorized
Post }o--|| User : author
Media ||--o{ TrashEntry : deleted
```

------------------------------------------------------------------------

# Entité User

Représente un utilisateur de l'application.

Propriétés principales :

-   id
-   email
-   password
-   roleId
-   createdAt
-   updatedAt

------------------------------------------------------------------------

# Entité Role

Permet de définir les niveaux d'accès.

Exemples :

-   admin
-   instructor
-   member

------------------------------------------------------------------------

# Entité Permission

Granularité des accès.

Exemples :

-   create_post
-   edit_post
-   delete_post
-   manage_users

------------------------------------------------------------------------

# Entité Course

Représente un cours régulier du club.

Exemples :

-   cours enfants
-   cours adultes
-   cours compétition

------------------------------------------------------------------------

# Entité Stage

Représente un événement ponctuel.

Exemples :

-   stage avec un invité
-   stage intensif
-   stage découverte

------------------------------------------------------------------------

# Entité Post

Représente un contenu publié sur le site.

Exemples :

-   actualités du club
-   annonces
-   comptes rendus d'événements

------------------------------------------------------------------------

# Entité Category

Permet de classer les posts.

Exemples :

-   actualités
-   stages
-   pédagogie

------------------------------------------------------------------------

# Entité Media

Représente une image stockée sur Cloudinary.

Propriétés typiques :

-   publicId
-   url
-   width
-   height
-   folder

------------------------------------------------------------------------

# Entité TrashEntry

Permet de gérer la corbeille applicative pour les médias.

Objectifs :

-   restaurer un média supprimé
-   supprimer définitivement
-   conserver une trace des suppressions
