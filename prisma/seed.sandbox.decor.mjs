// Le décor des parcours de la sandbox : les demandes au club (tickets), dans tous leurs états, et
// le bénévole du support qui les traite. Appelé par seed.sandbox.mjs, dans la sandbox seulement
// (DEMO_MODE=1) ; idempotent : une demande déjà là n'est pas recréée.

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

/**
 * Les catégories de demande, comme ensureTicketCategories les crée au démarrage du site, mais
 * avec des adresses de la sandbox : les réponses arrivent dans Mailpit, pas chez le club.
 * @param {import("@prisma/client").PrismaClient} prisma @param {string} adminGroupId @param {string} domain
 */
async function ensureCategories(prisma, adminGroupId, domain) {
  const support =
    (await prisma.memberGroup.findFirst({ where: { name: "Support", isAdminGroup: false }, select: { id: true } })) ??
    (await prisma.memberGroup.create({
      data: { name: "Support", isCollaborative: false, parentGroupId: adminGroupId },
      select: { id: true },
    }));
  const defs = [
    { key: "gestion", label: "Gestion du club", replyTo: `gestion@${domain}`, position: 0, groupId: adminGroupId },
    { key: "support", label: "Support du site", replyTo: `support@${domain}`, position: 1, groupId: support.id },
  ];
  /** @type {Record<string, string>} */
  const ids = {};
  for (const d of defs) {
    const c = await prisma.ticketCategory.upsert({
      where: { key: d.key },
      update: { replyTo: d.replyTo },
      create: d,
      select: { id: true },
    });
    ids[d.key] = c.id;
  }
  return { categoryIds: ids, supportGroupId: support.id };
}

/**
 * @param {{
 *   prisma: import("@prisma/client").PrismaClient;
 *   hash: string;
 *   domain: string;
 *   adminId: string;
 *   adminGroupId: string;
 *   memberId: string;
 * }} ctx
 */
