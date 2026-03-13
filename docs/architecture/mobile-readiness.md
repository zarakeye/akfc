# Mobile Readiness

Le projet est conçu pour permettre l’ajout futur d’une application mobile **React Native avec Expo**.

---

# Objectifs

L’architecture permet de partager :

- types
- schémas
- contrats API
- logique métier

entre le web et le mobile.

---

# Code partagé

Le code réutilisable se trouve dans :

```text
packages/contracts
packages/backend
```

---

# Code spécifique au web

Certaines parties resteront spécifiques au web :

- drag & drop DOM
- ResizeObserver
- interactions desktop complexes

---

# Code spécifique au mobile

L’application mobile aura ses propres implémentations pour :

- gestures tactiles
- navigation mobile
- composants natifs

---

# Future application mobile

La future application sera située dans :

```text
apps/mobile
```

Elle consommera la même API que l’application web.

---

# Avantages

Cette architecture permet :

- une meilleure évolutivité
- une réutilisation du code
- une maintenance plus simple
