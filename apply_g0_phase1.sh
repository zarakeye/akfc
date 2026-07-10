#!/bin/bash
# Chantier galeries — G.0 phase 1 : schéma (title requis, date,
# category/origin CUMULABLES) + migration + router.
# ⚠ KILL LE SERVEUR DEV AVANT DE LANCER.
# À lancer depuis la RACINE du monorepo : bash apply_g0_phase1.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

read -r -p "Le serveur dev est-il coupé ? (o/N) " rep
[ "$rep" = "o" ] || { echo "Coupe-le d'abord." >&2; exit 1; }

echo "-> 1/6 Écriture du schéma"
cat > prisma/schema.prisma << 'FILE_EOF'
generator client {
  provider        = "prisma-client-js"
  binaryTargets   = ["native"]
  engineType      = "binary"
  previewFeatures = ["relationJoins"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER & AUTH
// ============================================================================

model User {
  id                    String               @id @default(cuid())
  firstName             String?
  lastName              String?
  email                 String               @unique
  emailVerified         Boolean              @default(false)
  password              String
  birthDate             DateTime?
  phone                 String?
  image                 String?
  roleId                Int?
  memberSince           DateTime?
  isFirstLogin          Boolean              @default(true)
  createdAt             DateTime             @default(now())
  updatedAt             DateTime             @default(now()) @updatedAt
  aboutMe               String?
  pseudo                String?
  avatar                String?

  // --- Auth & profil
  role                  Role?                @relation(fields: [roleId], references: [id])
  preferences           Preferences?
  sessions              Session[]
  passwordResetTokens   PasswordResetToken[]

  // --- Audit
  auditLogsAsActor      AuditLog[]           @relation("AuditActor")
  auditLogsAsTargetUser AuditLog[]           @relation("AuditTargetUser")

  // --- Posts/comments/likes
  posts                 Post[]
  comments              Comment[]
  reactions Reaction[]        // ← AJOUT
  pollVotes PollVote[]        // ← AJOUT
  
  // --- Domaine métier (nouvelles relations)
  disciplinesAsInstructor   Discipline[]  @relation("DisciplineInstructor")
  coursesAsInstructor       Course[]      @relation("CourseInstructor")
  stagesAsPrimaryAnimator   Stage[]       @relation("StagePrimaryAnimator")
  stagesAsAnimator          Stage[]       @relation("StageAnimators")
  uploadedMediaAssets       MediaAsset[]  @relation("UserMediaUploads")
  eventsAsOrganizer         Event[]       @relation("EventOrganizer")  // ← AJOUT
}

model Permission {
  id          Int               @id @default(autoincrement())
  name        String            @unique
  description String?
  roles       RolePermissions[]
}

model Role {
  id          Int               @id @default(autoincrement())
  name        String            @unique
  description String?
  permissions RolePermissions[]
  users       User[]
}

model RolePermissions {
  roleId       Int
  permissionId Int
  permission   Permission @relation(fields: [permissionId], references: [id])
  role         Role       @relation(fields: [roleId], references: [id])

  @@id([roleId, permissionId])
}

model Preferences {
  id           Int     @id @default(autoincrement())
  displayEmail Boolean @default(false)
  displayPhone Boolean @default(false)
  darkMode     Boolean @default(true)
  userId       String  @unique
  description  String?
  user         User    @relation(fields: [userId], references: [id])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  createdAt DateTime @default(now())
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  expiresAt DateTime
  usedAt    DateTime?

  tokenHash String @unique
  userId    String
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  requestIp String?
  userAgent String?

  @@index([userId, createdAt])
  @@index([expiresAt])
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @default(now()) @updatedAt
}

// ============================================================================
// AUDIT
// ============================================================================

model AuditLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  actorUserId String?
  actorEmail  String?

  action AuditAction

  targetUserId String?
  meta         Json?

  actor      User? @relation("AuditActor", fields: [actorUserId], references: [id], onDelete: SetNull)
  targetUser User? @relation("AuditTargetUser", fields: [targetUserId], references: [id], onDelete: SetNull)

  @@index([actorUserId])
  @@index([targetUserId])
  @@index([action, createdAt])
}

enum AuditAction {
  USER_ROLE_CHANGED
}

// ============================================================================
// DOMAINE MÉTIER — Category → Discipline
// ============================================================================

/// Catégorisation haute des disciplines enseignées par le club.
///
/// `MARTIAL_ART` regroupe toutes les pratiques martiales (Karaté, Aikido, etc.).
/// `CALLIGRAPHY` regroupe les pratiques calligraphiques (shodō, etc.).
///
/// Cet enum reste volontairement court — il distingue les grands champs
/// pratiqués, pas les écoles ou styles (qui sont des `String?` libres
/// sur Discipline). À étendre si de nouveaux champs apparaissent dans
/// l'offre du club (méditation, tai-chi, etc.).
enum DisciplineType {
  MARTIAL_ART
  CALLIGRAPHY
}

/// Public visé par un cours ou un stage.
///
/// Détermine notamment l'accessibilité au passage de grade : les
/// adolescents n'y ont pas accès, les autres audiences oui (cette
/// règle métier vit côté applicatif, pas en contrainte DB).
enum Audience {
  /// Enfants (typiquement moins de 12 ans).
  KIDS
  /// Adolescents (12-17 ans environ). Pas de passage de grade pour
  /// cette audience.
  TEENAGERS
  /// Adultes (18 ans et plus).
  ADULTS
  /// Cours/stage ouvert à toutes les tranches d'âge.
  ALL_AGES
}

/// Jour de la semaine d'un créneau récurrent (Course).
enum Day {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

// ============================================================================
// ORIGINES CULTURELLES
// ============================================================================

/// Racine culturelle d'une discipline ou d'un événement (« Japon »,
/// « Okinawa », « Chine », « Philippines »).
///
/// Remplace l'ancien champ `Discipline.origin: String?` libre, qui
/// laissait coexister doublons orthographiques (« Japon » et « japon »
/// et « JAPAN »...). En faisant une entité dédiée, on gagne :
///
/// - Pas de doublons (contrainte `@unique` sur `name` et `slug`)
/// - Possibilité d'ajouter des métadonnées culturelles riches (région,
///   période historique, drapeau emoji)
/// - Regroupement transverse possible (toutes les disciplines / stages
///   / events d'origine japonaise)
/// - Tri manuel via `sortOrder` pour ne pas dépendre de l'alphabétique
///
/// Volontairement **pas de PageBuilder** sur ce modèle pour la v1 :
/// `description` reste un `String?` simple. Si tu veux plus tard une
/// page riche par origine, on migrera ce champ en `Json` (comme on l'a
/// fait pour Discipline).
model Origin {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Nom d'affichage (unique). « Japon », « Okinawa », « Chine ».
  name String @unique

  /// Slug URL-safe (unique). « japon », « okinawa ». Sert pour des URLs
  /// type `/origines/japon`.
  slug String @unique

  /// Description culturelle libre. Texte simple ; pas de PageBuilder
  /// pour l'instant.
  description String?

  /// Pays moderne. Peut différer du `name` quand `name` désigne une
  /// région (`name = "Okinawa"`, `country = "Japon"`).
  country String?

  /// Région ou sous-région culturelle. « Okinawa », « Shandong ».
  region String?

  /// Drapeau — emoji unicode (« 🇯🇵 ») ou code ISO 3166 alpha-2 (« JP »).
  /// Format libre, à formaliser côté UI.
  flag String?

  /// Période historique d'ancrage de la culture (« Période Edo »,
  /// « Dynastie Tang »). Champ pédagogique pour AKFC qui ancre ses
  /// pratiques dans une histoire.
  historicalPeriod String?

  /// Ordre d'affichage manuel dans les listes. Default 0. Plus petit
  /// = affiché en premier. Permet de ne pas dépendre de l'alphabétique.
  sortOrder Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Disciplines rattachées à cette origine.
  disciplines Discipline[]

  /// Stages rattachés à cette origine (notamment les stages hors-club).
  stages Stage[]

  /// Événements rattachés à cette origine.
  events Event[]

  @@index([sortOrder])

  /// Galeries rattachées à cette origine.
  galleries Gallery[]
}

/// Grosse maille de classification des disciplines.
///
/// Sert d'ancre pour grouper les Discipline et les MediaAsset
/// (rangement de la bibliothèque). Le champ `type` porte le nom de la
/// catégorie (« martial_art », « calligraphy », « cultural »...) — il
/// est nommé `type` historiquement mais sémantiquement c'est un libellé.
///
/// Modèle volontairement minimaliste : les catégories sont stables et
/// rarement éditées par l'admin.
model Category {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Nom de la catégorie (unique). Sert aussi de slug fonctionnel.
  type String @unique

  /// Disciplines appartenant à cette catégorie.
  disciplines Discipline[]

  /// Assets média rattachés à cette catégorie.
  mediaAssets MediaAsset[]

  /// Galeries rattachées à cette catégorie.
  galleries Gallery[]
}

model DisciplineFamily {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  disciplines Discipline[]

  @@index([sortOrder])
}

/// Une discipline enseignée par le club, au sens conceptuel.
///
/// Le Karaté Shotokan en tant que tel — pas un créneau, pas un événement.
/// Indépendante du temps et du lieu. Les créneaux récurrents qui
/// l'enseignent sont des `Course`, les événements ponctuels sont des
/// `Stage`, et les manifestations culturelles plus larges sont des
/// `Event`.
model Discipline {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Nom d'affichage de la discipline (« Karaté Shotokan »).
  name String

  /// Champ pratique : MARTIAL_ART ou CALLIGRAPHY.
  type DisciplineType

  /// Slug URL-safe pour la discipline, utilisé dans les URLs publiques
  slug         String?    @unique        // nullable le temps du backfill

  /// Famille d'appartenance pour regrouper les disciplines proches (ex: « Karaté », « Aikido »).
  familyId     Int?

  /// Relation vers la famille d'appartenance (nullable pour les disciplines proposées qui n'ont pas encore de famille créée).
  family DisciplineFamily? @relation(fields: [familyId], references: [id])

  /// École spécifique (« Shōtōkan », « Aikikai »). Texte libre.
  school String?

  /// Classification (« Sport olympique », « Art martial traditionnel »).
  /// Texte libre.
  classification String?

  /// Origine culturelle de la discipline. Relation vers le modèle
  /// `Origin` introduit dans la migration v2. Nullable pour permettre
  /// une création progressive (rattacher l'origine plus tard).
  originId Int?

  /// Page de présentation de la discipline, éditée au PageBuilder.
  /// Format : `PageContentV1` (cf. `packages/contracts/src/page`).
  /// Default = composite vide.
  description Json @default("{\"version\":1,\"blocks\":[]}")

  /// Catégorie d'appartenance (NOT NULL).
  categoryId Int

  /// Instructeur principal — celui qui porte la responsabilité pédagogique
  /// de la discipline. NOT NULL : chaque discipline a forcément un
  /// référent.
  ///
  /// Distinct de `Course.instructorId` qui est l'instructeur SPÉCIFIQUE
  /// d'un créneau particulier (peut diverger de l'instructeur principal).
  instructorId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  category Category @relation(fields: [categoryId], references: [id])

  /// Origine culturelle (peut être null).
  origin Origin? @relation(fields: [originId], references: [id])

  /// Relation vers l'instructeur principal de la discipline.
  instructor User @relation("DisciplineInstructor", fields: [instructorId], references: [id])

  /// Cours hebdomadaires récurrents de cette discipline.
  courses Course[]

  /// Stages ponctuels rattachés à cette discipline.
  stages Stage[]

  /// Événements rattachés à cette discipline.
  events Event[]

  /// Assets média (photos, vidéos d'illustration) rattachés à cette discipline.
  mediaAssets MediaAsset[]

  /// Galeries rattachées à cette discipline.
  galleries   Gallery[]

  @@unique([categoryId, name])
  @@index([categoryId])
  @@index([instructorId])
  @@index([originId])
  @@index([type])
  @@index([familyId])

}

// ============================================================================
// OCCURRENCES
// ============================================================================

/// Un créneau hebdomadaire récurrent d'une discipline.
///
/// Le créneau existe en tant qu'entité — il a un jour, une heure, une
/// audience — et revient chaque semaine. Un cours = un créneau, pas
/// une séance individuelle.
///
/// L'unicité `(disciplineId, day, beginTime, audience)` définit ce
/// qu'est un « doublon » : pas deux cours identiques sur la même
/// combinaison.
model Course {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Discipline enseignée pendant ce créneau (NOT NULL).
  disciplineId Int

  /// Public visé. Détermine l'accessibilité au passage de grade
  /// (cf. enum `Audience`).
  audience Audience

  /// Jour de la semaine où le créneau a lieu.
  day Day

  /// Heure de début au format HHMM (1830 = 18h30, 905 = 9h05).
  /// Heure locale du club (pas de timezone).
  beginTime Int

  /// Heure de fin au format HHMM. Doit être strictement > beginTime.
  endTime Int

  /// Instructeur spécifique de ce créneau. **Nullable** par design :
  /// si null, l'instructeur principal de la discipline s'applique par
  /// défaut. Si non-null, surcharge ce créneau-là (par exemple, un
  /// assistant qui anime un cours alors que le sensei principal en
  /// anime un autre).
  instructorId String?

  /// Prérequis libres pour suivre le cours (« ceinture jaune minimum »,
  /// « 14 ans révolus », etc.).
  requisites String[]

  /// Composite Json édité au PageBuilder. Décrit le cours
  /// (présentation, programme, photos) — pas de champ `description`
  /// séparé, tout vit dans ce composite.
  ///
  /// Format : `PageContentV1` (cf. `packages/contracts/src/page`).
  /// Lecture sécurisée via `parsePageContentV1(raw)`.
  content Json

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Discipline enseignée.
  discipline Discipline @relation(fields: [disciplineId], references: [id])

  /// Instructeur spécifique du créneau (peut être null — voir le champ).
  instructor User? @relation("CourseInstructor", fields: [instructorId], references: [id])

  @@unique([disciplineId, day, beginTime, audience])
  @@index([disciplineId])
  @@index([instructorId])
}

/// Un événement ponctuel, généralement intensif, d'une ou plusieurs
/// sessions consécutives.
///
/// Plus dense qu'un Course récurrent — typiquement un weekend ou une
/// semaine avec un intervenant invité. Porte **deux composites
/// séparés** : `description` (ce que c'est et pourquoi) et `program`
/// (ce qu'on va y faire).
///
/// La date n'est pas portée par Stage lui-même mais par ses
/// `StageSession[]` — un Stage est un container, pas un événement daté.
///
/// **Rattachement flexible** (depuis la migration v2) : un Stage peut
/// être rattaché à une discipline enseignée du club (`disciplineId`),
/// à une discipline externe nommée librement (`externalDisciplineLabel`),
/// ou simplement à une origine culturelle (`originId`). Les trois sont
/// optionnels — la validation Zod côté router exige qu'au moins l'un
/// d'eux soit renseigné pour qu'un stage ait du contexte.
///
/// ⚠️ La contrainte `@@unique([disciplineId, label])` ne s'applique que
/// quand `disciplineId` est non-null (Postgres considère NULL ≠ NULL
/// pour les unique constraints). Pour les stages externes, la
/// prévention des doublons de label vit côté UI/validation.
model Stage {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Discipline du stage (peut être null pour les stages externes).
  disciplineId Int?

  /// Nom libre d'une discipline non enseignée (« Calligraphie chinoise »).
  /// Sert quand le stage porte sur un domaine que le club n'enseigne
  /// pas — typiquement intervenant extérieur.
  externalDisciplineLabel String?

  /// Origine culturelle rattachée. Permet le regroupement par culture
  /// quand pas de discipline rattachée.
  originId Int?

  /// Nom du stage (« Stage Sensei Tanaka 2026 »).
  /// Unique par discipline quand `disciplineId` est non-null.
  label String

  /// Public visé. Détermine l'accessibilité au passage de grade.
  audience Audience

  /// Composite Json édité au PageBuilder : présentation du stage,
  /// contexte, intervenants, photos.
  ///
  /// Format : `PageContentV1`.
  description Json

  /// Composite Json édité au PageBuilder : programme détaillé,
  /// session par session, techniques abordées, supports remis.
  ///
  /// Format : `PageContentV1`.
  program Json

  /// Inscriptions préalables. Tableau de chaînes (typiquement emails
  /// ou identifiants utilisateur, à formaliser).
  preRegistered String[]

  /// Animateur principal du stage (NOT NULL — l'équivalent du sensei
  /// en chef pour ce stage).
  primaryAnimatorId String

  /// Date de publication. **null = brouillon** (non visible publiquement).
  /// Une date dans le futur = publication programmée. Cohérent avec Post et Event.
  publicationDate DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Discipline (peut être null pour les stages externes).
  discipline Discipline? @relation(fields: [disciplineId], references: [id])

  /// Origine culturelle (peut être null).
  origin Origin? @relation(fields: [originId], references: [id])

  /// Animateur principal.
  primaryAnimator User @relation("StagePrimaryAnimator", fields: [primaryAnimatorId], references: [id])

  /// Animateurs secondaires (many-to-many).
  animators User[] @relation("StageAnimators")

  /// Sessions individuelles qui composent ce stage.
  sessions StageSession[]

  slug String?  @unique // nullable le temps du backfill

  /// Assets média (photos, vidéos d'illustration) rattachés à ce stage.
  galleries   Gallery[]

  @@unique([disciplineId, label])
  @@index([disciplineId])
  @@index([originId])
  @@index([primaryAnimatorId])
  @@index([publicationDate])
}

/// Une séance individuelle d'un Stage.
///
/// Un stage de weekend peut compter 4 sessions : samedi matin, samedi
/// après-midi, dimanche matin, dimanche après-midi.
///
/// Pas de PageBuilder ici — les sessions sont des données structurées
/// secondaires. Le contenu riche vit dans `Stage.description` et
/// `Stage.program`.
model StageSession {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Stage parent (NOT NULL, cascade en suppression).
  stageId Int

  /// Date de la séance (jour calendaire).
  date DateTime

  /// Heure de début au format HHMM.
  beginTime Int

  /// Heure de fin au format HHMM. Doit être > beginTime.
  endTime Int

  /// Lieu de la séance — texte libre (« Dojo principal »,
  /// « Gymnase Jean Moulin »). Optionnel.
  location String?

  /// Notes libres (« apporter son propre keikogi », etc.).
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Stage parent. `onDelete: Cascade` : si le stage est supprimé,
  /// ses sessions le sont aussi.
  stage Stage @relation(fields: [stageId], references: [id], onDelete: Cascade)

  @@unique([stageId, date, beginTime])
  @@index([stageId])
  @@index([date])
}

// ============================================================================
// ÉVÉNEMENTS
// ============================================================================

/// Événement ponctuel non récurrent — repas, conférence, journée
/// portes ouvertes, atelier culturel.
///
/// **Différences avec Stage** :
///
/// - Pas obligatoirement rattaché à une discipline (`disciplineId` nullable)
/// - Pas obligatoirement rattaché à une origine non plus (les deux
///   relations sont optionnelles, mais on peut les combiner)
/// - Un seul composite Json (`content`) — pas la dichotomie description
///   / program de Stage. L'événement est typiquement plus "léger" en
///   structure
/// - `publicationDate?` pour gérer brouillons (cf. convention Post)
/// - Plus simple côté animation : un seul `organizerId`, pas de
///   distinction primary/secondary
///
/// La date n'est pas portée par Event lui-même mais par ses
/// `EventSession[]` — comme Stage, un Event est un container temporel.
model Event {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Nom de l'événement (« Repas de fin d'année 2026 », « Conférence
  /// sur le bouddhisme zen »).
  label String

  /// Composite Json édité au PageBuilder : présentation complète de
  /// l'événement (contexte, intervenants, photos, programme).
  ///
  /// Format : `PageContentV1` (cf. `packages/contracts/src/page`).
  content Json @default("{\"version\":1,\"blocks\":[]}")

  /// Public visé. NOT NULL — forcer le choix explicite (utiliser
  /// `ALL_AGES` pour les événements tout public).
  audience Audience

  /// Discipline rattachée. **Nullable** : un événement culturel large
  /// peut ne pas être rattaché à une discipline enseignée.
  disciplineId Int?

  /// Nom libre d'une discipline non enseignée (« Calligraphie chinoise »).
  /// Sert quand l'événement porte sur un domaine que le club n'enseigne
  /// pas — typiquement intervenant extérieur.
  externalDisciplineLabel String?

  /// Origine culturelle rattachée. Nullable. Permet de regrouper les
  /// événements par culture quand pertinent.
  originId Int?

  /// Organisateur de l'événement (NOT NULL). User responsable.
  organizerId String

  /// Date de publication. **null = brouillon** (non visible publiquement).
  /// Date dans le futur = publication programmée. Cohérent avec Post.
  publicationDate DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Discipline rattachée (peut être null).
  discipline Discipline? @relation(fields: [disciplineId], references: [id])

  /// Origine rattachée (peut être null).
  origin Origin? @relation(fields: [originId], references: [id])

  /// Organisateur (User).
  organizer User @relation("EventOrganizer", fields: [organizerId], references: [id])

  /// Sessions individuelles qui composent l'événement (peut n'en
  /// contenir qu'une).
  sessions EventSession[]

  slug String?  @unique// nullable le temps du backfill

  /// Assets média (photos, vidéos d'illustration) rattachés à cet événement.
  galleries   Gallery[]

  @@index([disciplineId])
  @@index([originId])
  @@index([organizerId])
  @@index([publicationDate])
}

/// Une session individuelle d'un Event.
///
/// Cloné sur `StageSession` — même rôle : porter la date et l'heure
/// d'une séance. Un événement à une seule date a un seul `EventSession`.
/// Un événement en plusieurs soirées en a plusieurs.
model EventSession {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Event parent (NOT NULL, cascade en suppression).
  eventId Int

  /// Date de la séance (jour calendaire).
  date DateTime

  /// Heure de début au format HHMM.
  beginTime Int

  /// Heure de fin au format HHMM. Doit être > beginTime.
  endTime Int

  /// Lieu de la séance — texte libre.
  location String?

  /// Notes libres.
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Event parent. `onDelete: Cascade` — supprimer un Event supprime
  /// ses sessions.
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, date, beginTime])
  @@index([eventId])
  @@index([date])
}

