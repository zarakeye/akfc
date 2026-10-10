import type { JSX } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { telHref, whatsappHref, type SitePhone } from "@contracts/siteContact/siteContact.schema";

/**
 * Coordonnées publiques du club (Réglages du site → Coordonnées publiques) : e-mail, téléphones
 * (appel / WhatsApp), adresse. Rien n'est affiché pour un champ vide ; null si tout est vide.
 */
export type ClubContact = { email: string | null; phones: SitePhone[]; address: string | null };

const linkClass = "text-emerald-700 hover:underline dark:text-emerald-400";

export function ClubContactCard({ contact }: { contact: ClubContact }): JSX.Element | null {
  const addressLines = (contact.address ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!contact.email && contact.phones.length === 0 && addressLines.length === 0) return null;

  return (
    <section className="rounded-lg border border-border p-6" aria-labelledby="club-contact-title">
      <h2 id="club-contact-title" className="mb-4 text-lg font-semibold">
        Coordonnées de l&apos;association
      </h2>
      <ul className="flex list-none flex-col gap-4 p-0 text-sm">
        {contact.email && (
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <a href={`mailto:${contact.email}`} className={linkClass}>
              {contact.email}
            </a>
          </li>
        )}
        {contact.phones.map((p, i) => (
          <li key={`${p.number}-${i}`} className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex flex-col gap-1">
              {p.label && <span className="text-muted-foreground">{p.label}</span>}
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {p.call ? (
                  <a href={telHref(p.number)} className={linkClass}>
                    {p.number}
                  </a>
                ) : (
                  <span>{p.number}</span>
                )}
                {p.whatsapp && (
                  <a
                    href={whatsappHref(p.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp
                  </a>
                )}
              </span>
            </span>
          </li>
        ))}
        {addressLines.length > 0 && (
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <address className="not-italic">
              {addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </li>
        )}
      </ul>
    </section>
  );
}
