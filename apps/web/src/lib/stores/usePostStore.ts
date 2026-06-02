import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { Post } from "@prisma/client";

import type { PageContentV1 } from "@contracts/page";

/**
 * usePostStore
 *
 * Cache local des `Post` (articles / actualités). Aligné sur
 * `useEventStore` :
 *
 * - `content` typé **`PageContentV1` strict** (matche l'inférence tRPC
 *   du router refactoré).
 * - `publicationDate` pour le cycle brouillon/publié.
 * - Deux lectures de liste : `fetchPosts` (public, publiés) et
 *   `fetchPostsAdmin` (tout, brouillons inclus).
 *
 * L'auteur n'est pas un champ d'input : il est fixé à l'utilisateur
 * courant côté router au moment du create.
 */

export type CreatePostInput = {
  title: string;
  content: PageContentV1;
  publicationDate?: Date | null;
};

export type UpdatePostInput = {
  id: number;
  title?: string;
  content?: PageContentV1;
  publicationDate?: Date | null;
};

export interface PostStoreState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;

  fetchPosts: () => Promise<void>;
  fetchPostsAdmin: () => Promise<void>;
  fetchPostById: (id: number) => Promise<Post | null>;

  createPost: (input: CreatePostInput) => Promise<Post>;
  updatePost: (input: UpdatePostInput) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

export const usePostStore = create<PostStoreState>((set, get): PostStoreState => ({
  posts: [],

  setPosts: (posts: Post[]) => set({ posts }),

  fetchPosts: async (): Promise<void> => {
    const posts = await trpcClient.post.getAll.query();
    set({ posts });
  },

  fetchPostsAdmin: async (): Promise<void> => {
    const posts = await trpcClient.post.getAllAdmin.query();
    set({ posts });
  },

  fetchPostById: async (id: number): Promise<Post | null> => {
    const { posts } = get();
    const cached = posts.find((p) => p.id === id);
    if (cached) return cached;

    try {
      return await trpcClient.post.getById.query({ id });
    } catch {
      return null;
    }
  },

  createPost: async (input: CreatePostInput): Promise<Post> => {
    const created = await trpcClient.post.create.mutate(input);
    set((state) => ({ posts: [...state.posts, created] }));
    return created;
  },

  updatePost: async (input: UpdatePostInput): Promise<Post> => {
    const updated = await trpcClient.post.update.mutate(input);
    set((state) => ({
      posts: state.posts.map((p) => (p.id === updated.id ? updated : p)),
    }));
    return updated;
  },

  deletePost: async (id: number): Promise<void> => {
    await trpcClient.post.delete.mutate({ id });
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    }));
  },
}));