// ============================================================================
// MEDIA
// ============================================================================

/// MediaAsset — entité agnostique du backend de stockage (Phase 2).
///
/// Représente un fichier tracké côté DB, peu importe s'il est hébergé sur
/// Cloudinary ou Cloudflare R2. Le champ pivot est `fullPath`, qui sert de
/// clé universelle :
///   - Pour Cloudinary : `<publicId>.<format>` (avec extension)
///   - Pour R2 : la clé S3 directe (ex: AKFC/pending/cours/audio.mp3)
///
/// Les champs Cloudinary-only (publicId, secureUrl, resourceType) sont
/// nullable depuis cette phase — null pour les rows R2.
///
/// NOTE: `fullPath` est temporairement nullable dans la migration
/// `add_full_path_to_media_asset` pour permettre le backfill R2 historique
/// sans casser la contrainte d'unicité prématurément. Après lancement du
/// backfill R2, la migration `tighten_full_path` le passe en `@unique`
/// NOT NULL — la déclaration ci-dessous reflète cet état final
model MediaAsset {
  id                     String   @id @default(cuid())

  // --- Identité storage (Cloudinary OR R2)
  publicId               String?  @unique   // Cloudinary uniquement
  secureUrl              String?            // Cloudinary uniquement
  resourceType           String?            // Cloudinary uniquement
  fullPath               String   @unique   // Clé universelle (path complet)

  // --- Fichier (commun aux deux backends)
  mimeType               String
  format                 String?
  originalFileName       String
  displayName            String?
  description            String?
  bytes                  Int
  width                  Int?
  height                 Int?
  duration               Float?

  // --- Métier
  appRoot                String
  status                 String                          // "pending" | "published" | ...
  categoryId             Int
  disciplineId           Int?                            // null si Discipline proposée pas encore créée
  proposedDisciplineName String?
  eventDate              DateTime?

  // --- Provenance
  uploaderUserId         String
  uploadedAt             DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  category   Category    @relation(fields: [categoryId], references: [id])
  discipline Discipline? @relation(fields: [disciplineId], references: [id])
  uploader   User        @relation("UserMediaUploads", fields: [uploaderUserId], references: [id])

  // --- Références entrantes depuis le builder de pages
  pageReferences PageMediaReference[]

  // --- Références entrantes depuis les galeries (illustrations)
  galleryItems GalleryItem[]

  // --- Ancre stable Cloudinary (immuable à travers les renames/moves).
  // C'est la clé de réconciliation après un move : publicId/fullPath/status
  // changent au déplacement, asset_id ne bouge jamais. Null pour R2 et pour
  // les lignes antérieures à cette colonne (réparées par backfill).
  cloudinaryAssetId      String?  @unique

  @@index([status])
  @@index([categoryId])
  @@index([disciplineId])
  @@index([uploaderUserId])
  @@index([uploadedAt])
  @@index([appRoot, fullPath])  // ← bonus Phase 2 : optimise searchRecursive
}

