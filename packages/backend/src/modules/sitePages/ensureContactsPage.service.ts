import type { Prisma, PrismaClient } from "@prisma/client";

import { pageContentSchemaV1 } from "@contracts/page";

import { sameContent } from "./sameContent";

/*
 * Page éditoriale « Nous contacter » (SitePage « contacts ») : texte d'introduction de départ, en
 * VRAI bloc modifiable dans le constructeur. La page est PUBLIQUE (visiteurs, partenaires) : les
 * coordonnées du club (Réglages du site) s'affichent sous ce texte ; le formulaire de demandes
 * (bureau, support) n'apparaît qu'aux membres connectés, hors constructeur.
 *
 *   - page absente ou sans bloc → texte de départ ;
 *   - texte de départ de la version précédente jamais retouché → remplacé par celui-ci ;
 *   - texte modifié dans le constructeur → jamais touché.
 * Ancien titre « Contacts » → « Nous contacter » (seulement s'il n'a pas été personnalisé).
 */

const text = (t: string) => ({ type: "text", text: t });
const p = (...c: object[]) => ({ type: "paragraph", content: c });

const DOC = {
  type: "doc",
  content: [
    p(text("Une question sur le club, les cours, les stages ou un partenariat ? Écrivez-nous ou appelez-nous : les coordonnées de l'association sont ci-dessous.")),
    p(text("Pour vous inscrire à un cours, voyez plutôt la page « S'inscrire » : les inscriptions se font auprès de la MJC de Chambéry.")),
  ],
};

/** Texte de départ précédent, tourné vers le formulaire (désormais réservé aux membres). */
const DOC_V1 = {
  type: "doc",
  content: [
    p(text("Une question sur les cours, les stages, l'inscription ou le site ? Écrivez-nous avec le formulaire ci-dessous.")),
    p(
      text("Choisissez le destinataire : « Gestion du club » pour la vie du club (cours, stages, licences…), « Support du site » pour un problème sur le site ou votre compte. Vous recevez aussitôt un accusé de réception avec la référence de votre demande, et une réponse dans les meilleurs délais."),
    ),
  ],
};

const contentOf = (doc: object) =>
  pageContentSchemaV1.parse({ version: 1, blocks: [{ id: "contacts-intro", type: "tiptap", content: doc }] });

export async function ensureContactsPage(db: PrismaClient): Promise<{ seeded: boolean; renamed: boolean }> {
  const existing = await db.sitePage.findUnique({ where: { slug: "contacts" }, select: { title: true, content: true } });
  const blocks = (existing?.content as { blocks?: unknown[] } | null)?.blocks;
  const needsSeed =
    !existing || !Array.isArray(blocks) || blocks.length === 0 || sameContent(existing.content, contentOf(DOC_V1));
  const needsRename = existing?.title === "Contacts";
  if (!needsSeed && !needsRename) return { seeded: false, renamed: false };
  const json = contentOf(DOC) as unknown as Prisma.InputJsonValue;
  await db.sitePage.upsert({
    where: { slug: "contacts" },
    create: { slug: "contacts", title: "Nous contacter", content: json },
    update: { ...(needsSeed ? { content: json } : {}), ...(needsRename ? { title: "Nous contacter" } : {}) },
  });
  return { seeded: needsSeed, renamed: needsRename };
}
