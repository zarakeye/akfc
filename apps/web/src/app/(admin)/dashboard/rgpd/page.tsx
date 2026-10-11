import type { JSX } from "react";
import type { Metadata } from "next";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { processingActivities, processors, SECURITY_MEASURES } from "@contracts/legal/processingRegister";
import { getLegalInfo } from "@features/legal/getLegalInfo";
import { frenchDate } from "@features/legal/LegalBits";
import { PrintButton } from "@features/legal/PrintButton";
import { listInactiveAccounts } from "@backend/modules/privacy/retention.service";
import Link from "next/link";

/**
 * Registre des activités de traitement (art. 30 RGPD) — réservé aux administrateurs.
 * GÉNÉRÉ depuis la même description que la politique de confidentialité
 * (@contracts/legal/processingRegister) et depuis les Réglages du site. Document interne : à
 * présenter à la CNIL si elle le demande. Imprimable (le reste de l'écran est masqué à l'impression).
 */
export const metadata: Metadata = { title: "Registre des traitements" };
export const dynamic = "force-dynamic";

const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  #registre, #registre * { visibility: visible !important; }
  #registre { position: absolute; inset: 0 auto auto 0; width: 100%; }
  .registre-noprint { display: none !important; }
}`;

export default async function RegisterPage(): Promise<JSX.Element> {
  const session = await getSessionFromRequest();
  if (!session?.user || !(await isAdminByGroup(prisma, session.user.id))) {
    return <p className="p-6 text-sm text-gray-600">Réservé aux administrateurs.</p>;
  }
  const [info, inactive] = await Promise.all([getLegalInfo(), listInactiveAccounts(prisma)]);
  const activities = processingActivities(info);
  const provs = processors(info);
  const byName = new Map(provs.map((p) => [p.name, p]));
  const responsible = info.name ?? "(dénomination à renseigner dans Réglages du site)";

  return (
    <div id="registre" className="mx-auto max-w-4xl p-6 text-sm">
      <style>{PRINT_CSS}</style>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Registre des activités de traitement</h1>
          <p className="mt-1 text-gray-600">Article 30 du RGPD — état au {frenchDate(new Date())}</p>
        </div>
        <PrintButton />
      </div>

      {/* Hors registre (non imprimé) : comptes à examiner au regard de la durée de conservation. */}
      <section className="registre-noprint mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <h2 className="mb-1 font-semibold">Comptes à examiner ({inactive.accounts.length})</h2>
        <p className="text-gray-700">
          Sans connexion depuis plus de {inactive.months} mois (réglage « Comptes des anciens membres »). Si la
          personne n&apos;est plus adhérente, supprimez son compte depuis Utilisateurs ; sinon, rien à faire. Les
          demandes closes, sessions et liens périmés sont, eux, purgés automatiquement chaque nuit.
        </p>
        {inactive.accounts.length > 0 && (
          <ul className="mt-3 flex list-none flex-col gap-1 p-0">
            {inactive.accounts.map((a) => (
              <li key={a.id}>
                <Link href={`/dashboard/users/${a.id}`} className="text-emerald-700 hover:underline">
                  {a.name}
                </Link>{" "}
                <span className="text-gray-500">
                  — {a.email} — {a.lastLoginAt ? `dernière connexion le ${frenchDate(a.lastLoginAt)}` : `jamais connecté (compte créé le ${frenchDate(a.createdAt)})`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold">Responsable du traitement</h2>
        <p>
          {responsible}
          {info.rna ? ` (RNA ${info.rna})` : ""}
          {info.addressLines.length > 0 ? ` — ${info.addressLines.join(", ")}` : ""}
        </p>
        <p>
          Représentant : {info.director ?? "(à renseigner)"}
          {info.director && info.directorTitle ? `, ${info.directorTitle}` : ""} — contact : {info.email ?? "(à renseigner)"}
        </p>
        <p className="mt-1 text-gray-600">Pas de délégué à la protection des données (non obligatoire pour l&apos;association).</p>
      </section>

      <p className="registre-noprint mt-4 text-gray-600">
        Ce registre est tenu à jour automatiquement : il reprend la politique de confidentialité et les réglages
        (identité, durées de conservation, région de stockage). Il est à présenter à la CNIL en cas de contrôle.
      </p>

      {activities.map((a, i) => (
        <section key={a.id} className="mt-6 break-inside-avoid rounded-lg border border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">
            {i + 1}. {a.name}
          </h2>
          <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[12rem_1fr]">
            <dt className="text-gray-500">Finalité</dt>
            <dd>{a.purpose}</dd>
            <dt className="text-gray-500">Personnes concernées</dt>
            <dd>{a.people}</dd>
            <dt className="text-gray-500">Données</dt>
            <dd>{a.data}</dd>
            <dt className="text-gray-500">Base légale</dt>
            <dd>{a.legalBasis}</dd>
            <dt className="text-gray-500">Destinataires internes</dt>
            <dd>{a.recipients}</dd>
            <dt className="text-gray-500">Sous-traitants</dt>
            <dd>{a.processors.map((n) => `${n} (${byName.get(n)?.location ?? "?"})`).join(" ; ")}</dd>
            <dt className="text-gray-500">Transferts hors UE</dt>
            <dd>
              {a.processors.map((n) => byName.get(n)).filter((p) => p?.transfer).map((p) => `${p!.name} : ${p!.transfer}`).join(" ; ") || "Aucun"}
            </dd>
            <dt className="text-gray-500">Durée de conservation</dt>
            <dd>{a.retention}</dd>
          </dl>
        </section>
      ))}

      <section className="mt-6 break-inside-avoid rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold">Mesures de sécurité (tous traitements)</h2>
        <ul className="list-disc pl-5">
          {SECURITY_MEASURES.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 break-inside-avoid rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold">Procédures</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Demandes d&apos;exercice des droits</strong> (accès, rectification, effacement, opposition,
            portabilité) : reçues à {info.email ?? "l'adresse de contact"} ; réponse sous un mois. Un membre peut
            télécharger lui-même ses données depuis son profil.
          </li>
          <li>
            <strong>Violation de données</strong> (piratage, perte, envoi à la mauvaise personne) : notifier la CNIL
            sous 72 heures sur notifications.cnil.fr, prévenir les personnes concernées si le risque est élevé, et
            consigner l&apos;incident (date, nature, conséquences, mesures prises) même sans notification.
          </li>
          <li>
            <strong>Contrats de sous-traitance</strong> : intégrés aux conditions d&apos;OVH, de Cloudinary et de
            Cloudflare ; chez Hetzner, à accepter depuis l&apos;espace client.
          </li>
        </ul>
      </section>
    </div>
  );
}
