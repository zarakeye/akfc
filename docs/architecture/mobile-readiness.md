# Mobile Readiness

The project is designed to eventually support a **React Native (Expo)**
mobile application.

------------------------------------------------------------------------

# Motivation

Many parts of the application can be reused between web and mobile:

-   domain types
-   validation schemas
-   API contracts
-   business logic

Preparing for this early prevents heavy refactoring later.

------------------------------------------------------------------------

# Code That Can Be Shared

Examples of reusable elements:

-   Zod schemas
-   TypeScript types
-   API clients
-   business logic helpers

------------------------------------------------------------------------

# Code That Will Stay Platform Specific

Some parts must remain platform specific:

Web:

-   DOM-based drag & drop
-   ResizeObserver hooks
-   certain UI components

Mobile:

-   touch gestures
-   React Native components

------------------------------------------------------------------------

# Possible Future Monorepo

A future structure might be:

    apps
      web
      mobile

    packages
      ui
      types
      core
      api

------------------------------------------------------------------------

# Benefits

Preparing the architecture for mobile allows:

-   easier expansion
-   shared code
-   better long-term maintainability
