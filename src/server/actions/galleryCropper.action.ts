'use server';
// export const runtime = 'nodejs';

import type { GalleryCropperState } from "@server/actions/actionState.interfaces";
import { galleryCropperSchema } from "@server/validation/galleryCropper.schema";
import { trpcCaller } from "../trpc/trpcCaller";

export const galleryCropperAction = async (
  prevState: GalleryCropperState,
  formData: FormData
): Promise<GalleryCropperState> => {
  console.log("galleryCropperAction called with formData:", formData);

  // ✅ Validation Zod coté serveur
  const result = galleryCropperSchema.safeParse({
    activiType: Number(formData.get('activityType')?.toString().trim()) ?? null,
    activityId: Number(formData.get('activityId')) ?? null,
    newActivityName: formData.get('newActivityName')?.toString().trim() ?? undefined,
    userId: formData.get('userId')?.toString().trim(),
    pictures: formData.get('pictures') ? JSON.parse(formData.get('pictures') as string) : [],
  });

  console.log("Validation result:", result);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    const raw = {
      activityType: Number(formData.get('activityType')?.toString().trim()) ?? null,
      activityId: Number(formData.get('activityId')?.toString().trim()) ?? null,
      newActivityName: formData.get('newActivityName')?.toString().trim() ?? undefined,
      userId: formData.get('userId')?.toString().trim() ?? null,
      pictures: formData.get('pictures') ? JSON.parse(formData.get('pictures') as string) : [],
    };
    
    const parsed = galleryCropperSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        error: "Données de formulaire invalides !",
      };
    }

    const caller = trpcCaller();
    
    (await caller).upload.uploadImage(parsed.data);

    return {
      success: true,
    };
  } catch (error) {
    // ✅ Gestion d’erreurs
    console.error("❌ Error creating activity:", error);
    return {
      success: false,
      error: "Error creating activity.",
    };
  }
}
