# Frontend Architecture

The frontend is built with **Next.js (App Router)** and follows a
modular structure.

------------------------------------------------------------------------

# Overview

Main directories:

    src
      app
      features
      hooks
      shared

------------------------------------------------------------------------

# App Router

The `app` directory defines the routes of the application.

Responsibilities:

-   page routing
-   layouts
-   server components

------------------------------------------------------------------------

# Features

Each feature contains its own UI and logic.

Example:

    features
      cloudinary-finder
      editor
      auth

This structure improves maintainability and scalability.

------------------------------------------------------------------------

# Hooks

Reusable hooks are stored in:

    src/hooks

Examples:

-   useThrottledCallback
-   useElementRect
-   useMenuNavigation
-   useIsBreakpoint

------------------------------------------------------------------------

# Shared Types

Shared types and utilities are stored in:

    src/shared

These types can later be reused by a mobile application.

------------------------------------------------------------------------

# State Management

The project uses **Zustand** for local state management.

Example:

-   multi-selection state in the Finder.
