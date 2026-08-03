import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";

import { NAV_ENTRIES } from "@features/app-shell/navEntries";
import { CLUB_INFO, FOOTER_LEGAL_LINKS } from "@features/app-shell/clubInfo";

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
 * Les blocs de coordonnées ne s'affichent que si `CLUB_INFO` les renseigne —
 * un footer à moitié vide vaut mieux qu'un footer à fausses valeurs, qu'on
 * oublie de corriger parce qu'il a l'air fini.
 *
 * Responsive : une colonne sur téléphone, deux sur tablette, quatre à partir
 * de `lg`. Les seuils suivent le moment où une colonne devient illisible,
 * pas une grille arbitraire.
 */
export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  // Navigation aplatie : les entrées d'un menu déroulant deviennent des
  // liens ordinaires — un footer ne se déroule pas. Les entrées réservées
  // aux personnes connectées sont écartées, et « Nos activités » est
  // remplacé par le lien vers la liste des disciplines, sa version statique.
  const navLinks: { href: string; label: string }[] = [
    { href: "/disciplines", label: "Nos disciplines" },
  ];
  for (const entry of NAV_ENTRIES) {
    if (entry.kind === "link" && !entry.requiresUser) {
      navLinks.push({ href: entry.href, label: entry.label });
    } else if (entry.kind === "menu") {
      for (const child of entry.children) navLinks.push(child);
    }
  }

  const socials = [
    { href: CLUB_INFO.social.facebook, Icon: Facebook, label: "Facebook" },
    { href: CLUB_INFO.social.instagram, Icon: Instagram, label: "Instagram" },
    { href: CLUB_INFO.social.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s) => s.href !== "");

  const hasContact =
    CLUB_INFO.address.length > 0 ||
    CLUB_INFO.phone !== "" ||
    CLUB_INFO.email !== "";

  return (
    <footer className="mt-16 bg-black text-white">
      <div className="akfc-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Identité ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex">
              <Image
                src="/AKFC_logo.svg"
                alt="AKFC"
                width={80}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
            {CLUB_INFO.tagline !== "" && (
              <p className="text-sm text-white/70">{CLUB_INFO.tagline}</p>
            )}
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
                {CLUB_INFO.address.length > 0 && (
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>
                      {CLUB_INFO.address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </li>
                )}
                {CLUB_INFO.phone !== "" && (
                  <li className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {/* `tel:` sans espaces : un numéro formaté pour l'œil
                        n'est pas composable par un téléphone. */}
                    <a
                      href={`tel:${CLUB_INFO.phone.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-emerald-400"
                    >
                      {CLUB_INFO.phone}
                    </a>
                  </li>
                )}
                {CLUB_INFO.email !== "" && (
                  <li className="flex gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <a
                      href={`mailto:${CLUB_INFO.email}`}
                      className="break-all transition-colors hover:text-emerald-400"
                    >
                      {CLUB_INFO.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* ── Horaires ────────────────────────────────────────────── */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
              Horaires
            </h2>
            {CLUB_INFO.hours.length > 0 ? (
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

      {/* ── Barre du bas ──────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="akfc-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {year} AKFC. Tous droits réservés.</p>

          {CLUB_INFO.legalMentions.length > 0 && (
            <p className="text-center">
              {CLUB_INFO.legalMentions.join(" · ")}
            </p>
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
