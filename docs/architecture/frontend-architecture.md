# Frontend Architecture

Le frontend est construit avec **Next.js App Router**.

L’architecture privilégie une organisation **par feature**.

---

# Structure

```text
apps/web/src
│
├─ app
├─ components
├─ features
├─ hooks
├─ lib
└─ styles
```

---

# App Router

Le dossier `app` définit les routes.

Responsabilités :

- routing
- layouts
- server components
- route handlers

Exemple :

```text
app
 ├─ admin
 ├─ gallery
 ├─ auth
 └─ api
```

---

# Features

Les fonctionnalités sont regroupées par domaine.

Exemples :

```text
features
 ├─ cloudinary-finder
 ├─ editor-tiptap
 ├─ gallery-crop
 └─ auth-ui
```

Chaque feature peut contenir :

```text
ui/
state/
model/
utils/
adapters/
guards/
```

---

# Hooks

Les hooks réutilisables sont dans :

```text
src/hooks
```

Exemples :

- useThrottledCallback
- useElementRect
- useMenuNavigation
- useIsBreakpoint
- useUnmount

Ces hooks encapsulent des comportements complexes.

---

# State management

Le projet utilise **Zustand**.

Exemples d’usage :

- sélection multiple dans le Finder
- état de certaines interfaces
