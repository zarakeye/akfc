import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@backend/modules";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type CloudinaryFolderTree = RouterOutputs['cloudinary']['getFolderTree'];