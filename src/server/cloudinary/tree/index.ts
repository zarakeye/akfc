/**
 * 🧱 Cloudinary Tree – Public Facade
 *
 * This module acts as the **stable public entry point** for building a
 * Cloudinary folder tree on the server.
 *
 * ──────────────────────────────────────────────────────────────
 * Versioning strategy
 * ──────────────────────────────────────────────────────────────
 * - The actual implementation lives in versioned modules
 *   (e.g. `cloudinary.tree.v1.ts`).
 * - This facade re-exports a specific version under an explicit name
 *   (`buildCloudinaryTreeV1`).
 *
 * This allows:
 * - Multiple contract versions to coexist safely
 * - Explicit imports in consumers (no hidden breaking changes)
 * - A clear upgrade path when V2 / V3 are introduced
 *
 * ──────────────────────────────────────────────────────────────
 * Usage
 * ──────────────────────────────────────────────────────────────
 * Consumers SHOULD import from this facade, never directly
 * from versioned files.
 *
 * Example:
 * ```ts
 * import { buildCloudinaryTreeV1 } from "@/server/cloudinary/tree";
 * ```
 *
 * When a new version is released:
 * - A new implementation file is added
 * - This facade is updated (or extended) deliberately
 *
 * No automatic version switching is performed by design.
 */
export { buildCloudinaryTree as buildCloudinaryTreeV1 } from "@/server/cloudinary/tree/finder.tree.v1";