// ============================================================================
// FOLDERS & TRASH
// ============================================================================

model Folder {
  id        String       @id @default(cuid())
  appRoot   String
  fullPath  String
  status    FolderStatus
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@unique([appRoot, fullPath])
  @@index([appRoot])
  @@index([appRoot, status])
  @@map("CloudinaryFolder")
}

enum FolderStatus {
  pending
  published
  bin

  @@map("CloudinaryFolderStatus")
}

model TrashEntry {
  id      String           @id @default(uuid())
  appRoot String
  kind    TrashEntryKind
  status  TrashEntryStatus @default(IN_BIN)

  displayName  String
  previousPath String
  storageRoot  String

  trashedAt DateTime @default(now())

  restoredAt     DateTime?
  restoredToPath String?

  deletedAt DateTime?

  sizeBytes           BigInt?
  cloudinaryCreatedAt DateTime?

  mediaKind String?

  @@index([appRoot])
  @@index([appRoot, status, trashedAt])
  @@index([appRoot, previousPath])
  @@index([appRoot, kind])
}

enum TrashEntryKind {
  folder
  file
}

enum TrashEntryStatus {
  IN_BIN
  RESTORED
  DELETED
}

// ============================================================================
// POSTS / COMMENTS / LIKES
// ============================================================================

