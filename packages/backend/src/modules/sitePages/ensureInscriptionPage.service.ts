import type { Prisma, PrismaClient } from "@prisma/client";

import { pageContentSchemaV1 } from "@contracts/page";

/*
 * Page éditoriale « S'inscrire » (SitePage « inscription ») : créée au premier démarrage avec un
 * texte de départ RÉEL (un bloc de texte), que les administrateurs modifient ensuite librement dans
 * le constructeur — ce qui s'affiche est exactement ce que montre l'éditeur. La page reste en
 * brouillon tant qu'on ne la publie pas (Pages éditoriales).
 *
 * Mise à jour du texte de départ : une page dont le contenu est encore EXACTEMENT une version
 * précédente du texte de départ (jamais retouchée) reçoit la nouvelle version ; une page modifiée
 * dans le constructeur n'est jamais touchée.
 */

const MJC_SITE = "https://www.mjc-chambery.com";
const GOASSO_ACTIVITES = "https://mjc-chambery.goasso.org/activites";
const GOASSO_INSCRIPTIONS = "https://mjc-chambery.goasso.org/actualites/inscriptions-et-adhesion";
const GOASSO_TUTORIEL = "https://mjc-chambery.goasso.org/pages/tutoriel-d-inscription";

const text = (t: string) => ({ type: "text", text: t });
const p = (...c: object[]) => ({ type: "paragraph", content: c });
const h = (t: string) => ({ type: "heading", attrs: { level: 3 }, content: [text(t)] });
const bold = (t: string) => ({ type: "text", text: t, marks: [{ type: "bold" }] });
const link = (t: string, href: string) => ({
  type: "text",
  text: t,
  marks: [{ type: "link", attrs: { href, target: "_blank", rel: "noopener noreferrer nofollow" } }],
});
const internal = (t: string, href: string) => ({
  type: "text",
  text: t,
  marks: [{ type: "link", attrs: { href, target: null, rel: null } }],
});

const DOC = {
  type: "doc",
  content: [
    h("1. Les cours ont lieu à la MJC"),
    p(text("Les cours et les stages du club sont des activités de la MJC de Chambéry, données dans ses locaux.")),
    h("2. L'inscription se fait auprès de la MJC : en ligne ou à l'accueil"),
    p(
      bold("En ligne"),
      text(", sur la plateforme d'inscription de la MJC : créez votre compte, choisissez votre cours dans "),
      link("la liste des activités", GOASSO_ACTIVITES),
      text(" (rubrique Arts martiaux), puis réglez en ligne une fois votre pré-inscription validée par la MJC. Le "),
      link("tutoriel d'inscription", GOASSO_TUTORIEL),
      text(" détaille chaque étape."),
    ),
    p(
      bold("À l'accueil"),
      text(" de la MJC, aux heures d'ouverture indiquées sur "),
      link("le site de la MJC", MJC_SITE),
      text("."),
    ),
    p(
      text("L'adhésion annuelle à la MJC est obligatoire. Tarifs et calendrier des inscriptions (certaines périodes sont réservées à l'accueil) : voir "),
      link("Inscriptions et adhésion", GOASSO_INSCRIPTIONS),
      text("."),
    ),
    h("3. La licence fédérale, en début de saison"),
    p(text("Le club est affilié à la Fédération Française de Karaté. En début de saison, les sifus proposent la licence à ceux qui le souhaitent.")),
    h("4. Une question ?"),
    p(text("Écrivez-nous depuis la page "), internal("Nous contacter", "/contacts"), text(" : nous vous répondons.")),
  ],
};

/** Texte de départ de la version précédente (sans liens) : remplacé tant qu'il n'a pas été retouché. */
const DOC_V1 = {
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

const contentOf = (doc: object) =>
  pageContentSchemaV1.parse({ version: 1, blocks: [{ id: "inscription-texte", type: "tiptap", content: doc }] });

/** Sérialisation à clés triées : le JSONB de Postgres ne conserve pas l'ordre des clés. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

export type InscriptionPageResult = "created" | "updated" | "unchanged";

/**
 * Crée la page avec son texte de départ ; la remplit si elle n'a AUCUN bloc ; la met à jour si
 * elle contient encore, sans retouche, l'ancien texte de départ.
 */
export async function ensureInscriptionPage(db: PrismaClient): Promise<InscriptionPageResult> {
  const existing = await db.sitePage.findUnique({ where: { slug: "inscription" }, select: { content: true } });
  const blocks = (existing?.content as { blocks?: unknown[] } | null)?.blocks;
  const empty = !existing || !Array.isArray(blocks) || blocks.length === 0;
  const pristineV1 = !empty && canonical(existing.content) === canonical(contentOf(DOC_V1));
  if (!empty && !pristineV1) return "unchanged";
  const json = contentOf(DOC) as unknown as Prisma.InputJsonValue;
  await db.sitePage.upsert({
    where: { slug: "inscription" },
    create: { slug: "inscription", title: "S'inscrire", content: json },
    update: { content: json },
  });
  return existing ? "updated" : "created";
}
