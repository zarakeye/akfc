# Project Architecture

This document explains the overall architecture of the project.

The application is the website of a martial arts club and serves as the
foundation for a series of tutorials about building modern fullstack
applications with:

-   Next.js
-   React 19
-   TypeScript
-   tRPC
-   Prisma
-   Cloudinary

The project is also designed with a future **React Native (Expo)**
application in mind.

------------------------------------------------------------------------

# Architectural Goals

The architecture aims to:

-   separate business logic from UI
-   keep the backend strongly typed
-   make the system modular and maintainable
-   allow future extension to a mobile application
-   support a tutorial-driven documentation structure

------------------------------------------------------------------------

# Repository Structure

Current simplified structure:

    project-root
    │
    ├─ docs
    │
    ├─ prisma
    │
    ├─ src
    │  ├─ app
    │  ├─ features
    │  ├─ hooks
    │  ├─ server
    │  └─ shared
    │
    └─ public

------------------------------------------------------------------------

# Feature-Based Architecture

The frontend is organized using a **feature-based architecture**.

Example:

    src/features
      cloudinary-finder
      editor
      auth

Each feature can contain:

    ui
    state
    model
    utils
    adapters
    guards

This structure keeps features isolated and easier to understand.

------------------------------------------------------------------------

# Separation of Concerns

The architecture separates responsibilities into layers.

    UI
    ↓
    State
    ↓
    Domain Model
    ↓
    API Client
    ↓
    Backend Services
    ↓
    Database / External APIs

------------------------------------------------------------------------

# Backend Architecture

The backend uses **tRPC** and follows this structure:

    routers
    services
    schemas
    mappers
    guards

Each layer has a clear responsibility.

------------------------------------------------------------------------

# Media Management

Images are handled through Cloudinary.

Responsibilities:

-   upload and transformation
-   CDN delivery
-   metadata stored in the database
-   Finder UI for media management

------------------------------------------------------------------------

# Documentation Strategy

The project includes extensive documentation in `/docs`.

This documentation serves two purposes:

-   explain the architecture
-   act as a series of tutorials.

------------------------------------------------------------------------

# Future Mobile Application

The architecture is designed so that parts of the codebase can later be
reused by a React Native (Expo) mobile application.

Future structure could look like:

    apps
      web
      mobile

    packages
      ui
      types
      core
      api

This would allow sharing logic between web and mobile applications.