/// Article éditorial — actualité, compte-rendu, annonce.
///
/// **Indépendant de toute discipline** : un Post peut parler du club
/// en général, d'un événement de la vie associative, d'une actualité
/// culturelle. Pas de rattachement à Discipline/Course/Stage.
///
/// **Statut de publication** : convention `publicationDate === null`
/// = brouillon non visible publiquement, `publicationDate !== null`
/// = publié (à la date donnée, qui peut être dans le futur pour une
/// publication programmée).
model Post {
  /// Identifiant entier auto-incrémenté.
  id Int @id @default(autoincrement())

  /// Titre de l'article.
  title String

  /// Composite Json édité au PageBuilder : corps de l'article complet.
  ///
  /// Format : `PageContentV1` (cf. `packages/contracts/src/page`).
  content Json

  /// Auteur de l'article (NOT NULL).
  authorId String

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  /// Date de publication. **null = brouillon** (non visible publiquement).
  /// Une date dans le futur = publication programmée.
  publicationDate DateTime?

  /// Auteur de l'article.
  author User @relation(fields: [authorId], references: [id])

  /// Commentaires des utilisateurs sur l'article.
  comments Comment[]

  poll     Poll?              // ← AJOUT (sondage optionnel = vote activable)

  @@index([publicationDate])
}

