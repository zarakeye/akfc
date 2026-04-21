export type PicturesDragNDropFormValuesType = {
  userId: string;

  categoryId: string | null;
  activityId: string | null;

  newActivityName?: string;

  /**
   * Images prêtes à être envoyées
   * → références logiques uniquement
   * → les vrais fichiers sont gérés ailleurs
   */
  pictures: {
    name: string;
    cloudinaryPublicId?: string;
    secureUrl?: string;
  }[];
};
