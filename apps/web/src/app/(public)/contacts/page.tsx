import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@backend/prisma";
import {
  isEditorialPageGated,
  UnderConstruction,
} from "@features/editorial/editorialGate";
import { parsePageContentV1 } from "@contracts/page";
import { parseSitePhones } from "@contracts/siteContact/siteContact.schema";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { ClubContactCard } from "@features/contact/ClubContactCard";
import { MemberContactSection } from "@features/contact/MemberContactSection";

/**
 * « Nous contacter » (URL /contacts).
 *
 * Page PUBLIQUE, pour le public et les partenaires :
 *   - le texte du constructeur (Pages éditoriales → Nous contacter) ;
 *   - les coordonnées de l'association (Réglages du site → Coordonnées publiques) : e-mail,
 *     téléphones (appel / WhatsApp), adresse ;
 *   - un renvoi vers « S'inscrire ».
 * Partie MEMBRES : le formulaire de demandes (bureau, support du site) n'apparaît qu'aux membres
 * connectés (et le serveur le refuse aux visiteurs).
 */
export const metadata: Metadata = { title: "Nous contacter" };

export default async function ContactsPage(): Promise<JSX.Element> {
  if (await isEditorialPageGated("contacts")) {
    return <UnderConstruction />;
  }

  const [page, settings] = await Promise.all([
    prisma.sitePage.findUnique({ where: { slug: "contacts" } }),
    prisma.siteSettings.findUnique({
      where: { id: "site" },
      select: { contactEmail: true, contactPhones: true, contactAddress: true },
    }),
  ]);
  const content = parsePageContentV1(page?.content);
  const contact = {
    email: settings?.contactEmail ?? null,
    phones: parseSitePhones(settings?.contactPhones),
    address: settings?.contactAddress ?? null,
  };

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "Nous contacter"}</h1>

      {/* Exactement le contenu du constructeur (texte de départ créé au démarrage, voir
          ensureContactsPage) ; coordonnées et formulaire des membres suivent, hors constructeur. */}
      {content.blocks.length > 0 && <PageRenderer content={content} />}

      <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
        <ClubContactCard contact={contact} />

        <Link
          href="/inscription"
          className="flex flex-col gap-2 rounded-lg border border-emerald-600/40 bg-emerald-50 p-6 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/30"
        >
          <span className="font-semibold">Vous souhaitez vous inscrire&nbsp;?</span>
          <span className="text-sm text-muted-foreground">
            Les cours ont lieu à la MJC de Chambéry : on s&apos;y inscrit en ligne ou à son accueil.
          </span>
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Comment s&apos;inscrire →</span>
        </Link>
      </div>

      <MemberContactSection />
    </div>
  );
}
