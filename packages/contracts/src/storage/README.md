# `@contracts/storage`

Contrat agnostique des adapters de stockage du finder.

## Principe

Tout backend de stockage (R2, S3, MinIO, FS local, mémoire pour les tests…) doit pouvoir s'intégrer au finder en implémentant ce contrat. Le contrat est **strictement neutre** vis-à-vis des providers : aucun nom d'API, aucun concept propre à un fournisseur, aucune supposition sur la structure physique du stockage.

L'agnosticisme n'est pas une simplification : la multi-sélection (racines + exclusions) est portée au niveau du contrat, pas reléguée à un domaine au-dessus.

Le **statut** d'un fichier (en attente, validé) n'est pas une affaire de stockage : il vit dans `MediaAsset.status` et change par `media.setStatus`, sans que le binaire bouge. La corbeille a son propre circuit (`trash.*`). Au temps de Cloudinary, le statut était un segment du chemin (`AKFC/pending/…`, `AKFC/published/…`) et publier était un déplacement ; ce contrat n'en garde aucune trace.

## Anatomie du contrat — trois couches

```
┌────────────────────────────────────────────────────────────────┐
│ Couche 3 — INTENTION                  StorageMoveIntent         │
│   « déplace cette sélection dans AKFC/courses/kali »            │
│   Concepts riches : fichier, dossier, sélection                 │
│   Fichier : move.intent.ts                                      │
└────────────────────────────────────────────────────────────────┘
                          │
                          │ résolution (côté backend)
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ Couche 2 — RÉSOLUTION                                           │
│   planMoveOperations / executeMoveOperations                    │
│   Développe la sélection en N éléments, calcule chaque cible    │
│   (la structure se déplace avec ce qu'on déplace).              │
│   Fichier : packages/backend/src/modules/storage/               │
│             resolveMoveIntent.service.ts                        │
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

- **Couche 3 — Intention.** La sélection exprime **ce que l'utilisateur veut**, indépendamment du provider.
- **Couche 2 — Résolution.** Un service **agnostique** côté backend. Il développe une sélection (en interrogeant l'adapter via `getNode`/`getTree`), refuse de déposer un dossier dans lui-même, et produit des opérations atomiques. Il ne connaît aucun provider directement.
- **Couche 1 — Adapter.** L'adapter ne reçoit que des opérations atomiques sur des paths concrets. Il sait faire ce que son API native sait faire, et c'est tout.

Ajouter un provider = écrire un adapter qui sait `list`, `getTree`, `move(operation)`, `delete`. Aucune mention de sélection ni de statut.

## Fichiers

| Fichier | Rôle | Couche |
|---|---|---|
| `storage.types.ts` | Types primitifs : `StoragePath`, `StorageNode`, `StorageMetadata`, `StorageMoveOperation`, options et résultats des méthodes | 1 |
| `storage.adapter.ts` | Interfaces `StorageAdapter` (noyau) et `UploadCapableAdapter<…>` (capability d'upload, paramétrable par génériques) | 1 |
| `move.intent.ts` | Schémas zod et types : `StorageMoveIntent`, `StorageMoveSource`, `StorageMoveTarget` | 3 |
| `index.ts` | Re-exports | — |