export async function seedTicketsDecor({ prisma, hash, domain, adminId, adminGroupId, memberId }) {
  const { categoryIds, supportGroupId } = await ensureCategories(prisma, adminGroupId, domain);

  // Un bénévole du support : pas administrateur, il ne voit que les demandes de son groupe.
  // Connu par un pseudo, comme beaucoup de bénévoles.
  const sam = await prisma.user.upsert({
    where: { email: `support.sam@${domain}` },
    update: { password: hash, emailVerified: true, isFirstLogin: false },
    create: {
      email: `support.sam@${domain}`, pseudo: "Sam (support)", password: hash,
      emailVerified: true, isFirstLogin: false, legalAge: "ADULT",
    },
    select: { id: true },
  });
  await prisma.memberGroupMembership.upsert({
    where: { groupId_userId: { groupId: supportGroupId, userId: sam.id } },
    update: {},
    create: { groupId: supportGroupId, userId: sam.id, access: "EDITOR" },
  });

  const member = { id: memberId, email: `membre@${domain}`, name: "Membre Démo" };
  const now = Date.now();
  const at = (/** @type {number} */ ms) => new Date(now + ms);

  /**
   * Une demande et son histoire. `steps` : ce qui s'est passé après le dépôt, dans l'ordre.
   * @typedef {{ out?: { by: string; name: string; body: string; after: number }; take?: { by: string; after: number }; close?: { by: string; after: number } }} Steps
   * @param {{ subject: string; category: string; requester: { id: string | null; email: string; name: string };
   *   body: string; created: number; due: number; status: "WAITING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"; steps?: Steps }} t
   */
  const ensureTicket = async (t) => {
    const exists = await prisma.ticket.findFirst({
      where: { subject: t.subject, requesterEmail: t.requester.email },
      select: { id: true },
    });
    if (exists) return;
    const s = t.steps ?? {};
    const created = at(t.created);
    const assigneeId = s.take?.by ?? s.out?.by ?? null;
    /** @type {{ type: "CREATED" | "TAKEN" | "MESSAGE_OUT" | "CLOSED"; actorId: string | null; createdAt: Date }[]} */
    const events = [{ type: "CREATED", actorId: t.requester.id, createdAt: created }];
    if (s.take) events.push({ type: "TAKEN", actorId: s.take.by, createdAt: at(t.created + s.take.after) });
    if (s.out) {
      if (!s.take) events.push({ type: "TAKEN", actorId: s.out.by, createdAt: at(t.created + s.out.after) });
      events.push({ type: "MESSAGE_OUT", actorId: s.out.by, createdAt: at(t.created + s.out.after) });
    }
    if (s.close) events.push({ type: "CLOSED", actorId: s.close.by, createdAt: at(t.created + s.close.after) });
    const messages = [
      {
        direction: /** @type {const} */ ("IN"), authorId: t.requester.id, authorName: t.requester.name,
        fromEmail: t.requester.email, body: t.body, createdAt: created,
      },
    ];
    if (s.out) {
      messages.push({
        direction: "OUT", authorId: s.out.by, authorName: s.out.name, fromEmail: null,
        body: s.out.body, createdAt: at(t.created + s.out.after),
      });
    }
    await prisma.ticket.create({
      data: {
        subject: t.subject,
        status: t.status,
        categoryId: categoryIds[t.category],
        requesterId: t.requester.id,
        requesterEmail: t.requester.email,
        requesterName: t.requester.name,
        assigneeId,
        dueAt: at(t.due),
        firstResponseAt: s.out ? at(t.created + s.out.after) : null,
        closedAt: s.close ? at(t.created + s.close.after) : null,
        createdAt: created,
        messages: { create: messages },
        events: { create: events },
      },
    });
  };

  // En retard : déposée il y a quatre jours, échéance dépassée d'un jour, sans réponse.
  await ensureTicket({
    subject: "Changer de créneau le jeudi",
    category: "gestion",
    requester: member,
    body: "Bonjour,\n\nMes horaires de travail changent : est-il possible de passer du cours du jeudi soir à celui du samedi matin ?\n\nMerci !",
    created: -4 * DAY,
    due: -1 * DAY,
    status: "WAITING",
  });
  // Bientôt due, d'une personne SANS compte (formulaire de contact).
  await ensureTicket({
    subject: "Inscrire mon fils au cours enfants",
    category: "gestion",
    requester: { id: null, email: `paul.verdier@${domain}`, name: "Paul Verdier" },
    body: "Bonjour,\n\nMon fils a 9 ans. Reste-t-il de la place au cours enfants, et peut-il faire un cours d'essai ?\n\nPaul Verdier",
    created: -2 * DAY,
    due: 6 * HOUR,
    status: "WAITING",
  });
  // Prise en charge par le bénévole, pas encore répondue.
  await ensureTicket({
    subject: "Impossible d'ajouter une photo depuis mon iPhone",
    category: "support",
    requester: member,
    body: "Bonjour,\n\nQuand j'ajoute une photo à mon espace depuis mon iPhone, l'envoi reste bloqué. Sur l'ordinateur, ça marche.\n\nMerci de votre aide.",
    created: -1 * DAY,
    due: 2 * DAY,
    status: "IN_PROGRESS",
    steps: { take: { by: sam.id, after: 2 * HOUR } },
  });
  // Répondue : le demandeur peut répondre à son tour (par e-mail, ou par le bouton de démo).
  await ensureTicket({
    subject: "Changer mon adresse e-mail",
    category: "support",
    requester: member,
    body: "Bonjour,\n\nJ'ai changé d'adresse e-mail. Comment la modifier sur le site ?",
    created: -3 * DAY,
    due: 0,
    status: "ANSWERED",
    steps: {
      out: {
        by: sam.id,
        name: "Sam (support)",
        body: "Bonjour,\n\nDepuis votre profil, « Modifier mon profil » : l'adresse se change en bas de la page. Dites-moi si quelque chose bloque.\n\nSam, pour le support du site",
        after: 5 * HOUR,
      },
    },
  });
  // Close : répondue par un administrateur, puis fermée.
  await ensureTicket({
    subject: "Attestation d'inscription pour mon comité d'entreprise",
    category: "gestion",
    requester: member,
    body: "Bonjour,\n\nMon comité d'entreprise rembourse une partie de la cotisation : pouvez-vous m'envoyer une attestation d'inscription pour la saison ?",
    created: -10 * DAY,
    due: -7 * DAY,
    status: "CLOSED",
    steps: {
      out: {
        by: adminId,
        name: "Admin, pour la gestion du club",
        body: "Bonjour,\n\nVoici votre attestation, signée par le bureau. Bonne saison !",
        after: 1 * DAY,
      },
      close: { by: adminId, after: 2 * DAY },
    },
  });

  console.log(`✅ Demandes de démo prêtes (support : support.sam@${domain})`);
}

