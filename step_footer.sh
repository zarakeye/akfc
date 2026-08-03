#!/usr/bin/env bash
#
# step_footer.sh
#
# Un pied de page, et deux liens morts réparés au passage.
#
# ─── Ce que j'ai trouvé en cherchant où brancher le footer ─────────────────
#
# `/contacts` N'EXISTE PAS. La navbar y renvoie, l'appel à l'action de
# l'accueil aussi : les deux tombent en 404 aujourd'hui. Un footer qui aurait
# ajouté un troisième lien vers la même page absente n'aurait rien arrangé,
# donc la page est créée ici.
#
# Elle s'appuie sur `SitePage`, comme « L'association » : tu la rédiges au
# centre de contrôle, à `/dashboard/site-pages/contacts`, sans une ligne de
# code de plus.
#
# ─── Les mentions légales, sans page morte ─────────────────────────────────
#
# Tout footer en porte, et ce sont des obligations réelles pour un site
# associatif. Plutôt que de coder deux pages figées, une route générique
# `/infos/[slug]` sert n'importe quelle page de contenu : les mentions
# légales et la politique de confidentialité deviennent deux `SitePage`
# rédigeables au centre de contrôle.
#
# Tant qu'elles ne le sont pas, elles s'affichent en annonçant qu'elles ne
# sont pas encore rédigées — jamais un 404. Le socle `SitePage` était fait
# pour ça ; il ne lui manquait qu'une route publique générique.
#
# ─── Aucune coordonnée inventée ────────────────────────────────────────────
#
# Adresse, téléphone, courriel, horaires et réseaux vivent dans
# `clubInfo.ts`, VIDES. Chaque bloc du footer ne s'affiche que si sa valeur
# est renseignée.
#
# Je n'invente pas de fausses coordonnées « à remplacer » : elles finissent
# toujours par passer en production. Un footer sans adresse est visiblement
# incomplet ; un footer avec une fausse adresse ne l'est pas, et c'est bien
# pire.
#
# ─── La navigation vient de sa source ──────────────────────────────────────
#
# Le footer lit `NAV_ENTRIES`, comme la barre et le panneau burger. Ajouter
# une page au site la fera apparaître aux trois endroits sans y penser.
# Les entrées réservées aux personnes connectées en sont écartées.
#
# ─── Responsive ────────────────────────────────────────────────────────────
#
# Une colonne sur téléphone, deux sur tablette, quatre à partir de `lg`. La
# barre du bas passe en colonne centrée sous `sm`. Aucun seuil arbitraire :
# ce sont les colonnes qui deviennent illisibles en dessous.
#
# Usage :
#   bash step_footer.sh
#   AKFC_APPLY_ONLY=1 bash step_footer.sh
#
set -euo pipefail

club_info="apps/web/src/features/app-shell/clubInfo.ts"
footer_file="apps/web/src/features/app-shell/Footer.tsx"
infos_route="apps/web/src/app/(public)/infos/[slug]/page.tsx"
contacts_page="apps/web/src/app/(public)/contacts/page.tsx"
public_layout="apps/web/src/app/(public)/layout.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "Footer" "$public_layout" 2>/dev/null; then
  echo "✓ déjà appliqué (footer monté) — rien à faire"
  exit 0
fi

[ -f "$public_layout" ] || { echo "✗ introuvable : $public_layout"; exit 1; }
grep -q "model SitePage" prisma/schema.prisma || {
  echo "✗ le socle SitePage doit être appliqué d'abord"; exit 1; }

mkdir -p "$(dirname "$infos_route")" "$(dirname "$contacts_page")"

# ─────────────────────────────────────────────────────────────────────────
#  1 — Coordonnées du club
# ─────────────────────────────────────────────────────────────────────────

cat > "$club_info" <<'TS'
/**
 * Coordonnées du club, affichées dans le pied de page.
 *
 * TOUT EST VIDE À DESSEIN. Chaque bloc du footer ne s'affiche que si sa
 * valeur est renseignée, donc remplir se fait au fil de l'eau sans rien
 * casser.
 *
 * Je n'ai pas mis de fausses valeurs « à remplacer » : ce genre de
 * remplissage finit par passer en production. Un footer sans adresse est
 * visiblement incomplet, et quelqu'un le corrige ; un footer avec une
 * adresse plausible mais fausse ne l'est pas, et personne ne le voit.
 */
export interface ClubInfo {
  /** Une phrase de présentation, sous le logo. */
  tagline: string;
  /** Adresse postale, une ligne par élément. */
  address: string[];
  phone: string;
  email: string;
  /** Créneaux d'ouverture ou d'entraînement, une ligne par élément. */
  hours: string[];
  /** Réseaux sociaux. Seuls ceux dont l'URL est renseignée s'affichent. */
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  /** Numéro RNA ou SIRET, mentions administratives. */
  legalMentions: string[];
}

export const CLUB_INFO: ClubInfo = {
  tagline: "",
  address: [],
  phone: "",
  email: "",
  hours: [],
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },
  legalMentions: [],
};

/**
 * Pages légales du pied de page.
 *
 * Servies par la route générique `/infos/[slug]`, adossée à `SitePage` : tu
 * les rédiges au centre de contrôle (`/dashboard/site-pages/<slug>`) sans
 * ligne de code. Tant qu'elles ne le sont pas, elles s'affichent en
 * annonçant qu'elles ne sont pas encore rédigées — jamais un 404.
 */
export const FOOTER_LEGAL_LINKS = [
  { href: "/infos/mentions-legales", label: "Mentions légales" },
  { href: "/infos/confidentialite", label: "Politique de confidentialité" },
] as const;
TS
echo "  + clubInfo.ts"

# ─────────────────────────────────────────────────────────────────────────
#  2 — Le footer
# ─────────────────────────────────────────────────────────────────────────

