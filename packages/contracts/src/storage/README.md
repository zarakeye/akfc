# `@contracts/storage`

Contrat agnostique des adapters de stockage du finder.

## Principe

Tout backend de stockage (Cloudinary, R2, S3, FS local, mémoire pour les tests…) doit pouvoir s'intégrer au finder en implémentant ce contrat. Le contrat est **strictement neutre** vis-à-vis des providers : aucun nom d'API, aucun concept Cloudinary-spécifique, aucune supposition sur la structure physique du stockage.

L'agnosticisme n'est pas une simplification. **Toute la richesse fonctionnelle** (multi-sélection, déplacement par statut applicatif, cycle de vie pending/published/bin) est portée au niveau du contrat — pas reléguée à un domaine au-dessus. Ce qui peut être fait avec un adapter Cloudinary doit pouvoir l'être avec un adapter R2 demain, sans régression.

## Anatomie du contrat — trois couches

```
┌────────────────────────────────────────────────────────────────┐
│ Couche 3 — INTENTION                  StorageMoveIntent         │
│   "déplace cette sélection vers le statut `published`"          │
│   Concepts riches : selection, status-folder, lifecycle status  │
│   Fichier : move.intent.ts                                      │
└────────────────────────────────────────────────────────────────┘
                          │
                          │ résolution (côté backend)
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Couche 2 — RÉSOLUTION                                           │
│   Service `resolveMoveIntent` (à venir au chantier 1.x).        │
│   Expanse selection → N items, traduit status-folder → path     │
│   concret, produit N opérations atomiques.                      │
│   Fichier : packages/backend/src/modules/storage/...            │
└────────────────────────────────────────────────────────────────┘
                          │
                          │ exécution
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Couche 1 — ADAPTER                    StorageAdapter            │
│   list / getTree / getNode / getMetadata                        │
│   move(StorageMoveOperation) / delete                           │
│   UploadCapableAdapter (capability d'upload, séparée)           │
│   Fichiers : storage.adapter.ts + storage.types.ts              │
└────────────────────────────────────────────────────────────────┘
```

## Pourquoi cette séparation en couches ?

- **Couche 3 — Intention.** Les concepts riches (`selection`, `status-folder`) ont leur place ici parce qu'ils expriment **ce que l'utilisateur veut**, indépendamment du provider. Le cycle de vie `pending/published/bin` est imposé à tous les stockages du projet — c'est une décision applicative transversale, pas une convention Cloudinary.
- **Couche 2 — Résolution.** C'est un service **agnostique** côté backend. Il sait expanser une sélection (en interrogeant l'adapter via `list`/`getTree`) et traduire un `status-folder` en path concret (en respectant la convention `${appRoot}/${status}/...`). Il ne connaît aucun provider directement.
- **Couche 1 — Adapter.** L'adapter ne reçoit jamais que des opérations atomiques sur des paths concrets. Il sait faire ce que son API native sait faire, et c'est tout.

Cette séparation garantit que les concepts riches **ne contaminent pas** les implémentations d'adapter. Ajouter un nouveau provider = écrire un adapter qui sait `list`, `getTree`, `move(operation)`, `delete`. Aucune mention de `selection`, `status-folder`, ou `pending`.

## Fichiers

| Fichier | Rôle | Couche |
|---|---|---|
| `storage.types.ts` | Types primitifs : `StoragePath`, `StorageNode`, `StorageMetadata`, `StorageMoveOperation`, options et résultats des méthodes | 1 |
| `storage.adapter.ts` | Interfaces `StorageAdapter` (noyau) et `UploadCapableAdapter<…>` (capability d'upload, paramétrable par génériques) | 1 |
| `move.intent.ts` | Schemas Zod et types : `StorageMoveIntent`, `StorageMoveSource`, `StorageMoveTarget`, `LifecycleStatus` | 3 |
| `index.ts` | Re-exports | — |

## Note sur `status-folder` vs "dossier virtuel"

Le discriminator `status-folder` (dans `move.intent.ts`) désigne un dossier identifié par son **statut applicatif**, par opposition à `folder` qui désigne un dossier identifié par un **path concret**.

`status-folder` n'a **rien à voir** avec la notion de "dossier virtuel au sens stockage" :

- Avec un provider qui a des dossiers réels (FS local, R2 avec convention de prefix), `pending/`, `published/`, `bin/` sont des dossiers concrets en stockage. La virtualité de la cible est purement intentionnelle.
- Avec un provider sans dossiers physiques (Cloudinary), ces mêmes dossiers sont aussi virtuels au sens stockage — mais c'est un détail d'implémentation provider, pas une propriété du contrat.

Le contrat agnostique ne se prononce que sur la signification intentionnelle. C'est aux adapters de gérer la matérialisation.

## Compatibilité avec le `MoveIntent` Cloudinary historique

Le contrat Cloudinary expose actuellement un `MoveIntent` riche dans `cloudinary/move.schema.ts`. Ce type **continuera à coexister** pendant la transition (statut B2 du chantier 1 : déprécié sans suppression immédiate).

À terme, tous les callsites Cloudinary devront migrer vers `StorageMoveIntent` du contrat agnostique, et le `MoveIntent` Cloudinary sera supprimé. Cette migration est un sous-chantier dédié, pas une étape du chantier 1.
