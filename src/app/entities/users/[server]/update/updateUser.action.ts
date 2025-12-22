"use server";
// export const runtime = 'nodejs';

import { getUserFromSessionJWT, refreshSessionJWT } from "@/lib/session/session.server";
import bcrypt from "bcryptjs";
import { prisma } from "@server/prisma";
import type { UpdateUserState } from "@/app/entities/users/[server]/update/updateUser.stateType";
import { updateUserSchema } from "@/app/entities/users/[server]/update/updateUser.schema";
import { trpcClient } from "@/lib/trpcClient";
// import type { SessionUser } from "@/lib/stores/useUserStore.ts";

export const updateUserAction = async (
  prevState: UpdateUserState,
  formData: FormData
): Promise<UpdateUserState> => {
  const rawData = Object.fromEntries(formData.entries());
  console.log("📥 FORM DATA RECEIVED:", rawData);

  const result = updateUserSchema.safeParse(rawData);

  if (!result.success) {
    console.log("❌ ZOD ERROR:", result.error.flatten());
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const me = await getUserFromSessionJWT();
  console.log("👤 Current user:", me);

  if (!me?.id) {
    return { success: false, error: "Utilisateur non authentifié." };
  }

  const dataToUpdate = {
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    email: result.data.email,
    password: //(result.data.password && result.data.password)
      /*?*/ await bcrypt.hash(result.data.password, 12),
      // : undefined,
    birthDate: new Date(result.data.birthDate),
    isFirstLogin: false,
    roleId: Number(result.data.roleId),
    phone: result.data.phone ?? null,
    avatar: result.data.avatar ?? null,
  };

  console.log("🔄 Data to update:", dataToUpdate);

  try {
    // 1️⃣ Vérifier que l'utilisateur existe
    const existing = await prisma.user.findUniqueOrThrow({
      where: { id: me.id },
    });
    console.log("📌 FOUND USER BEFORE UPDATE:", existing);

    // 2️⃣ Faire l'update
    const updated = await prisma.user.update({
      where: { id: result.data.id },
      data: dataToUpdate,
    });

    // const sessionWithRole = trpcClient.session.update.useQuery({
      
    // });

  

    // await refreshSessionJWT(session, updated);

    console.log("✅ UPDATED USER:", updated);

    return { success: true };
  } catch (error: unknown) {
    console.error("🔥 PRISMA ERROR:", error);
    return {
      success: false,
      error: "Erreur serveur pendant la mise à jour.",
    };
  }
};
