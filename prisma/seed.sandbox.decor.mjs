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
