import type { PrismaClient } from "@prisma/client";

import { formatTicketRef } from "@backend/modules/tickets/ticketRef";

/*
 * Droit d'accès et à la portabilité (art. 15 et 20 RGPD) : toutes les données personnelles qu'un
 * membre a sur le site, en un fichier JSON lisible. Jamais le mot de passe (même son empreinte),
 * jamais les données d'autres personnes : des réponses rédigées pour d'autres demandeurs, on ne
 * donne que le nombre. Les fichiers (photos, documents) sont listés, pas joints.
 */
export async function exportMyData(db: PrismaClient, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, emailVerified: true, firstName: true, lastName: true, pseudo: true, phone: true,
      birthDate: true, memberSince: true, aboutMe: true, avatar: true, image: true, instructorBio: true,
      createdAt: true, updatedAt: true,
      preferences: { select: { displayEmail: true, displayPhone: true, darkMode: true, description: true } },
      memberGroupMemberships: { select: { group: { select: { name: true } } } },
      sessions: { select: { createdAt: true, expiresAt: true }, orderBy: { createdAt: "desc" } },
      ticketsRequested: {
        orderBy: { createdAt: "desc" },
        select: {
          number: true, subject: true, status: true, createdAt: true, closedAt: true,
          category: { select: { label: true } },
          messages: { orderBy: { createdAt: "asc" }, select: { direction: true, authorName: true, body: true, createdAt: true } },
        },
      },
      posts: { select: { title: true, createdAt: true, publicationDate: true } },
      comments: { select: { content: true, createdAt: true, postId: true } },
      reactions: { select: { emoji: true, targetType: true, targetId: true, createdAt: true } },
      pollVotes: { select: { pollId: true, createdAt: true } },
      memberDocumentRecipients: {
        select: { memberDocument: { select: { title: true, publishedAt: true, mediaAsset: { select: { displayName: true, originalFileName: true } } } } },
      },
      documentReceipts: {
        select: { readAt: true, memberDocument: { select: { title: true, mediaAsset: { select: { displayName: true, originalFileName: true } } } } },
      },
      uploadedMediaAssets: { select: { displayName: true, originalFileName: true, fullPath: true, createdAt: true } },
    },
  });
  if (!user) return null;
  // Réponses rédigées en tant que responsable sur les demandes d'AUTRES personnes : nombre seulement.
  const repliesForOthers = await db.ticketMessage.count({
    where: { authorId: userId, NOT: { ticket: { requesterId: userId } } },
  });

  const docName = (d: { title: string | null; mediaAsset: { displayName: string | null; originalFileName: string } }): string =>
    d.title ?? d.mediaAsset.displayName ?? d.mediaAsset.originalFileName;

  return {
    _about:
      "Export de vos données personnelles sur le site du club (droit d'accès et de portabilité, RGPD). " +
      "Votre mot de passe n'y figure pas. Les fichiers sont listés par leur nom, pas joints.",
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      emailVerified: user.emailVerified,
      firstName: user.firstName,
      lastName: user.lastName,
      pseudo: user.pseudo,
      phone: user.phone,
      birthDate: user.birthDate,
      memberSince: user.memberSince,
      aboutMe: user.aboutMe,
      avatar: user.avatar,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences,
    },
    instructorBio: user.instructorBio,
    groups: user.memberGroupMemberships.map((m) => m.group.name),
    sessions: user.sessions,
    requests: user.ticketsRequested.map((t) => ({
      ref: formatTicketRef(t.number),
      category: t.category.label,
      subject: t.subject,
      status: t.status,
      createdAt: t.createdAt,
      closedAt: t.closedAt,
      messages: t.messages,
    })),
    repliesWrittenForOtherMembers: repliesForOthers,
    posts: user.posts,
    comments: user.comments,
    reactions: user.reactions,
    pollVotes: user.pollVotes,
    personalDocuments: user.memberDocumentRecipients.map((r) => ({ name: docName(r.memberDocument), publishedAt: r.memberDocument.publishedAt })),
    documentReadState: user.documentReceipts.map((r) => ({ name: docName(r.memberDocument), readAt: r.readAt })),
    uploadedFiles: user.uploadedMediaAssets.map((a) => ({ name: a.displayName ?? a.originalFileName, path: a.fullPath, createdAt: a.createdAt })),
  };
}
