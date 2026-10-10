import type { Prisma, PrismaClient } from "@prisma/client";

import { pageContentSchemaV1 } from "@contracts/page";

/*
 * Page éditoriale « S'inscrire » (SitePage « inscription ») : créée au premier démarrage avec un
 * texte de départ RÉEL (un bloc de texte), que les administrateurs modifient ensuite librement dans
 * le constructeur — ce qui s'affiche est exactement ce que montre l'éditeur. Jamais réécrite
 * ensuite. La page reste en brouillon tant qu'on ne la publie pas (Pages éditoriales).
 */

const text = (t: string) => ({ type: "text", text: t });
const p = (...c: object[]) => ({ type: "paragraph", content: c });
const h = (t: string) => ({ type: "heading", attrs: { level: 3 }, content: [text(t)] });
const bold = (t: string) => ({ type: "text", text: t, marks: [{ type: "bold" }] });

const DOC = {
  type: "doc",
  content: [
    h("1. Les cours ont lieu à la MJC"),
    p(text("Les cours et les stages du club sont des activités de la MJC de Chambéry, données dans ses locaux.")),
    h("2. L'inscription se fait auprès de la MJC"),
    p(
      bold("En ligne"),
      text(" sur la plateforme de la MJC (création d'un compte, pré-inscription à l'activité, puis paiement en ligne une fois la demande validée), ou "),
      bold("à l'accueil"),
      text(" de la MJC."),
    ),
    p(
      text("L'adhésion annuelle à la MJC est obligatoire. Horaires, tarifs et calendrier des inscriptions (certaines périodes sont réservées à l'accueil) sont publiés par la MJC : voir les liens ci-dessous."),
    ),
    h("3. La licence fédérale, en début de saison"),
    p(text("Le club est affilié à la Fédération Française de Karaté. En début de saison, les sifus proposent la licence à ceux qui le souhaitent.")),
    h("4. Une question ?"),
    p(text("Écrivez-nous depuis la page Contacts : nous vous répondons.")),
  ],
};

/** Crée la page avec son texte de départ ; la remplit aussi si elle existe mais n'a AUCUN bloc. */
export async function ensureInscriptionPage(db: PrismaClient): Promise<boolean> {
  const existing = await db.sitePage.findUnique({ where: { slug: "inscription" }, select: { content: true } });
  const blocks = (existing?.content as { blocks?: unknown[] } | null)?.blocks;
  if (existing && Array.isArray(blocks) && blocks.length > 0) return false;
  const content = pageContentSchemaV1.parse({ version: 1, blocks: [{ id: "inscription-texte", type: "tiptap", content: DOC }] });
  const json = content as unknown as Prisma.InputJsonValue;
  await db.sitePage.upsert({
    where: { slug: "inscription" },
    create: { slug: "inscription", title: "S'inscrire", content: json },
    update: { content: json },
  });
  return true;
}
