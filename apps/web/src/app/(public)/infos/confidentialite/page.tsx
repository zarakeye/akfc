import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { getLegalComplement, getLegalInfo } from "@features/legal/getLegalInfo";
import { LegalSection, Val, frenchDate } from "@features/legal/LegalBits";
import { processingActivities, processors, SECURITY_MEASURES } from "@contracts/legal/processingRegister";

/**
 * Politique de confidentialité (art. 13 RGPD), GÉNÉRÉE : identité du responsable depuis les
 * Réglages du site, traitements depuis @contracts/legal/processingRegister (même source que le
 * registre des traitements), durées depuis les réglages. Compléments libres éventuels : SitePage
 * « confidentialite », rédigée dans le constructeur, affichée à la suite.
 * Route statique : prend le pas sur /infos/[slug].
 */
export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/infos/confidentialite" },
};
export const dynamic = "force-dynamic";

const link = "text-emerald-700 hover:underline dark:text-emerald-400";

export default async function ConfidentialitePage(): Promise<JSX.Element> {
  const [info, complement] = await Promise.all([getLegalInfo(), getLegalComplement("confidentialite")]);
  const activities = processingActivities(info);
  const provs = processors(info);
  const mail = info.email ? <a className={link} href={`mailto:${info.email}`}>{info.email}</a> : <Val v={null} />;

  return (
    <div className="akfc-page py-12">
      <div className="akfc-measure-block">
        <h1 className="mb-2 text-2xl font-bold">Politique de confidentialité</h1>
        {info.updatedAt && <p className="text-sm text-muted-foreground">Mise à jour le {frenchDate(info.updatedAt)}</p>}

        <LegalSection title="Qui est responsable de vos données">
          <p>
            <strong><Val v={info.name} /></strong>
            {info.addressLines.length > 0 && <>, dont le siège est {info.addressLines.join(", ")}</>}, représentée
            par {info.director ? <>{info.director}{info.directorTitle ? `, ${info.directorTitle}` : ""}</> : <>son président ou sa présidente</>}.
            Pour toute question : {mail}.
          </p>
          <p>L&apos;association ne vend ni ne cède jamais vos données, et n&apos;en fait aucun usage commercial.</p>
        </LegalSection>

        <LegalSection title="Quelles données, pour quoi faire">
          <ul className="flex list-none flex-col gap-4 p-0">
            {activities.map((a) => (
              <li key={a.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{a.name}</p>
                <p className="mt-1">{a.purpose}</p>
                <dl className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-[9rem_1fr]">
                  <dt className="text-muted-foreground">Données</dt>
                  <dd>{a.data}</dd>
                  <dt className="text-muted-foreground">Fondement</dt>
                  <dd>{a.legalBasis}</dd>
                  <dt className="text-muted-foreground">Qui y accède</dt>
                  <dd>{a.recipients}</dd>
                  <dt className="text-muted-foreground">Conservation</dt>
                  <dd>{a.retention}</dd>
                </dl>
              </li>
            ))}
          </ul>
        </LegalSection>

        <LegalSection title="Nos prestataires">
          <p>Ils traitent les données uniquement pour le compte de l&apos;association, selon ses instructions.</p>
          <ul className="flex list-none flex-col gap-2 p-0">
            {provs.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong> — {p.role} ({p.location}).
                {p.transfer && <span className="text-muted-foreground"> {p.transfer}, reconnu par la Commission européenne.</span>}
              </li>
            ))}
          </ul>
        </LegalSection>

        <LegalSection title="Sécurité">
          <ul className="list-disc pl-5">
            {SECURITY_MEASURES.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </LegalSection>

        <LegalSection title="Cookies">
          <p>
            Le site dépose un seul cookie, <code>__session</code>, quand vous vous connectez. Il sert uniquement à vous
            garder connecté et dure 7 jours au plus. Quelques préférences d&apos;affichage sont aussi gardées dans votre
            navigateur.
          </p>
          <p>
            Ces traceurs sont strictement nécessaires au fonctionnement du site et ne demandent donc pas votre
            consentement. Le site n&apos;utilise ni publicité, ni mesure d&apos;audience, ni réseau social intégré.
          </p>
        </LegalSection>

        <LegalSection title="Vos droits">
          <p>
            Vous pouvez accéder à vos données, les faire corriger ou effacer, vous opposer à leur utilisation, en
            demander la limitation ou une copie, et retirer à tout moment une autorisation donnée (une photo, par
            exemple). Vous pouvez aussi indiquer ce que deviennent vos données après votre décès.
          </p>
          <p>
            Écrivez à {mail}, ou par courrier au siège de l&apos;association. Nous répondons dans un délai d&apos;un
            mois. Si la réponse ne vous satisfait pas, vous pouvez saisir la{" "}
            <a className={link} href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
              CNIL
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="Mineurs">
          <p>
            Le compte et les photos d&apos;un mineur sont créés et publiés avec l&apos;accord de ses parents, qui
            exercent ses droits pour lui.
          </p>
        </LegalSection>

        <p className="mt-8 text-sm text-muted-foreground">
          Voir aussi les{" "}
          <Link className={link} href="/infos/mentions-legales">
            mentions légales
          </Link>
          .
        </p>
      </div>

      {complement.blocks.length > 0 && (
        <div className="mt-10">
          <PageRenderer content={complement} />
        </div>
      )}
    </div>
  );
}
