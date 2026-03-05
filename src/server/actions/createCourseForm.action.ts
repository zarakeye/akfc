'use server';
// export const runtime = 'nodejs';

import { getUserFromSessionJWT } from "@server/lib/session/session.server";
import { prisma } from "@server/prisma";
import { createCourseFormSchema } from "@/server/schemas/createCourseForm.schema";
// import type { Course } from "@generated/prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/client";

export interface CreateCourseStateType {
  success: boolean;
  error?: string;
}

/**
 * 🧩 Action Server
 * Creates a new course with the given form data.
 * 
 * Validation is done in two steps:
 * - First, the form data is validated against the `createCourseFormSchema` using Zod.
 * - If the validation is successful, the course is created in Prisma.
 * 
 * If any error occurs during the process, an error message is returned.
 * 
 * @param {CreateCourseStateType} prevState - The current state of the action.
 * @param {FormData} formData - The form data containing the course details.
 * @returns {Promise<CreateCourseStateType>} A promise that resolves to an object with a success property and an error property.
 * If the creation is successful, success is true and error is an empty object.
 * If the creation fails, success is false and error is an object with a message property.
 */
export const createCourseFormAction = async (
  prevState: CreateCourseStateType,
  formData: FormData
): Promise<CreateCourseStateType> => {
  console.log("createCourseAction called with formData:", formData);

  
  // ✅ Validation Zod coté serveur
  const result = createCourseFormSchema.safeParse({
    label: formData.get('label')?.toString().trim(),
    content: formData.get('content'), //? JSON.parse(formData.get('content') as string) : null,
    beginTime: Number(formData.get('beginAtHour')) * 60 + Number(formData.get('beginAtMinute')),
    endTime: Number(formData.get('endAtHour')) * 60 + Number(formData.get('endAtMinute')),
    day: formData.get('day')?.toString().trim(),
  });
  
  console.log("Validation result:", result);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    // ✅ Insertion Prisma
    await prisma.course.create({
      data: {
        label: result.data.label,
        content: (result.data.content ?? null) as InputJsonValue,
        beginTime: result.data.beginTime,
        endTime: result.data.endTime,
        day: result.data.day,
        coachId: (await getUserFromSessionJWT())!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error creating course:", error);
    return {
      success: false,
      error: "An error occurred while creating the course.",
    };
  }
};
