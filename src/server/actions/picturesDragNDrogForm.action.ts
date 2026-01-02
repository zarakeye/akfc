'use server';

import { picturesDragNDrogFormSchema } from "@/server/schemas/picturesDragNDropForm.schema";
import { trpcCaller } from "../trpc/trpcCaller";

export type PicturesDragNDrogFormState = {
  success: boolean;
  error?: string;
}

function extractPictures(formData: FormData) {
  const pictures: { name: string; base64: string }[] = [];

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^pictures\.(\d+)\.(name|base64)$/);
    if (!match) continue;

    const index = Number(match[1]);
    const field = match[2] as 'name' | 'base64';

    if (!pictures[index]) {
      pictures[index] = { name: '', base64: '' };
    }

    pictures[index][field] = value.toString();
  }

  return pictures.filter(
    (p) => p.name && p.base64
  );
}

export const picturesDragNDropFormAction = async (
  _: PicturesDragNDrogFormState,
  formData: FormData
): Promise<PicturesDragNDrogFormState> => {
  console.log('🧪 picturesDragNDropForm RAW FormData:', Object.fromEntries(formData.entries()));

  // const pictures = extractPictures(formData);

  // const parsedPictures = JSON.parse(
  //   formData.get('pictures')?.toString() ?? '[]'
  // );

  const rawPictures = formData.get('pictures');
  const pictures = rawPictures ? JSON.parse(rawPictures as string) : [];

  // ✅ Validation Zod coté serveur
  const result = picturesDragNDrogFormSchema.safeParse({
    userId: formData.get('userId')?.toString().trim(),
    categoryId: formData.get('categoryId')?.toString().trim() ?? null,
    activityId: formData.get('activityId')?.toString().trim() ?? null,
    newActivityName: formData.get('newActivityName')?.toString().trim() ?? '',
    pictures, //: parsedPictures, // formData.get('pictures') ? JSON.parse(formData.get('pictures') as string) : [],
  });

  console.log("Validation result:", result);

  if (!result.success) {
    console.error('❌ Zod error:', result.error);
    return {
      success: false,
      error: result.error.issues[0].message ?? 'Données de formulaire invalides !',
    };
  }

  console.log("✅ Form data validated:", result.data);
  console.log('✅ pictures:', result.data.pictures);

  return {
    success: true,
  };
}
