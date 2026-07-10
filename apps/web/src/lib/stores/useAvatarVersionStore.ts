import { create } from "zustand";

/**
 * Version d'avatar PAR utilisateur, partagée dans toute l'app.
 *
 * Problème résolu : l'avatar a un publicId FIXE (`.../avatar`), donc son URL
 * ne change jamais d'un upload à l'autre, et la route le sert en cache
 * `immutable`. Sans signal de version, aucune vue (uploader, header, posts,
 * commentaires…) ne rafraîchit l'image après un changement.
 *
 * Ce store tient un jeton de version par userId. TOUTE URL d'avatar y ajoute
 * `?v=<version>`. Bumper la version d'un user (au changement d'avatar)
 * recharge son image PARTOUT simultanément — un seul point de vérité.
 */
interface AvatarVersionStore {
  /** userId → jeton de version (timestamp du dernier changement). */
  versions: Record<string, number>;
  /** Version courante d'un user (0 si jamais changé cette session). */
  getVersion: (userId: string) => number;
  /**
   * Fixe la version d'un user partout dans l'app. Passer la `version`
   * Cloudinary (numéro du binaire) garantit que l'URL pointe vers le bon
   * fichier ; à défaut, un timestamp force au moins le rechargement.
   */
  bump: (userId: string, version?: number) => void;
}

export const useAvatarVersionStore = create<AvatarVersionStore>((set, get) => ({
  versions: {},
  getVersion: (userId) => get().versions[userId] ?? 0,
  bump: (userId, version) =>
    set((state) => ({
      versions: {
        ...state.versions,
        [userId]: version ?? Date.now(),
      },
    })),
}));