/// Commentaire sur un Post. Arborescent : `parentId` pointe vers le
/// commentaire auquel celui-ci répond (null = commentaire racine).
/// `content` est un document ProseMirror (Json) : tiptap bridé côté front
/// (gras/italique/liens), sans titres, sans images, sans PageBuilder.
model Comment {
  id        Int      @id @default(autoincrement())
  content   Json
  authorId  String
  postId    Int
  parentId  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author  User      @relation(fields: [authorId], references: [id])
  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([parentId])
}

/// Cible d'une réaction. Polymorphe : une réaction peut porter sur un
/// Post ou un Comment, distingués par `targetType` + `targetId`.
enum ReactionTarget {
  POST
  COMMENT
}

/// Réaction emoji d'un utilisateur sur un Post ou un Comment.
/// Le pouce levé n'est qu'un cas particulier : `emoji = "👍"`.
/// Polymorphe par convention (`targetType` + `targetId`) : pas de FK
/// Prisma vers Post/Comment, donc la suppression des réactions d'une
/// cible supprimée se fait **côté router** (voir note plus bas).
model Reaction {
  id         Int            @id @default(autoincrement())
  emoji      String
  userId     String
  targetType ReactionTarget
  targetId   Int
  createdAt  DateTime       @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, targetType, targetId, emoji])
  @@index([targetType, targetId])
}

