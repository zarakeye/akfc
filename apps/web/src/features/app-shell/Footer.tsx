import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";

import { NAV_ENTRIES } from "@features/app-shell/navEntries";
import { CLUB_INFO, FOOTER_LEGAL_LINKS } from "@features/app-shell/clubInfo";
import { parseSitePhones, telHref } from "@contracts/siteContact/siteContact.schema";
import { buildFooterSchedule } from "@features/app-shell/buildFooterSchedule";
import { prisma } from "@backend/prisma";
import { getActivePartners } from "@features/partners/getActivePartners";
import { PartnerLogo } from "@features/partners/PartnerLogo";
import { PARTNER_ROLE_LABEL } from "@features/partners/partnerUi";

/**
 * Pied de page du site public.
 *
 * Composant SERVEUR : il n'a aucune interactivité, et l'année du copyright
 * se calcule au rendu. Rien à envoyer au navigateur.
 *
 * La colonne de navigation lit `NAV_ENTRIES`, la même source que la barre et
 * le panneau burger : ajouter une page au site la fera apparaître aux trois
 * endroits sans y penser.
 *
 * L'accroche, les coordonnées et les numéros RNA / SIRET viennent des Réglages du
 * site (SiteSettings), la même source que la page « Nous contacter » et les
 * mentions légales. Chaque bloc ne s'affiche que s'il est renseigné — un footer
 * à moitié vide vaut mieux qu'un footer à fausses valeurs, qu'on oublie de
 * corriger parce qu'il a l'air fini.
 *
 * Responsive : une colonne sur téléphone, deux sur tablette, quatre à partir
 * de `lg`. Les seuils suivent le moment où une colonne devient illisible,
 * pas une grille arbitraire.
 */
