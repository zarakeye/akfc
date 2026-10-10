import type { Prisma, PrismaClient } from "@prisma/client";

import { pageContentSchemaV1 } from "@contracts/page";

/*
 * Page éditoriale « Nous contacter » (SitePage « contacts ») : texte d'introduction de départ, en
 * VRAI bloc modifiable dans le constructeur (créé si la page est absente, ou s'il n'a aucun bloc ;
 * jamais réécrit ensuite). Le formulaire et les coordonnées s'affichent en dessous, hors constructeur.
 * Ancien titre « Contacts » → « Nous contacter » (seulement s'il n'a pas été personnalisé).
 */

const text = (t: string) => ({ type: "text", text: t });
const p = (...c: object[]) => ({ type: "paragraph", content: c });

const DOC = {
  type: "doc",
  content: [
    p(text("Une question sur les cours, les stages, l'inscription ou le site ? Écrivez-nous avec le formulaire ci-dessous.")),
    p(
      text("Choisissez le destinataire : « Gestion du club » pour la vie du club (cours, stages, licences…), « Support du site » pour un problème sur le site ou votre compte. Vous recevez aussitôt un accusé de réception avec la référence de votre demande, et une réponse dans les meilleurs délais."),
    ),
  ],
};

export async function ensureContactsPage(db: PrismaClient): Promise<{ seeded: boolean; renamed: boolean }> {
  const existing = await db.sitePage.findUnique({ where: { slug: "contacts" }, select: { title: true, content: true } });
  const blocks = (existing?.content as { blocks?: unknown[] } | null)?.blocks;
  const needsSeed = !existing || !Array.isArray(blocks) || blocks.length === 0;
  const needsRename = existing?.title === "Contacts";
  if (!needsSeed && !needsRename) return { seeded: false, renamed: false };
  const json = pageContentSchemaV1.parse({ version: 1, blocks: [{ id: "contacts-intro", type: "tiptap", content: DOC }] }) as unknown as Prisma.InputJsonValue;
  await db.sitePage.upsert({
    where: { slug: "contacts" },
    create: { slug: "contacts", title: "Nous contacter", content: json },
    update: { ...(needsSeed ? { content: json } : {}), ...(needsRename ? { title: "Nous contacter" } : {}) },
  });
  return { seeded: needsSeed, renamed: needsRename };
}
