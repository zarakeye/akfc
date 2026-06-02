
# AKFC — Modèle de domaine

Document de référence du modèle de données métier du projet AKFC. À tenir
à jour à chaque évolution structurelle. Sert de boussole quand on
développe et de point d'entrée pour quiconque arrive sur le projet.

> Cette version intègre la **migration v2** (`domain_v2_expansion`) :
> introduction du modèle `Origin`, du modèle `Event` avec ses
> `EventSession`, passage de `Discipline.description` en `Json`,
> découplage de `Stage` de la contrainte « discipline du club ».

---

## Vue d'ensemble

AKFC est un club d'arts martiaux et de pratiques culturelles asiatiques.
Le modèle de données reflète cette double identité — pas seulement la
pratique martiale, mais aussi les racines culturelles qui l'accompagnent
(calligraphie, événements culturels, conférences).

Les **entités centrales** sont :

* **`Discipline`** — l'art enseigné par le club (Karaté Shotokan,
  Aikido, calligraphie shodō, etc.). Conceptuel, indépendant du temps
  et du lieu.
* **`Course`** — un créneau hebdomadaire récurrent d'une discipline
  (Karaté lundi soir 18h-19h30, adultes). Concret, planifié.
* **`Stage`** — un événement ponctuel d'une ou plusieurs sessions
  (« Stage intensif de Karaté avec Maître X, week-end du 15 mars »).
  Peut désormais ne pas être rattaché à une discipline enseignée.
* **`Event`** — un événement non récurrent plus libre que Stage : repas,
  conférence, journée portes ouvertes, atelier culturel.
* **`Post`** — un article éditorial (actualités, comptes-rendus,
  annonces). Indépendant de toute discipline.

Autour d'elles gravitent :

* **`Origin`** — racine culturelle d'une discipline / stage / event
  (Japon, Okinawa, Chine, Philippines). Permet le regroupement
  transverse par culture.
* **`Category`** — une grosse maille de classification des disciplines
* **`StageSession`** et **`EventSession`** — les séances individuelles
  d'un stage ou d'un événement multi-jours
* **`MediaAsset`** — un fichier tracké en DB, peu importe son backend
  (Cloudinary, R2)
* Toute l'infrastructure utilisateur (User, Role, Permission, Session...)
  qui n'est pas traitée ici parce qu'orthogonale au domaine.

---

## Glossaire métier

