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
 * Page éditoriale (SitePage « inscription », rédigée au centre de contrôle) : tant qu'elle n'est
 * pas rédigée, un texte par défaut décrit le parcours (cours à la MJC, inscription et paiement à
 * son accueil, licence FFK proposée par les sifus). En dessous, les partenaires et leurs liens
 * utiles (Réglages du site) : inscription et tarifs sur le site de la MJC, site de la fédération…
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
  const host = partners.find((p) => p.role === "HOST");
  const federation = partners.find((p) => p.role === "FEDERATION");

  return (
    <div className="akfc-page py-12">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "S'inscrire"}</h1>

      {content.blocks.length > 0 ? (
        <PageRenderer content={content} />
      ) : (
        <ol className="akfc-measure-block flex list-none flex-col gap-6 p-0">
          <Step n={1} title="Les cours ont lieu à la MJC">
            Les cours et les stages du club sont des activités de {host?.name ?? "la MJC de Chambéry"}, données
            dans ses locaux.
          </Step>
          <Step n={2} title="L'inscription se fait auprès de la MJC">
            En ligne sur la plateforme de la MJC (création d&apos;un compte, pré-inscription à l&apos;activité, puis
            paiement en ligne une fois la demande validée par la MJC) ou directement à son accueil. L&apos;adhésion
            annuelle à la MJC est obligatoire. Horaires, tarifs et calendrier des inscriptions (certaines périodes sont
            réservées à l&apos;accueil) sont publiés par la MJC{host && host.links.length > 0 ? " : voir les liens ci-dessous" : ""}.
          </Step>
          <Step n={3} title="La licence fédérale, en début de saison">
            Le club est affilié à {federation?.name ?? "la Fédération Française de Karaté"}. En début de saison, les
            sifus proposent la licence à ceux qui le souhaitent.
          </Step>
          <Step n={4} title="Une question ?">
            Écrivez-nous depuis la page <Link href="/contacts" className="text-emerald-700 hover:underline">Contacts</Link> :
            nous vous répondons.
          </Step>
        </ol>
      )}

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

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-muted-foreground">{children}</p>
      </div>
    </li>
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
