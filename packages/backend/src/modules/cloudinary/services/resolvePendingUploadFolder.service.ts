import { PrismaClient } from "@prisma/client";

type Destination =
  | {
      kind: "existing-activity";
      categoryId: number;
      activityId: number;
    }
  | {
      kind: "new-activity";
      categoryId: number;
      newActivityName: string;
    };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function resolvePendingUploadFolder(params: {
  prisma: PrismaClient;
  destination: Destination;
  appRoot: string;
}) {
  const { prisma, destination, appRoot } = params;

  const category = await prisma.category.findUnique({
    where: { id: destination.categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const categorySegment = category.type; // ou slug si tu en as un

  if (destination.kind === "existing-activity") {
    const activity = await prisma.activity.findUnique({
      where: { id: destination.activityId },
    });

    if (!activity) {
      throw new Error("Activity not found");
    }

    if (activity.martialArt !== category.type) {
      throw new Error("Activity does not belong to category");
    }

    return `${appRoot}/pending/${categorySegment}/${activity.id}`;
  }

  // new activity
  const slug = slugify(destination.newActivityName);

  return `${appRoot}/pending/${categorySegment}/new/${slug}`;
}