| Terme                                                                                   | Sens dans AKFC                                                                                                                                |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discipline**                                                                    | L'art enseigné, au sens conceptuel. Karaté Shotokan, Aikido, calligraphie. Indépendant du temps et du lieu.                                |
| **Cours**(Course)                                                                 | Un créneau hebdomadaire récurrent d'une discipline. Discipline + jour + heure + audience.                                                   |
| **Stage**                                                                         | Un événement ponctuel intensif, généralement sur quelques jours. Une ou plusieurs sessions.                                               |
| **Événement**(Event)                                                            | Un événement non récurrent plus libre — repas, conférence, atelier. Pas obligatoirement martial.                                         |
| **Session de stage**(StageSession) /**session d'événement**(EventSession) | Une séance individuelle. Un stage de 2 jours = 2-4 sessions selon le découpage.                                                             |
| **Audience**                                                                      | Le public visé : enfants, ados, adultes, ou tous publics. Détermine l'accessibilité au passage de grade.                                   |
| **Origine**(Origin)                                                               | La racine culturelle d'une discipline, d'un stage ou d'un événement (Japon, Chine, Philippines, Okinawa...). Entité dédiée depuis la v2. |
| **Instructeur principal**                                                         | Celui qui porte la responsabilité pédagogique d'une discipline ou d'un stage.                                                               |
| **Animateur**(pour Stage)                                                         | Un instructeur qui anime tout ou partie des sessions d'un stage — peut être différent du principal.                                        |
| **Organisateur**(pour Event)                                                      | Le User responsable d'un événement. Un seul, pas la dichotomie animateur principal / secondaires de Stage.                                  |

---

## Modèles métier

### `Category`

Une catégorie est une **grosse maille** de classification des
disciplines. Aujourd'hui c'est un modèle minimaliste — juste un nom
(`type: String @unique`) — qui sert de regroupement et d'ancre pour les
`MediaAsset`.

Le champ `type` est nommé ainsi historiquement, mais sémantiquement
c'est le **nom de la catégorie** (par exemple « Cours », « Stage »).
Ce n'est pas un enum — chaque club peut créer ses propres catégories.

Relations :

* vers `Discipline[]` : les disciplines qui appartiennent à cette
  catégorie
* vers `MediaAsset[]` : les assets rattachés à cette catégorie

**Quand on l'utilise** : rarement directement par l'admin (les
catégories sont stables). Surtout consommée par les filtres dans la
bibliothèque média et par la classification des disciplines.

### `Origin`

**Introduite en v2.** Remplace l'ancien champ `Discipline.origin: String?`
libre. Une entité dédiée pour éliminer les doublons orthographiques et
permettre des métadonnées culturelles riches.

Champs :

* `name`, `slug` — nom d'affichage et slug URL-safe, tous deux uniques
* `description` — texte libre simple (pas de PageBuilder pour la v1)
* `country`, `region` — découplage géographique : `Origin { name: "Okinawa", country: "Japon", region: "Okinawa" }`
* `flag` — emoji drapeau ou code ISO
* `historicalPeriod` — « Période Edo », « Dynastie Tang », etc.
* `sortOrder` — tri manuel des origines dans les listes

Relations inverses : `disciplines[]`, `stages[]`, `events[]`.

### `Discipline`

L'art enseigné par le club, au sens conceptuel. Un Karaté Shotokan
existe indépendamment du fait qu'il soit enseigné le mardi à 18h ou le
samedi à 10h.

**Champs principaux** :

* `name` — nom d'affichage (« Karaté Shotokan »)
* `type` — un enum `DisciplineType` (`MARTIAL_ART | CALLIGRAPHY`).
  Distingue les disciplines martiales des disciplines culturelles
* `categoryId` — la catégorie d'appartenance
* `instructorId` — **l'instructeur principal** (NOT NULL). Celui qui
  porte la responsabilité pédagogique. Voir « Les deux instructeurs »
  plus bas
* `description` — composite Json édité au PageBuilder (depuis la v2).
  Permet une page de présentation riche (texte, images, vidéos)
* `originId` — relation vers `Origin` (nullable, depuis la v2)

**Champs métadonnées culturelles libres** :

* `family`, `school`, `classification` — chaînes libres
  (« Karaté », « Shōtōkan », « Sport olympique »)

Ces trois champs restent nullables et libres — pas de validation contre
des listes de référence. Choix intentionnel pour la souplesse.

**Relations** :

* vers `Category` (NOT NULL)
* vers `Origin` (nullable)
* vers `User` en `DisciplineInstructor` (l'instructeur principal, NOT NULL)
* vers `Course[]`, `Stage[]`, `Event[]`, `MediaAsset[]`

**Contraintes** :

* `@@unique([categoryId, name])` — pas deux disciplines homonymes dans
  une même catégorie

### `Course`

Un créneau hebdomadaire **récurrent** d'une discipline. Le créneau
existe en tant que tel — il a un jour, une heure, une audience — et il
revient chaque semaine.

**Champs principaux** :

* `disciplineId` — la discipline enseignée (NOT NULL)
* `audience` — le public (`KIDS | TEENAGERS | ADULTS | ALL_AGES`)
* `day` — le jour de la semaine (`MONDAY` à `SUNDAY`)
* `beginTime`, `endTime` — heures au format **HHMM** (cf. conventions
  transverses)
* `instructorId` (nullable) — instructeur spécifique de ce créneau.
  Voir « Les deux instructeurs » plus bas
* `requisites` — tableau de chaînes, prérequis libres (« ceinture
  jaune minimum », « 14 ans révolus »)
* `content` — composite Json (`PageContentV1`) — la **description et le
  programme** combinés dans un seul composite édité au PageBuilder

**Contrainte d'unicité** :

* `@@unique([disciplineId, day, beginTime, audience])` — pas deux
  cours identiques sur la même combinaison

C'est cette unicité qui définit ce qu'est un « doublon » de cours : un
deuxième cours pour la même discipline, le même jour, à la même heure
de début, pour la même audience.

**Pas de champ `description` séparé** : c'est volontaire. Le `content`
joue le rôle de description ET de programme via le composite de blocs
du PageBuilder. Un cours bien rédigé contient typiquement un bloc texte
d'intro, une galerie de photos, et un bloc programme (texte avec listes
ou tableau).

**Au sujet du programme par année** : pour l'instant le programme vit
dans le contenu libre du `content`. Une modélisation plus formelle
(année par année, avec des règles métier sur le passage de grade
réservé à certaines audiences) reste possible plus tard — choix
conscient de la v1 de garder de la souplesse.

### `Stage`

Un événement ponctuel, plus dense qu'un cours hebdomadaire. Typiquement
un weekend intensif, ou une semaine de stage avec un intervenant
extérieur.

**Différences structurelles avec Course** :

* **Deux champs Json séparés** : `description` ET `program`. C'est la
  reconnaissance qu'un stage a deux faces — « ce que c'est et pourquoi »
  d'un côté, « ce qu'on va y faire concrètement » de l'autre. Les deux
  sont éditables au PageBuilder
* Champ `label` — un nom donné au stage (« Stage Sensei Tanaka 2026 »),
  unique par discipline quand `disciplineId` est non-null
* `preRegistered` — tableau de chaînes (probablement des emails ou ids
  utilisateur) pour les préinscriptions
* **Deux niveaux d'animateurs** :
  * `primaryAnimatorId` — l'animateur principal (NOT NULL)
  * `animators[]` — relation many-to-many vers d'autres animateurs.
    Inclut le primaryAnimator (ambiguïté résolue côté backend par la
    composition automatique)

**Découplage v2** :

* `disciplineId` est **nullable** (depuis v2). Un stage peut être
  rattaché à une discipline du club, ou pas
* `externalDisciplineLabel: String?` — pour nommer une discipline non
  enregistrée (« Calligraphie chinoise »)
* `originId: Int?` — pour rattacher à une culture quand pas de
  discipline applicable
* **Au moins un des trois requis** : un Stage doit avoir au moins un
  contexte (discipline du club, label externe, ou origine). Vérifié
  côté router

**Pas de champ `date` au niveau Stage** — la date est portée par les
`StageSession` individuelles. Un stage est donc un container, pas un
événement daté en lui-même.

### `StageSession`

Une séance individuelle d'un stage multi-jours. Un stage de weekend
peut avoir 4 sessions : samedi matin, samedi après-midi, dimanche matin,
dimanche après-midi.

**Champs** :

* `stageId` — rattachement au stage parent (NOT NULL, `onDelete: Cascade`)
* `date` — la date de la séance
* `beginTime`, `endTime` — heures au format HHMM
* `location` (nullable) — adresse libre (« Dojo principal », « Gymnase
  Jean Moulin »)
* `notes` (nullable) — chaîne libre pour des remarques (par exemple
  « apporter son propre keikogi »)

**Pas de PageBuilder ici** — les sessions sont des données structurées
secondaires, pas des pages éditables. Le contenu riche du stage vit
dans `Stage.description` et `Stage.program`.

### `Event`

**Introduit en v2.** Événement non récurrent plus libre que Stage —
repas, conférence, journée portes ouvertes, atelier culturel.

**Différences avec Stage** :

* **Pas obligatoirement rattaché** à une discipline — les trois champs
  `disciplineId`, `externalDisciplineLabel`, `originId` sont tous
  nullables, avec la même règle « au moins un requis » que Stage
* **Un seul composite Json** (`content`) — pas la dichotomie
  description/program. Plus léger en structure
* **`publicationDate?`** pour gérer brouillons (cohérent avec Post) :
  null = brouillon, non-null = publié à cette date (date dans le futur
  = publication programmée)
* **Pattern animation simplifié** : un seul `organizerId`, pas de
  distinction primary/secondary, pas de relation many-to-many

La date n'est pas portée par Event lui-même mais par ses
`EventSession[]` — comme Stage.

### `EventSession`

Clone strict de `StageSession`. Même structure, mêmes conventions,
même cascade au delete du parent.

### `Post`

Article éditorial — actualités, comptes-rendus, annonces. **Indépendant
de toute discipline** : un Post peut parler de n'importe quoi, du
club lui-même comme d'un événement de la vie associative.

**Champs principaux** :

* `title` — le titre de l'article
* `content` — composite Json (`PageContentV1`) édité au PageBuilder
* `authorId` — l'auteur (NOT NULL, relation vers User)
* `publicationDate` (nullable) —  **null = brouillon** , non-null = publié
  à cette date

**Pas de catégorie ni de discipline rattachée** — c'est volontaire.
Si tu veux organiser les Posts en sections plus tard, une `categoryId`
pourra être ajoutée ; pour l'instant tout est en un seul flux.

**Relations sociales** :

* `comments[]` — commentaires utilisateurs
* `likes[]` — likes utilisateurs

Ces deux relations donnent au Post une dimension communautaire que les
autres entités n'ont pas.

### `MediaAsset` et `PageMediaReference`

Documentés en profondeur ailleurs (sous-chantier 2 pour
`PageMediaReference`, commentaires JSDoc dans le schema pour
`MediaAsset`). Résumé pour le contexte domaine :

* **`MediaAsset`** — un fichier tracké en DB, peu importe son backend
  (Cloudinary pour les images/vidéos, R2 pour les audios/documents).
  Identifié par un `id` cuid stable et un `fullPath` unique. A un
  `status` (`pending`, `published`, etc.) qui détermine sa visibilité.
* **`PageMediaReference`** — la table de jointure polymorphe qui lie un
  `MediaAsset` aux pages qui le référencent. Maintient l'intégrité
  cross-table (un asset référencé ne peut pas sortir de `published`).
  Le `pageType` est un enum (`COURSE`, `STAGE_DESCRIPTION`,
  `STAGE_PROGRAM`, `POST`, `DISCIPLINE`, `EVENT`) qui distingue les
  composites.

---

## Conventions transverses

### Format des heures (HHMM)

Tous les champs « heure de la journée » (`Course.beginTime`,
`Course.endTime`, `StageSession.beginTime`, `StageSession.endTime`,
`EventSession.beginTime`, `EventSession.endTime`) sont stockés au format
**HHMM en `Int`** :

* `1830` = 18h30
* `905` = 9h05 (pas de zéro de tête en DB ; le formatage à 2 digits se
  fait à l'affichage)
* `0` = minuit
* `2359` = 23h59

**Avantages** :

* Format compact (un seul `Int`)
* **Lisible en DB sans calcul mental** — quand tu fais `SELECT beginTime FROM Course` et tu vois `1830`, tu lis immédiatement
  « 18h30 », pas besoin de diviser
* Tri naturel par `Int` (la projection HHMM est monotone : plus tard
  dans la journée = HHMM plus grand)

**Validation côté router** : `z.number().int().min(0).max(2359)` avec
une `.refine(v => v % 100 < 60, ...)` pour rejeter les valeurs
structurellement invalides comme `1860` (60 minutes inexistantes).

**Côté UI** : composant `TimeInput` (`@features/admin/common/components`)
qui expose deux inputs séparés HH/MM et combine en HHMM via
`hours*100 + minutes`. Fonction utility `formatHHMM(value)` pour
l'affichage (« 18h30 »).

Pas de fuseau horaire — toutes les heures sont  **locales au club** .

### Le composite Json (`content`, `description`, `program`)

Six champs Json portent des composites de page éditables au
PageBuilder :

* `Course.content`
* `Stage.description` et `Stage.program`
* `Post.content`
* `Discipline.description` (depuis v2)
* `Event.content` (depuis v2)

Le format de ces champs est défini par `pageContentSchemaV1` dans
`@contracts/page` :

```ts
{
  version: 1,
  blocks: [
    { id, type: "tiptap", content: {...} },
    { id, type: "image-gallery", items: [...], layout: "grid" },
    { id, type: "audio-collection", items: [...] },
    { id, type: "document-list", items: [...] },
  ]
}
```

Chaque bloc référence ses médias par `mediaId` (jamais URL ni path) —
cf. sous-chantier 1 et 6.

**Validation à la lecture** : toute lecture depuis la DB doit passer
par `parsePageContentV1(raw)` qui valide le payload Zod et fallback sur
`emptyPageContentV1()` en cas de corruption (sous-chantier 6c).

**Sync transactionnelle** : toute mutation qui touche un de ces champs
s'exécute dans une transaction Prisma qui appelle
`syncPageMediaReferences` pour maintenir la table `PageMediaReference`
à jour. Si le composite référence un mediaId non-published, la mutation
roll-back avec un BAD_REQUEST précis. Cf. sous-chantier 4.

### Le `status` du MediaAsset

`MediaAsset.status` est une **chaîne** (`String`, pas un enum) avec les
valeurs conventionnelles `"pending"` | `"published"` | autres (à
étendre). La valeur courante est gardée en String pour la souplesse
historique ; un enum serait plus rigoureux à terme.

**Sémantique** :

* `pending` — uploadé, pas encore validé par l'admin
* `published` — visible publiquement (et seul état où un asset peut
  être référencé par une page — voir sous-chantier 7)

Le statut applicatif **s'aligne au dossier** : un asset au statut
`published` vit physiquement sous `appRoot/published/...` chez le
backend de stockage. C'est ce qui permet à la garde du sous-chantier 7
de détecter une « sortie de published » par observation du path source
vs path cible d'une opération de move.

### Les deux instructeurs de Course

Sujet non évident au premier coup d'œil — clarifié ici pour éviter la
confusion.

`Discipline` porte un **`instructorId` NOT NULL** : c'est l'instructeur
principal de la discipline, celui qui en a la responsabilité
pédagogique. Le sensei en chef du Karaté, par exemple.

`Course` porte un **`instructorId` nullable** : c'est l'instructeur
spécifique de  **ce créneau hebdomadaire** , qui peut diverger du
principal de la discipline.

**Cas d'usage typique** : Sensei Tanaka est l'instructeur principal du
Karaté. Il anime lui-même le cours du mardi soir
(`Course.instructorId = null`, donc « instructeur de la discipline par
défaut »). Le jeudi soir, son assistante Sophie prend le relais
(`Course.instructorId = sophie.id`).

**Convention applicative** :

* `Course.instructorId === null` ⇒ « par défaut, l'instructeur de la
  discipline », à résoudre à l'affichage
* `Course.instructorId === userId` ⇒ « explicitement Sophie ce
  créneau-là »

Le composant `InstructorSelect` reflète cette sémantique avec une
option « Aucun » qui poste `null`.

### Au moins un des trois (rattachement Stage et Event)

`Stage` et `Event` partagent une règle de cohérence métier introduite en
v2 : **au moins un de `disciplineId`, `externalDisciplineLabel`,
`originId`** doit être renseigné.

L'objectif est qu'un Stage / Event ait toujours du contexte, même quand
il n'est pas rattaché à une discipline du club :

* Soit la discipline du club (cas typique)
* Soit un libellé libre pour une discipline externe non enseignée
  (« Calligraphie chinoise »)
* Soit juste une origine culturelle (« stage culturel asiatique »)
* N'importe quelle combinaison des trois

Vérifié côté Zod au create (refine sur l'objet complet), côté router
au update (merge avec l'état DB puis validation, parce que Zod ne
connaît pas l'état actuel).

---

## Pour finir

Ce document est **vivant** — à enrichir à chaque évolution. Les `///`
doc comments du `schema.prisma` (cf. patch en parallèle) restent la
référence inline pour la DX au quotidien ; ce document garde la vue
d'ensemble et le pourquoi.
