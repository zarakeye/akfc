'use server';

import { picturesDragNDropFormSchema } from "@/server/schemas/picturesDragNDropForm.schema";
import { uploadToCloudinary } from "../cloudinary/upload";

export type PicturesDragNDropFormState = {
  success: boolean;
  error?: string;
}

export const picturesDragNDropFormAction = async (
  _: PicturesDragNDropFormState,
  formData: FormData
): Promise<PicturesDragNDropFormState> => {
  try {
    // 1. Récupération des fichiers
    const files = formData.getAll('pictures') as File[];

    console.log('files', files);

    if (!files.length) {
      return {
        success: false,
        error: 'Vous devez choisir au moins une image !',
      };
    }

    // 2. Upload Cloudinary
    const uploadedPictures = [];

    for (const file of files) {
      const result = await uploadToCloudinary(file);

      uploadedPictures.push({
        url: result.secure_url,
        name: file.name,
        publicId: result.public_id,
      });
    }

    // ✅ Validation Zod coté serveur (metadata uniquement)
    const parsed = picturesDragNDropFormSchema.safeParse({
      userId: formData.get('userId')?.toString().trim(),
      categoryId: formData.get('categoryId')?.toString().trim() ?? null,
      activityId: formData.get('activityId')?.toString().trim() ?? null,
      newActivityName: formData.get('newActivityName')?.toString().trim() ?? '',
      pictures: uploadedPictures,
    });

    if (!parsed.success) {
      console.error('❌ Zod error:', parsed.error);
      return {
        success: false,
        error: parsed.error.issues[0].message ?? 'Données de formulaire invalides !',
      };
    }

    // console.log("✅ Form data validated:", result.data);
    // console.log('✅ pictures:', result.data.pictures);

    // 4️⃣ TODO: persistance DB via tRPC / Prisma / etc.
    // await trpcCaller.gallery.create(parsed.data)

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error uploading files:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'upload des fichiers.',
    };
  }
};