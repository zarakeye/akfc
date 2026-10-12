import { create } from "zustand";

/**
 * Version d'avatar PAR utilisateur, partagée dans toute l'app.
 *
 * Problème résolu : l'URL d'avatar est FIXE par utilisateur
 * (`/api/media/public/avatar/<userId>`), servie avec un cache navigateur.
 * Sans signal de version, aucune vue (uploader, header, posts,
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
   * Fixe la version d'un user partout dans l'app. À défaut de `version`,
   * un timestamp force le rechargement.
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