cat > "$footer_file" <<'TSX'
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
TSX
echo "  + Footer.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  3 — Route générique des pages d'information
# ─────────────────────────────────────────────────────────────────────────

cat > "$infos_route" <<'TSX'
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { parsePageContentV1 } from "@contracts/page";

import { PageRenderer } from "@features/page-builder/PageRenderer";

/**
 * Route publique GÉNÉRIQUE des pages de contenu.
 *
 * Sert n'importe quelle `SitePage` par son slug : mentions légales,
 * politique de confidentialité, règlement intérieur… Le socle était déjà
 * générique, il ne lui manquait qu'une porte d'entrée publique.
 *
 * `/about` garde sa route en dur : cette adresse-là fait partie de la
 * vitrine et mérite son URL propre. Une page légale, non — `/infos/…` lui
 * convient très bien.
 *
 * Une page non rédigée s'affiche et le dit, plutôt que de rendre un 404 : le
 * pied de page y renvoie en permanence, et un lien de navigation qui tombe
 * sur une erreur est bien pire qu'une page qui s'annonce vide.
 */
export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const page = await prisma.sitePage.findUnique({ where: { slug } });
  const content = parsePageContentV1(page?.content);

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "Information"}</h1>

      {content.blocks.length > 0 ? (
        <PageRenderer content={content} />
      ) : (
        <p className="akfc-measure-block text-muted-foreground">
          Cette page n&apos;a pas encore été rédigée.
        </p>
      )}
    </div>
  );
}
TSX
echo "  + (public)/infos/[slug]/page.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  4 — La page contacts, qui n'existait pas
# ─────────────────────────────────────────────────────────────────────────

cat > "$contacts_page" <<'TSX'
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { parsePageContentV1 } from "@contracts/page";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { CLUB_INFO } from "@features/app-shell/clubInfo";

/**
 * « Contacts ».
 *
 * Cette page N'EXISTAIT PAS, alors que la navbar et l'appel à l'action de
 * l'accueil y renvoyaient tous deux : les deux liens tombaient en 404.
 *
 * Adossée à `SitePage` comme « L'association », elle se rédige au centre de
 * contrôle (`/dashboard/site-pages/contacts`) sans ligne de code. Les
 * coordonnées de `clubInfo` s'affichent en complément dès qu'elles sont
 * renseignées, pour que la page dise déjà quelque chose avant d'être écrite.
 */
export default async function ContactsPage(): Promise<JSX.Element> {
  const page = await prisma.sitePage.findUnique({
    where: { slug: "contacts" },
  });
  const content = parsePageContentV1(page?.content);

  const hasInfo =
    CLUB_INFO.address.length > 0 ||
    CLUB_INFO.phone !== "" ||
    CLUB_INFO.email !== "";

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "Contacts"}</h1>

      {content.blocks.length > 0 ? (
        <PageRenderer content={content} />
      ) : (
        !hasInfo && (
          <p className="akfc-measure-block text-muted-foreground">
            Cette page n&apos;a pas encore été rédigée.
          </p>
        )
      )}

      {hasInfo && (
        <div className="akfc-measure-block mt-8 rounded-lg border border-border p-6">
          <h2 className="mb-4 text-lg font-semibold">Coordonnées</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {CLUB_INFO.address.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {CLUB_INFO.phone !== "" && (
              <li>
                <a
                  href={`tel:${CLUB_INFO.phone.replace(/\s/g, "")}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CLUB_INFO.phone}
                </a>
              </li>
            )}
            {CLUB_INFO.email !== "" && (
              <li>
                <a
                  href={`mailto:${CLUB_INFO.email}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CLUB_INFO.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
TSX
echo "  + (public)/contacts/page.tsx"

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

public_layout = "apps/web/src/app/(public)/layout.tsx"

edit(public_layout, """import Header from "@features/app-shell/Header";""",
"""import Header from "@features/app-shell/Header";
import Footer from "@features/app-shell/Footer";""")

# Le layout est déjà `flex min-h-dvh flex-col` avec `main flex-1` : le footer
# se colle au bas de la fenêtre sur les pages courtes sans rien ajouter.
edit(public_layout, """      <main className="flex-1">{children}</main>
    </div>""",
"""      <main className="flex-1">{children}</main>
      <Footer />
    </div>""")
PY

echo "✓ footer, page contacts et route d'informations posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(app-shell): pied de page, page contacts et route d'informations

Le footer lit NAV_ENTRIES, la meme source que la barre et le panneau
burger : ajouter une page au site la fera apparaitre aux trois endroits
sans y penser. Les menus deroulants y sont aplatis — un footer ne se
deroule pas — et les entrees reservees aux connectes ecartees.

Composant SERVEUR : aucune interactivite, l'annee du copyright se
calcule au rendu, rien a envoyer au navigateur.

Trouve en cherchant ou brancher le footer : /contacts N'EXISTAIT PAS,
alors que la navbar et l'appel a l'action de l'accueil y renvoyaient
tous deux. La page est creee, adossee a SitePage comme L'association.

Les mentions legales passent par une route generique /infos/[slug],
elle aussi adossee a SitePage : elles se redigent au centre de controle
sans ligne de code, et s'affichent en s'annoncant vides plutot que de
rendre un 404. Le socle etait deja generique, il ne lui manquait qu'une
porte d'entree publique.

Aucune coordonnee inventee : clubInfo.ts est VIDE et chaque bloc ne
s'affiche que si sa valeur est renseignee. Un footer a fausses valeurs
a l'air fini, donc personne ne le corrige.

Responsive : une colonne sur telephone, deux sur tablette, quatre a
partir de lg ; barre du bas en colonne centree sous sm."

echo "✓ commité"
git log -1 --oneline