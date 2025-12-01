'use server';
// export const runtime = 'nodejs';

import { getUserFromSessionJWT } from "@/lib/session/session.server";
import { prisma } from "@server/prisma";
import { createCourseSchema } from "@server/validation/createCourse.schema";
import type { CreateCourseState } from "@server/actions/actionState.interfaces";
// import type { Course } from "@generated/prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/client";

// 🧩 Action Server

export const createCourseAction = async (
  prevState: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState> => {
  console.log("createCourseAction called with formData:", formData);

  
  // ✅ Validation Zod coté serveur
  const result = createCourseSchema.safeParse({
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