export default async function Footer(): Promise<JSX.Element> {
  // Créneaux des disciplines PUBLIÉES pour la colonne « Horaires ». Le footer est rendu
  // sur TOUTES les pages : une erreur ici ne doit jamais casser le site → repli statique.
  const now = new Date();
  const schedule = buildFooterSchedule(
    await prisma.course
      .findMany({
        where: { discipline: { publicationDate: { not: null, lte: now } } },
        select: {
          day: true,
          beginTime: true,
          endTime: true,
          audience: true,
          discipline: { select: { id: true, name: true, slug: true } },
        },
      })
      .catch(() => []),
  );
  const settings = await prisma.siteSettings
    .findUnique({
      where: { id: "site" },
      select: {
        logoKey: true,
        updatedAt: true,
        shortTitle: true,
        tagline: true,
        contactEmail: true,
        contactPhones: true,
        contactAddress: true,
        legalRna: true,
        legalSiret: true,
      },
    })
    .catch(() => null);
  const tagline = settings?.tagline?.trim() ?? "";
  const address = (settings?.contactAddress ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  // Seuls les numéros joignables en appel : le pied de page propose un lien `tel:`.
  const phones = parseSitePhones(settings?.contactPhones).filter((p) => p.call);
  const email = settings?.contactEmail?.trim() ?? "";
  const legalMentions = [
    settings?.legalRna ? `RNA ${settings.legalRna}` : null,
    settings?.legalSiret ? `SIRET ${settings.legalSiret}` : null,
  ].filter((m): m is string => m !== null);
  const logoSrc = settings?.logoKey
    ? `/api/media/site-logo?v=${settings.updatedAt.getTime()}`
    : "/AKFC_logo.svg";


  const partners = await getActivePartners();
  const year = new Date().getFullYear();

  // Navigation aplatie : les entrées d'un menu déroulant deviennent des
  // liens ordinaires — un footer ne se déroule pas. Les entrées réservées
  // aux personnes connectées sont écartées. « Nos disciplines » est rendu à
  // part, en tête : intitulé sans lien + une ligne par discipline.
  const navLinks: { href: string; label: string }[] = [];
  for (const entry of NAV_ENTRIES) {
    if (entry.kind === "link" && !entry.requiresUser) {
      navLinks.push({ href: entry.href, label: entry.label });
    } else if (entry.kind === "menu") {
      for (const child of entry.children) navLinks.push(child);
    }
  }
  // Hors barre de navigation (choix éditorial) mais toujours trouvable depuis le pied de page.
  navLinks.push({ href: "/inscription", label: "S'inscrire" });

  const socials = [
    { href: CLUB_INFO.social.facebook, Icon: Facebook, label: "Facebook" },
    { href: CLUB_INFO.social.instagram, Icon: Instagram, label: "Instagram" },
    { href: CLUB_INFO.social.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s) => s.href !== "");

  const hasContact = address.length > 0 || phones.length > 0 || email !== "";

  return (
    <footer className="mt-16 bg-black text-white">
      <div className="akfc-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Identité ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex">
              {settings?.logoKey ? (
                // logo custom (URL dynamique R2, hors pipeline next/image)
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt={settings?.shortTitle ?? "AKFC"} className="h-16 w-auto" />
              ) : (
                <Image
                  src="/AKFC_logo.svg"
                  alt={settings?.shortTitle ?? "AKFC"}
                  width={80}
                  height={80}
                  className="h-16 w-auto"
                />
              )}
            </Link>
            {tagline !== "" && <p className="text-sm text-white/70">{tagline}</p>}
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="rounded-md border border-white/20 p-2 text-white/80 transition-colors hover:border-emerald-500 hover:text-emerald-400"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Navigation ──────────────────────────────────────────── */}
          <nav aria-label="Pied de page">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
              Le site
            </h2>
            <ul className="flex flex-col gap-2">
              {/* Bloc désactivé. Pour le réactiver, rétablir la requête `disciplines` retirée du haut du composant (voir l'historique git de ce fichier). */}
              {/* {disciplines.length > 0 && (
                <li>
                  <span className="text-sm font-bold text-white">Nos disciplines</span>
                  <ul className="mt-1 flex flex-col gap-1 pl-3">
                    {disciplines.map((d) => (
                      <li key={d.id}>
                        <Link
                          href={`/disciplines/${d.slug}`}
                          className="text-sm text-white/80 transition-colors hover:text-emerald-400"
                        >
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )} */}
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Coordonnées ─────────────────────────────────────────── */}
          {hasContact && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
                Nous trouver
              </h2>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                {address.length > 0 && (
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>
                      {address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </li>
                )}
                {phones.map((phone) => (
                  <li key={phone.number} className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {/* `telHref` compose le numéro au format international : un
                        numéro formaté pour l'œil n'est pas composable tel quel. */}
                    <a href={telHref(phone.number)} className="transition-colors hover:text-emerald-400">
                      {phone.label ? `${phone.label} : ` : ""}
                      {phone.number}
                    </a>
                  </li>
                ))}
                {email !== "" && (
                  <li className="flex gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <a
                      href={`mailto:${email}`}
                      className="break-all transition-colors hover:text-emerald-400"
                    >
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* ── Horaires ────────────────────────────────────────────── */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
              Horaires des cours
            </h2>
            {schedule.length > 0 ? (
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                {schedule.map((g) => (
                  <li key={g.id}>
                    {g.slug ? (
                      <Link
                        href={`/disciplines/${g.slug}`}
                        className="font-bold text-white transition-colors hover:text-emerald-300"
                      >
                        {g.name}
                      </Link>
                    ) : (
                      <span className="font-bold text-white">{g.name}</span>
                    )}
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 pl-3">
                      {g.days.map((d) => (
                        <div key={d.day} className="contents">
                          <dt>{d.label} :</dt>
                          <dd>{d.slots}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            ) : CLUB_INFO.hours.length > 0 ? (
              <ul className="flex flex-col gap-2 text-sm text-white/80">
                {CLUB_INFO.hours.map((line) => (
                  <li key={line} className="flex gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/60">
                Les créneaux de chaque discipline figurent sur sa page.
              </p>
            )}
            <Link
              href="/agenda"
              className="mt-4 inline-block text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Voir l&apos;agenda →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Partenaires (MJC, fédération…) — Réglages du site ─────────── */}
      {partners.length > 0 && (
        <div className="border-t border-white/10">
          <div className="akfc-page flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-center sm:gap-10">
            {partners.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-2 text-center">
                <PartnerLogo name={p.name} logoUrl={p.logoUrl} websiteUrl={p.websiteUrl} />
                <span className="text-xs text-white/60">{PARTNER_ROLE_LABEL[p.role]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Barre du bas ──────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="akfc-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {year} {settings?.shortTitle ?? "AKFC"}. Tous droits réservés.</p>

          {legalMentions.length > 0 && (
            <p className="text-center">{legalMentions.join(" · ")}</p>
          )}

          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-emerald-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
