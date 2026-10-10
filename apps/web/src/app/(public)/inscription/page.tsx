import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { prisma } from "@backend/prisma";
import { isEditorialPageGated, UnderConstruction } from "@features/editorial/editorialGate";
import { parsePageContentV1 } from "@contracts/page";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { getActivePartners } from "@features/partners/getActivePartners";
import { PartnerLogo } from "@features/partners/PartnerLogo";
import { PARTNER_ROLE_LABEL } from "@features/partners/partnerUi";

/**
 * « S'inscrire » — `/inscription`.
 *
 * Page éditoriale (SitePage « inscription ») : son texte se rédige dans le constructeur (un texte
 * de départ y est créé au premier démarrage, voir ensureInscriptionPage). En dessous, les partenaires
 * et leurs liens utiles (Réglages du site) : inscription et tarifs sur le site de la MJC, fédération…
 */
export const metadata: Metadata = { title: "S'inscrire" };

export default async function InscriptionPage(): Promise<JSX.Element> {
  if (await isEditorialPageGated("inscription")) {
    return <UnderConstruction />;
  }
  const [page, partners] = await Promise.all([
    prisma.sitePage.findUnique({ where: { slug: "inscription" } }),
    getActivePartners(),
  ]);
  const content = parsePageContentV1(page?.content);

  return (
    <div className="akfc-page py-12">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "S'inscrire"}</h1>

      {/* Ce qui s'affiche est exactement le contenu du constructeur (texte de départ créé au
          premier démarrage, modifiable dans Pages éditoriales → S'inscrire). */}
      {content.blocks.length > 0 && <PageRenderer content={content} />}

      {partners.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold">Liens utiles</h2>
          <ul className="grid list-none gap-6 p-0 md:grid-cols-2">
            {partners.map((p) => (
              <li key={p.id} className="flex gap-4 rounded-lg border border-border p-5">
                <PartnerLogo name={p.name} logoUrl={p.logoUrl} websiteUrl={p.websiteUrl} size="lg" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{PARTNER_ROLE_LABEL[p.role]}</p>
                  <p className="font-semibold">{p.name}</p>
                  {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                  <ul className="mt-3 flex list-none flex-col gap-1.5 p-0 text-sm">
                    {p.links.map((l) => (
                      <li key={l.url}>
                        <ExternalAnchor href={l.url}>{l.label}</ExternalAnchor>
                      </li>
                    ))}
                    {p.websiteUrl && (
                      <li>
                        <ExternalAnchor href={p.websiteUrl}>Site de {p.name}</ExternalAnchor>
                      </li>
                    )}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ExternalAnchor({ href, children }: { href: string; children: React.ReactNode }): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-400">
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">(nouvel onglet)</span>
    </a>
  );
}