/// Sondage rattaché à un Post (au plus un par post — `postId @unique`).
/// Sa simple présence = « vote activé » sur le post. `multiple` autorise
/// plusieurs choix par votant ; sinon un seul (règle appliquée au router).
model Poll {
  id        Int       @id @default(autoincrement())
  postId    Int       @unique
  question  String
  multiple  Boolean   @default(false)
  closesAt  DateTime?
  createdAt DateTime  @default(now())

  post    Post         @relation(fields: [postId], references: [id], onDelete: Cascade)
  options PollOption[]
}

/// Une option de réponse d'un sondage.
model PollOption {
  id        Int    @id @default(autoincrement())
  pollId    Int
  label     String
  sortOrder Int    @default(0)

  poll  Poll       @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes PollVote[]

  @@index([pollId])
}

/// Vote d'un utilisateur pour une option. `pollId` est dénormalisé pour
/// pouvoir appliquer la règle « un seul choix » (mode non-multiple) et
/// requêter les votes par sondage sans jointure.
model PollVote {
  id        Int      @id @default(autoincrement())
  optionId  Int
  pollId    Int
  userId    String
  createdAt DateTime @default(now())

  option PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  user   User       @relation(fields: [userId], references: [id])

  @@unique([optionId, userId])
  @@index([pollId, userId])
}

/// PageMediaReference — table de jointure entre une page (Course, Stage,
/// Post) et un MediaAsset référencé dans son composite de blocs.
///
/// Tenue à jour transactionnellement par les mutations qui sauvegardent
/// une page (cf. router course / stage / post — sous-chantier 4). Le diff
/// old/new est calculé par `extractMediaIdsFromContent` côté contracts.
///
/// Sert deux propos :
///   1. **Garde-fou DB** : `onDelete: Restrict` sur `mediaAssetId` empêche
///      la suppression hard d'un MediaAsset encore référencé par une page,
///      même si la logique applicative a un bug.
///   2. **Lookup applicatif** : permet aux services `trashToBin` et `move`
///      (cf. sous-chantier 7) de refuser une sortie de `published` avec
///      un diagnostic précis ("utilisé par Cours X, Stage Y").
///
/// ─── Polymorphie assumée ────────────────────────────────────────────────
///
/// `pageId` ne porte PAS de FK DB vers Course / Stage / Post — Prisma ne
/// sait pas modéliser un FK polymorphe natif. L'intégrité de ce côté est
/// tenue par l'application : au delete d'un Course/Stage/Post, on
/// delete les rows correspondantes dans `PageMediaReference` dans la
/// même transaction. Le seul côté protégé au niveau DB est `mediaAssetId`,
/// et c'est suffisant — c'est le côté où une perte d'intégrité ferait
/// vraiment mal (pages qui pointent vers du néant).
model PageMediaReference {
  id           String             @id @default(cuid())
  mediaAssetId String
  pageType     PageReferencerKind
  pageId       String

  createdAt    DateTime           @default(now())

  mediaAsset   MediaAsset         @relation(fields: [mediaAssetId], references: [id], onDelete: Restrict)

  @@unique([mediaAssetId, pageType, pageId])
  @@index([pageType, pageId])
}

/// Discriminant du référenceur dans `PageMediaReference`.
///
/// Stage en porte deux variantes parce qu'un même `Stage.id` accueille
/// deux composites distincts (`description` et `program`), qu'on doit
/// pouvoir distinguer dans la table de jointure pour des diffs propres
/// au save.
///
/// `DISCIPLINE` et `EVENT` ajoutés en migration v2 : depuis la
/// migration, ces deux entités portent aussi un composite Json édité
/// au PageBuilder. Une seule variante par entité parce qu'un seul
/// composite (pas comme Stage qui en porte deux).
enum PageReferencerKind {
  COURSE
  STAGE_DESCRIPTION
  STAGE_PROGRAM
  POST
  DISCIPLINE  // ← AJOUT v2
  EVENT       // ← AJOUT v2
}

