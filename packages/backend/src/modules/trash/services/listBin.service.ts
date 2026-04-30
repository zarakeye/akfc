import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  ListBinInput,
  ListBinOutput,
  TrashEntryDTO,
} from "@contracts/trash/trash.dto";
import {
  bigIntToSafeNumber,
  buildPreviousPathShort,
} from "@backend/modules/trash/utils";

/**
 * listBin.service.ts
 *
 * Liste plate du bin.
 *
 * Design validé :
 * - Tri A: plus récents en haut => trashedAt DESC
 * - Pagination par cursor (id)
 * - previousPathShort calculé côté backend
 * - Inclut sizeBytes + createdAt pour comparer rapidement
 */
export async function listBin(params: {
  prisma: PrismaClient;
  input: ListBinInput;
}): Promise<ListBinOutput> {
  const { prisma, input } = params;

  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);

  const where: Prisma.TrashEntryWhereInput = {
    appRoot: input.appRoot,
    status: "IN_BIN",
  };

  if (input.search && input.search.trim().length > 0) {
    const q = input.search.trim();
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { previousPath: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.trashEntry.findMany({
    where,
    orderBy: [{ trashedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(input.cursor
      ? {
          cursor: { id: input.cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      appRoot: true,
      kind: true,
      status: true,
      displayName: true,
      previousPath: true,
      storageRoot: true,
      trashedAt: true,
      sizeBytes: true,
      cloudinaryCreatedAt: true,
    },
  });

  const hasNextPage = rows.length > limit;
  const sliced = hasNextPage ? rows.slice(0, limit) : rows;

  const items: TrashEntryDTO[] = sliced.map((r) => ({
    id: r.id,
    appRoot: r.appRoot,
    kind: r.kind === "folder" ? "folder" : "file",
    status: r.status,
    displayName: r.displayName,
    previousPath: r.previousPath,
    previousPathShort: buildPreviousPathShort(r.previousPath),
    trashedAt: r.trashedAt.toISOString(),
    sizeBytes: bigIntToSafeNumber(r.sizeBytes),
    createdAt: r.cloudinaryCreatedAt ? r.cloudinaryCreatedAt.toISOString() : undefined,
    publicId: r.kind === "file" ? r.storageRoot : undefined,
  }));

  return {
    items,
    nextCursor: hasNextPage ? sliced[sliced.length - 1]?.id ?? null : null,
  };
}