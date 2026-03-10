# Backend Architecture

The backend is implemented using **tRPC** with a layered architecture.

------------------------------------------------------------------------

# Overview

The backend structure:

    server
      routers
      services
      schemas
      mappers
      guards

Each layer has a specific responsibility.

------------------------------------------------------------------------

# Routers

Routers define the public API of the backend.

Responsibilities:

-   expose procedures
-   validate input
-   call services

Example:

    cloudinary.router.ts
    auth.router.ts
    posts.router.ts

------------------------------------------------------------------------

# Services

Services contain the business logic.

Responsibilities:

-   coordinate database operations
-   communicate with external APIs
-   apply domain rules

------------------------------------------------------------------------

# Schemas

Schemas are defined using **Zod**.

They ensure:

-   input validation
-   type safety
-   consistent data structures

------------------------------------------------------------------------

# Mappers

Mappers convert data between layers.

Examples:

-   database models → DTO
-   Cloudinary responses → internal models

------------------------------------------------------------------------

# Guards

Guards enforce security rules.

Examples:

-   authentication checks
-   role-based access control
-   resource ownership validation

------------------------------------------------------------------------

# Benefits of this Architecture

-   clear separation of concerns
-   easier testing
-   reusable business logic
-   better scalability