/** Un PDF d'une page, fait à la main : le « scan » des formulaires papier de démonstration. */
function demoFormPdf(/** @type {string} */ title) {
  const text = title.replace(/[()\\]/g, "");
  const stream = `BT /F1 14 Tf 60 760 Td (${text}) Tj 0 -24 Td (Formulaire de demonstration : aucune personne reelle.) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets = objects.map((o, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

/**
 * Le décor de la médiathèque, sur les photos du paquet : des droits à l'image (complet, partiel,
 * absent), des personnes taguées (photos vertes et rouges, récapitulatif à envoyer), une ancienne
 * version d'un fichier, et une page « L'association » à moitié construite, pas encore publiée.
 * La corbeille, elle, reste vide : la remplir et la vider fait partie du parcours.
 * @param {{
 *   prisma: import("@prisma/client").PrismaClient;
 *   storage: { put: (key: string, body: Buffer, contentType?: string) => Promise<void>; copy: (from: string, to: string) => Promise<void> };
 *   adminId: string;
 *   memberId: string;
 *   pack: { persons: { id: string; instructor: boolean }[]; photos: { id: string; path: string; fullPath: string }[] };
 * }} ctx
 */
export async function seedLibraryDecor({ prisma, storage, adminId, memberId, pack }) {
  const library = pack.photos.filter((p) => !/^(personal-space|collaborative-group-spaces|avatars)\//.test(p.path));
  if (library.length < 4) {
    console.log("ℹ Trop peu de photos dans le paquet pour le décor de la médiathèque");
    return;
  }
  const instructor = pack.persons.find((p) => p.instructor) ?? null;
  const partial = pack.persons.find((p) => !p.instructor) ?? null;

  // 1. Les droits à l'image : l'instructeur a tout accordé, une autre personne seulement l'espace
  // membres. Le membre de démonstration n'a rien donné : c'est à lui de le faire dans le parcours.
  /** @type {[string | null, ("MEMBER_SPACE" | "PUBLIC_SITE" | "SOCIAL_NETWORKS" | "PRINT")[]][]} */
  const consents = [
    [instructor?.id ?? null, ["MEMBER_SPACE", "PUBLIC_SITE", "SOCIAL_NETWORKS", "PRINT"]],
    [partial?.id ?? null, ["MEMBER_SPACE"]],
  ];
  for (const [userId, usages] of consents) {
    if (!userId || (await prisma.imageConsentForm.findFirst({ where: { userId }, select: { id: true } }))) continue;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { firstName: true, lastName: true } });
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const pdf = demoFormPdf(`Autorisation de droit a l'image - ${name}`);
    const storageKey = `_private/image-consent/${userId}/demo-papier.pdf`;
    await storage.put(storageKey, pdf, "application/pdf");
    const signedAt = new Date(Date.now() - 60 * DAY);
    await prisma.imageConsentForm.create({
      data: {
        userId, memberName: name, storageKey, mimeType: "application/pdf", fileName: "autorisation-papier.pdf",
        size: pdf.byteLength, usages, keepAfterLeave: true, signedAt, source: "PAPER", uploadedById: adminId,
      },
    });
    await prisma.user.update({ where: { id: userId }, data: { imageConsent: "GRANTED", imageConsentAt: signedAt } });
  }

  // 2. Les tags : une photo verte (l'instructeur), une rouge (le membre, sans autorisation), une
  // verte dans l'espace membres mais rouge pour le site public. Personne n'est encore prévenu :
  // le récapitulatif est à envoyer.
  /** @type {[number, string | null][]} */
  const tags = [
    [0, instructor?.id ?? null],
    [1, memberId],
    [1, instructor?.id ?? null],
    [2, partial?.id ?? null],
  ];
  for (const [index, userId] of tags) {
    if (!userId) continue;
    const mediaAssetId = library[index].id;
    await prisma.mediaPerson.upsert({
      where: { mediaAssetId_userId: { mediaAssetId, userId } },
      update: {},
      create: { mediaAssetId, userId, taggedById: adminId },
    });
  }

  // 3. Une ancienne version de la première photo : le contenu d'une autre photo, déposé il y a un mois.
  const current = library[0];
  if (!(await prisma.fileVersion.findFirst({ where: { mediaAssetId: current.id }, select: { id: true } }))) {
    const older = library[3];
    const asset = await prisma.mediaAsset.findUniqueOrThrow({
      where: { id: older.id },
      select: { originalFileName: true, bytes: true, width: true, height: true },
    });
    const version = await prisma.fileVersion.create({
      data: {
        mediaAssetId: current.id, storageKey: `_versions/${current.id}/pending`, originalFileName: asset.originalFileName,
        mimeType: "image/jpeg", bytes: asset.bytes, width: asset.width, height: asset.height, authorId: adminId,
        uploadedAt: new Date(Date.now() - 30 * DAY), confirmed: true,
      },
      select: { id: true },
    });
    const storageKey = `_versions/${current.id}/${version.id}`;
    await storage.copy(older.fullPath, storageKey);
    await prisma.fileVersion.update({ where: { id: version.id }, data: { storageKey } });
  }

  // 4. Une page à moitié construite : un début de texte et deux photos, et la page pas encore
  // publiée (« en construction » pour le public).
  if (!(await prisma.sitePage.findUnique({ where: { slug: "association" }, select: { slug: true } }))) {
    const paragraph = (/** @type {string} */ text) => ({ type: "paragraph", content: [{ type: "text", text }] });
    const gallery = [library[0].id, library[3].id];
    await prisma.sitePage.create({
      data: {
        slug: "association",
        title: "L'association",
        content: {
          version: 1,
          blocks: [
            {
              id: "demo-intro",
              type: "tiptap",
              content: {
                type: "doc",
                content: [
                  paragraph("Le club accueille enfants, ados et adultes, du débutant au pratiquant confirmé."),
                  paragraph("À compléter : l'histoire du club, le bureau, les valeurs…"),
                ],
              },
            },
            { id: "demo-gallery", type: "image-gallery", layout: "grid", items: gallery.map((mediaId) => ({ mediaId })) },
          ],
        },
      },
    });
    for (const mediaAssetId of gallery) {
      await prisma.pageMediaReference.upsert({
        where: { mediaAssetId_pageType_pageId: { mediaAssetId, pageType: "SITE_PAGE", pageId: "association" } },
        update: {},
        create: { mediaAssetId, pageType: "SITE_PAGE", pageId: "association" },
      });
    }
    await prisma.pageVisibility.upsert({
      where: { key: "association" },
      update: { published: false },
      create: { key: "association", published: false },
    });
  }

  // Les autres pages éditoriales sont publiées (une page sans ligne est « en construction ») ;
  // un choix fait ensuite au centre de contrôle n'est pas défait au redémarrage.
  for (const key of ["home", "contacts", "inscription"]) {
    await prisma.pageVisibility.upsert({ where: { key }, update: {}, create: { key, published: true } });
  }

  console.log("✅ Décor de la médiathèque prêt (droits à l'image, tags, version, page en construction)");
}