// ─────────────────────────────────────────────────────────────────────────
//  AJOUTS AU SCHÉMA — feature Galerie/Carousel
//  À coller dans prisma/schema.prisma (à la racine du monorepo).
// ─────────────────────────────────────────────────────────────────────────

// 1) Nouvel enum partagé de visibilité (réutilisable plus tard par Post).
enum Visibility {
  PUBLIC
  MEMBERS
}

// 2) Nouveaux modèles.

/// Galerie d'images. Réutilise des MediaAsset existants via GalleryItem
/// (jointure ordonnée). Rattachement optionnel à AU PLUS un thème
/// (discipline / stage / event) ; une galerie sans thème au slug réservé
/// sert de carousel d'accueil.
model Gallery {
  id         Int        @id @default(autoincrement())
  slug       String     @unique
  title      String
  visibility Visibility @default(PUBLIC)
  sortOrder  Int        @default(0)

  /// Date de la galerie (le jour du stage/évènement photographié) —
  /// métadonnée de tri et facette de la future recherche. Nullable.
  date DateTime?

  // Rattachements optionnels et CUMULABLES (décision 2026-07-03) : une
  // galerie peut être à la fois d'une discipline, d'un stage… Ce sont
  // les facettes de la future recherche.
  disciplineId Int?
  discipline   Discipline? @relation(fields: [disciplineId], references: [id])
  stageId      Int?
  stage        Stage?      @relation(fields: [stageId], references: [id])
  eventId      Int?
  event        Event?      @relation(fields: [eventId], references: [id])
  categoryId   Int?
  category     Category?   @relation(fields: [categoryId], references: [id])
  originId     Int?
  origin       Origin?     @relation(fields: [originId], references: [id])

  items GalleryItem[]

  @@index([sortOrder])
  @@index([date])
}

/// Jointure ordonnée Gallery ↔ MediaAsset (réutilisation de la bibliothèque,
/// pas de nouvel upload). Un même asset n'apparaît qu'une fois par galerie.
model GalleryItem {
  id           Int        @id @default(autoincrement())
  galleryId    Int
  gallery      Gallery    @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  mediaAssetId String
  mediaAsset   MediaAsset @relation(fields: [mediaAssetId], references: [id], onDelete: Cascade)
  sortOrder    Int        @default(0)

  @@unique([galleryId, mediaAssetId])
  @@index([galleryId, sortOrder])
}


// ═══════════════════════════════════════════════════════════════════════
// BREAKING NEWS — la « voix du club »
// ═══════════════════════════════════════════════════════════════════════

/// Actualité courte, diffusée par le ruban défilant et la sidebar
/// escamotable du site public. Distincte de Post (réflexions commentables,
/// avec interactions) : la BreakingNews est UNIDIRECTIONNELLE — pas
/// d'auteur affiché (c'est le club qui parle), pas de commentaires, pas
/// de réactions.
///
/// `publicationDate` suit le pattern maison (Stage/Event/Post) :
/// null = brouillon, future = programmée, passée = publiée.
/// `expiresAt` retire l'actu du ruban et de la sidebar après échéance
/// (null = sans expiration) — une actu est éphémère par nature.
model BreakingNews {
  id    Int    @id @default(autoincrement())
  title String

  /// Corps court en texte brut — le ruban défile mal du texte riche,
  /// et une actu de deux lignes n'a pas besoin de ProseMirror.
  body String

  /// Lien optionnel, interne (« /#post-12 » — un vote sur le mur) ou
  /// externe. C'est le CTA de la fiche Announcement, PAS la cible du
  /// clic sur le ruban (qui ouvre la sidebar).
  href String?

  publicationDate DateTime?
  expiresAt       DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([publicationDate])
}
FILE_EOF

echo "-> 2/6 Écriture du router galleries"
cat > packages/backend/src/modules/galleries/router.ts << 'FILE_EOF'
import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { slugSchema } from "@contracts/slug/slug.schema";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { z } from "zod";

/**
 * Router `gallery`.
 *
 * Une Gallery réutilise des MediaAsset existants via GalleryItem (jointure
 * ordonnée). Rattachements optionnels et CUMULABLES (discipline,
 * catégorie, stage, event, origine) — les facettes de la future
 * recherche. Une galerie sans rattachement au slug réservé
 * `CAROUSEL_SLUG` sert de carousel d'accueil.
 *
 * - Lectures publiques : `getBySlug`, `getCarousel`.
 * - Écritures + lectures admin : `requirePermission("manage_galleries")`.
 */

/** Slug réservé pour le carousel de la page d'accueil. */
export const CAROUSEL_SLUG = "home-carousel";

/** include standard : items ordonnés + l'asset média de chaque item. */
const galleryWithItems = {
  items: {
    orderBy: { sortOrder: "asc" },
    include: { mediaAsset: true },
  },
} satisfies Prisma.GalleryInclude;

const themeFields = {
  disciplineId: z.number().int().positive().nullable().optional(),
  stageId: z.number().int().positive().nullable().optional(),
  eventId: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  originId: z.number().int().positive().nullable().optional(),
};

const createInput = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  date: z.coerce.date().nullable().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  ...themeFields,
});

const updateInput = z.object({
  id: z.number().int().positive(),
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(120).optional(),
  date: z.coerce.date().nullable().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  ...themeFields,
});

