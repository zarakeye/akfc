import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { getLegalComplement, getLegalInfo } from "@features/legal/getLegalInfo";
import { LegalSection, Val, frenchDate } from "@features/legal/LegalBits";

/**
 * Mentions légales (art. 1-1 LCEN), GÉNÉRÉES depuis Réglages du site → Informations légales et
 * Coordonnées publiques : une donnée corrigée dans les réglages l'est ici aussitôt. Une valeur
 * absente s'affiche « en cours de renseignement ». Compléments libres éventuels : SitePage
 * « mentions-legales », rédigée dans le constructeur, affichée à la suite.
 * Route statique : prend le pas sur /infos/[slug].
 */
export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/infos/mentions-legales" },
};
export const dynamic = "force-dynamic";

export default async function MentionsLegalesPage(): Promise<JSX.Element> {
  const [info, complement] = await Promise.all([getLegalInfo(), getLegalComplement("mentions-legales")]);

  return (
    <div className="akfc-page py-12">
      <div className="akfc-measure-block">
        <h1 className="mb-2 text-2xl font-bold">Mentions légales</h1>
        {info.updatedAt && <p className="text-sm text-muted-foreground">Mise à jour le {frenchDate(info.updatedAt)}</p>}

        <LegalSection title="Éditeur du site">
          <p>
            Le site akfc.fr est édité par <strong><Val v={info.name} /></strong>, association régie par la loi du
            1er juillet 1901
            {info.rna ? <>, enregistrée au Répertoire national des associations sous le numéro {info.rna}</> : null}
            {info.siret ? <>, SIRET {info.siret}</> : null}.
          </p>
          <ul className="flex list-none flex-col gap-1 p-0">
            <li>Siège : {info.addressLines.length > 0 ? info.addressLines.join(", ") : <Val v={null} />}</li>
            <li>Téléphone : <Val v={info.phone} /></li>
            <li>
              E-mail : {info.email ? <a className="text-emerald-700 hover:underline dark:text-emerald-400" href={`mailto:${info.email}`}>{info.email}</a> : <Val v={null} />}
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Directeur de la publication">
          <p>
            <Val v={info.director} />
            {info.director && info.directorTitle ? `, ${info.directorTitle}` : null}.
          </p>
        </LegalSection>

        <LegalSection title="Hébergement">
          <p>Le site est hébergé sur un serveur loué par l&apos;association auprès de :</p>
          <p>
            <strong><Val v={info.host.name} /></strong>
            {info.host.address && <>, {info.host.address}</>}
            {info.host.phone && <> — téléphone : {info.host.phone}</>}
            {info.host.url && (
              <>
                {" "}—{" "}
                <a className="text-emerald-700 hover:underline dark:text-emerald-400" href={info.host.url} target="_blank" rel="noopener noreferrer">
                  {info.host.url.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
          </p>
          <p>Le nom de domaine et la messagerie sont fournis par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>
        </LegalSection>

        {info.credits && (
          <LegalSection title="Conception et réalisation">
            <p>{info.credits}</p>
          </LegalSection>
        )}

        <LegalSection title="Propriété intellectuelle">
          <p>
            Les textes, photographies, vidéos et le logo publiés sur ce site appartiennent à l&apos;association ou à
            leurs auteurs. Toute reproduction, même partielle, demande l&apos;accord préalable de l&apos;association.
          </p>
          <p>
            Les logos de la MJC de Chambéry et de la Fédération française de karaté et disciplines associées
            appartiennent à ces organismes ; ils figurent ici pour signaler le partenariat.
          </p>
        </LegalSection>

        <LegalSection title="Liens vers d'autres sites">
          <p>
            Le site renvoie vers des sites extérieurs (MJC de Chambéry et sa plateforme d&apos;inscription,
            fédération, WhatsApp…). L&apos;association n&apos;a aucun contrôle sur leur contenu et n&apos;en est pas
            responsable.
          </p>
        </LegalSection>

        <LegalSection title="Données personnelles et cookies">
          <p>
            L&apos;utilisation de vos données est décrite dans la{" "}
            <Link className="text-emerald-700 hover:underline dark:text-emerald-400" href="/infos/confidentialite">
              politique de confidentialité
            </Link>
            . Le site n&apos;utilise ni publicité ni mesure d&apos;audience.
          </p>
        </LegalSection>

        <LegalSection title="Signaler un contenu">
          <p>
            Pour signaler un contenu qui vous semble illicite ou qui vous concerne, écrivez à{" "}
            {info.email ? <a className="text-emerald-700 hover:underline dark:text-emerald-400" href={`mailto:${info.email}`}>{info.email}</a> : "l'association"}.
          </p>
        </LegalSection>
      </div>

      {complement.blocks.length > 0 && (
        <div className="mt-10">
          <PageRenderer content={complement} />
        </div>
      )}
    </div>
  );
}
