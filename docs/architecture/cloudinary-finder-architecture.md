# Cloudinary Finder Architecture

The **Cloudinary Finder** is one of the most complex features of the
project. It provides a file‑explorer‑like interface for browsing and
managing media stored in Cloudinary.

This module serves both as a **production feature** and as a **teaching
example** for several advanced frontend and backend patterns.

------------------------------------------------------------------------

# Goals of the Finder

The Finder was designed to:

-   navigate Cloudinary folders
-   display assets in a grid view
-   support multi‑selection
-   support drag & drop
-   manage virtual folders (published / pending / bin)
-   integrate with the backend via tRPC
-   enforce security rules through guards

------------------------------------------------------------------------

# High Level Architecture

The Finder architecture is divided into several layers:

    UI Components
    ↓
    State Management
    ↓
    Domain Model
    ↓
    Adapters / Mappers
    ↓
    tRPC API
    ↓
    Backend Services
    ↓
    Cloudinary API

Each layer isolates responsibilities and improves maintainability.

------------------------------------------------------------------------

# Folder Structure

The Finder lives in the frontend under:

    apps/web/src/features/cloudinary-finder

Example structure:

    cloudinary-finder
    ├─ ui
    │  ├─ grid
    │  ├─ tree
    │  ├─ preview
    │  ├─ trash
    │  └─ multiSelect
    │
    ├─ state
    │
    ├─ model
    │
    ├─ utils
    │
    ├─ adapters
    │
    ├─ dnd
    │
    └─ guards

------------------------------------------------------------------------

# UI Layer

The UI is responsible for rendering the interface.

Key components:

-   **Tree View** --- displays the folder hierarchy
-   **Grid View** --- displays assets in the current folder
-   **Preview Sidebar** --- displays metadata of selected files
-   **Multi‑Select Sidebar** --- displays actions for selected assets
-   **Trash / Bin View** --- handles deleted assets

These components communicate through shared state.

------------------------------------------------------------------------

# State Management

The Finder uses **Zustand** for state management.

Responsibilities:

-   selected items
-   current folder
-   multi‑selection state
-   UI state (sidebar visibility)

Keeping state centralized prevents UI inconsistencies.

------------------------------------------------------------------------

# Domain Model

The domain layer defines the data structures used by the Finder.

Examples:

-   Asset
-   Folder
-   VirtualRoot
-   TrashEntry
-   SelectionState

These models are defined in shared types so they can be reused across
the project.

------------------------------------------------------------------------

# Drag and Drop System

The Finder includes a custom **drag & drop system**.

Features:

-   ghost previews
-   multi‑item drag
-   drag targets validation
-   integration with move guards

The logic lives in:

    dnd/

This layer isolates complex UI interactions from the rest of the
application.

------------------------------------------------------------------------

# Adapters and Mappers

Adapters translate UI actions into backend operations.

Example:

    drag event
    → move intent
    → tRPC mutation

Mappers ensure data returned from the backend fits the UI domain model.

------------------------------------------------------------------------

# Guards

Guards prevent invalid operations.

Examples:

-   moving assets to forbidden folders
-   deleting protected assets
-   invalid drag targets

These rules protect both the UI and backend from inconsistent
operations.

------------------------------------------------------------------------

# Backend Integration

The Finder communicates with the backend through **tRPC**.

Key procedures include:

-   getFolderTree
-   listAssets
-   moveAssets
-   deleteAssets
-   restoreAssets

The backend then interacts with Cloudinary.

------------------------------------------------------------------------

# Interaction with Cloudinary

The backend layer handles direct communication with the Cloudinary API.

Responsibilities:

-   listing folders
-   retrieving assets
-   moving assets between folders
-   deleting or restoring assets

Cloudinary responses are normalized before reaching the UI.

------------------------------------------------------------------------

# Educational Value

The Finder demonstrates several advanced concepts:

-   feature‑based frontend architecture
-   state management with Zustand
-   custom drag & drop implementation
-   API design with tRPC
-   domain‑driven modeling
-   integration with third‑party APIs

Because of this, the Finder will be the basis of **multiple technical
tutorials**.

------------------------------------------------------------------------

# Possible Future Improvements

-   asset search
-   pagination / virtualization for large folders
-   improved keyboard navigation
-   mobile compatibility
-   batch operations optimization

------------------------------------------------------------------------

# Summary

The Cloudinary Finder is a central feature of the project.

It demonstrates how a complex interactive UI can be structured using:

-   clear architectural layers
-   domain modeling
-   strong typing
-   separation of concerns