export const galleryRouter = router({
  /* ----- Lectures admin ----- */

  getAll: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .query(async ({ ctx }) => {
      return ctx.prisma.gallery.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { items: true } },
          discipline: { select: { id: true, name: true } },
          stage: { select: { id: true, label: true } },
          event: { select: { id: true, label: true } },
        },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { id: input.id },
        include: galleryWithItems,
      });
      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Galerie introuvable." });
      }
      return gallery;
    }),

  /* ----- Lectures publiques ----- */

  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { slug: input.slug },
        include: galleryWithItems,
      });
      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Galerie introuvable." });
      }
      return gallery;
    }),

  /**
   * Récupère la galerie du carousel d'accueil (slug `CAROUSEL_SLUG`) avec ses
   * items filtrés (assets publiés uniquement) et transformés (URL de proxy +
   * métadonnées + kind/posterUrl).
   *
   * Accessible publiquement pour afficher le carousel sur la page d'accueil
   * sans authentification.
   *
   * Le `kind` est dérivé via le helper partagé `deriveMediaKind` (même logique
   * que `media.resolveByIds`), et le poster vidéo via la route proxy `&as=poster`.
   * Les URLs sont construites pour l'audience `public` (les assets R2
   * éventuels passent alors par la route publique).
   */
  getCarousel: publicProcedure.query(async ({ ctx }) => {
    const gallery = await ctx.prisma.gallery.findUnique({
      where: { slug: CAROUSEL_SLUG },
      include: galleryWithItems,
    });
    if (!gallery) return null;

    return {
      id: gallery.id,
      slug: gallery.slug,
      title: gallery.title,
      items: gallery.items
        .filter((it) => it.mediaAsset.status === "published")
        .map((it) => {
          const a = it.mediaAsset;
          const kind = deriveMediaKind(a.resourceType, a.mimeType);
          const url = buildMediaProxyUrl(
            { publicId: a.publicId, fullPath: a.fullPath },
            "public",
          );

          return {
            mediaAssetId: it.mediaAssetId,
            url,
            kind,
            posterUrl: kind === "video" ? `${url}&as=poster` : null,
            mimeType: a.mimeType,
            fileName: a.fullPath.split("/").pop() ?? a.fullPath,
            width: a.width,
            height: a.height,
          };
        }),
    };
  }),

  /* ----- Écritures ----- */

  create: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.gallery.create({ data: input });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce slug de galerie est déjà utilisé.",
          });
        }
        throw e;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        return await ctx.prisma.gallery.update({ where: { id }, data });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce slug de galerie est déjà utilisé.",
          });
        }
        throw e;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Les GalleryItem sont supprimés en cascade (FK onDelete: Cascade).
      return ctx.prisma.gallery.delete({ where: { id: input.id } });
    }),

  /* ----- Gestion des items (ajout / retrait / réordonnancement) ----- */

  /**
   * Remplace l'intégralité des items d'une galerie par la liste ordonnée
   * `mediaAssetIds` (le `sortOrder` suit l'index du tableau). Couvre en une
   * seule opération l'ajout, le retrait et le réordonnancement — pratique
   * pour un écran admin en drag-and-drop. Transactionnel.
   */
  setItems: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(
      z.object({
        galleryId: z.number().int().positive(),
        mediaAssetIds: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.galleryItem.deleteMany({
          where: { galleryId: input.galleryId },
        });

        if (input.mediaAssetIds.length > 0) {
          await tx.galleryItem.createMany({
            data: input.mediaAssetIds.map((mediaAssetId, index) => ({
              galleryId: input.galleryId,
              mediaAssetId,
              sortOrder: index,
            })),
            skipDuplicates: true,
          });
        }

        return tx.gallery.findUnique({
          where: { id: input.galleryId },
          include: galleryWithItems,
        });
      });
    }),
});

export default galleryRouter;
FILE_EOF

echo "-> 3/6 Backfill des titres NULL (AVANT db push, sinon NOT NULL refuse)"
set -a; source <(grep -E '^DATABASE_URL=' .env); set +a
psql "${DATABASE_URL%%\?*}" -c 'UPDATE "Gallery" SET "title" = "slug" WHERE "title" IS NULL;'

echo "-> 4/6 prisma db push"
npx prisma db push

echo "-> 5/6 Comblement du trou de migration"
mkdir -p 'prisma/migrations/20260703120000_gallery_metadata'
cat > 'prisma/migrations/20260703120000_gallery_metadata/migration.sql' << 'SQLEOF'
-- Gallery : title requis, date, rattachements category/origin (cumulables).

-- Backfill AVANT le NOT NULL : le slug fait titre par défaut.
UPDATE "Gallery" SET "title" = "slug" WHERE "title" IS NULL;
ALTER TABLE "Gallery" ALTER COLUMN "title" SET NOT NULL;

ALTER TABLE "Gallery" ADD COLUMN "date" TIMESTAMP(3);
ALTER TABLE "Gallery" ADD COLUMN "categoryId" INTEGER;
ALTER TABLE "Gallery" ADD COLUMN "originId" INTEGER;

ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_originId_fkey"
  FOREIGN KEY ("originId") REFERENCES "Origin"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Gallery_date_idx" ON "Gallery"("date");
SQLEOF
npx prisma migrate resolve --applied 20260703120000_gallery_metadata

echo "-> 6/6 Rituel post-schéma"
rm -rf apps/web/.next
npx prisma generate

echo
echo "Typechecks (le WEB peut être ROUGE sur les actions gallery : attendu,"
echo "les formulaires sont la phase 2) :"
pnpm --filter backend typecheck && pnpm --filter web typecheck || true