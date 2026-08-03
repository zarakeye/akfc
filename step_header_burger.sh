#!/usr/bin/env bash
#
# step_header_burger.sh
#
# Premier pas du chantier responsive : le Header.
#
# ─── Le problème n'est pas que la navbar déborde ───────────────────────────
#
# Il est plus grave : TOUS les menus déroulants du Header s'ouvrent au SURVOL
# (`onMouseEnter` / `onMouseLeave`). Sur un écran tactile, il n'y a pas de
# survol. Le premier appui déclenche un survol simulé, le suivant navigue —
# comportement variable selon les navigateurs, et souvent le menu se referme
# avant qu'on ait pu viser une entrée.
#
# Autrement dit, « Nos activités », « Qui sommes-nous ? » et « Documentation »
# sont aujourd'hui inaccessibles au doigt, même si on arrivait à les faire
# tenir à l'écran. Le burger ne règle pas seulement un problème de place : il
# remplace le survol par l'appui, seul geste dont dispose un téléphone.
#
# ─── Logo à gauche, burger à droite ────────────────────────────────────────
#
# Trois raisons, dans l'ordre de poids :
#
#   1. C'est la convention. Un visiteur cherche le burger en haut à droite
#      sans y penser ; l'inverser lui coûte une demi-seconde de recherche à
#      chaque visite, pour aucun gain.
#   2. Le logo reste à la même place qu'en desktop, donc rien ne saute au
#      franchissement du seuil.
#   3. La main droite tient le téléphone dans la majorité des cas, et le
#      pouce couvre mieux la moitié droite.
#
# ─── Une seule source pour deux rendus ─────────────────────────────────────
#
# La structure de navigation passe dans `navEntries.ts`, et les DEUX rendus —
# barre desktop et panneau mobile — la consomment. Écrire la liste des liens
# deux fois garantirait qu'on en ajoute un d'un côté seulement ; on l'a assez
# vu cette semaine.
#
# ─── Un changement visible que je signale ──────────────────────────────────
#
# L'état actif des items était incohérent : `text-[40px]` pour « Accueil »,
# `text-[20px]` pour « Galeries » et « Agenda », la classe inexistante
# `active` pour « Contacts ». Les trois deviennent gras + souligné, à taille
# constante.
#
# Ce n'est pas de la cosmétique gratuite : un item qui grossit à 40px pousse
# ses voisins et casse une barre déjà serrée, et rendait le panneau mobile
# ingérable.
#
# ─── Ce que le panneau contient ────────────────────────────────────────────
#
# Toute la navigation, plus le bloc d'authentification : le formulaire de
# connexion ne tient pas dans une barre de téléphone. La cloche de
# notifications, elle, RESTE visible à côté du burger — son intérêt est
# d'être vue sans qu'on la cherche ; l'enfermer dans un panneau la viderait
# de son sens.
#
# Le panneau se ferme à l'appui sur la croix, sur le fond, à la touche Échap,
# et automatiquement au changement de page. Le défilement de la page est
# bloqué pendant qu'il est ouvert, sans quoi le fond glisse sous les doigts.
#
# Usage :
#   bash step_header_burger.sh
#   AKFC_APPLY_ONLY=1 bash step_header_burger.sh
#
set -euo pipefail

nav_entries="apps/web/src/features/app-shell/navEntries.ts"
header_file="apps/web/src/features/app-shell/Header.tsx"
activities_menu="apps/web/src/features/app-shell/OurActivitiesMenu.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q 'variant' "$activities_menu" 2>/dev/null; then
  echo "✓ déjà appliqué (menu Nos activités à variantes) — rien à faire"
  exit 0
fi

for f in "$header_file" "$activities_menu"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ─────────────────────────────────────────────────────────────────────────
#  1 — La structure de navigation, source unique
# ─────────────────────────────────────────────────────────────────────────

cat > "$nav_entries" <<'TS'
/**
 * Structure de la navigation publique.
 *
 * Consommée par les DEUX rendus du Header : la barre horizontale (à partir
 * de `lg`) et le panneau du menu burger (en dessous). Écrire la liste des
 * liens deux fois garantirait qu'on en ajoute un d'un seul côté.
 *
 * `activities` est une entrée à part parce que « Nos activités » n'est pas
 * une liste figée : il se construit sur les familles et disciplines chargées
 * depuis la base. C'est un composant, pas des données.
 */
export type NavEntry =
  | {
      kind: "link";
      href: string;
      label: string;
      /** Réservé aux personnes connectées. */
      requiresUser?: boolean;
    }
  | {
      kind: "menu";
      label: string;
      /**
       * Préfixe d'URL marquant le menu comme actif (`/about` rend actif
       * `/about/instructeurs`).
       */
      activePrefix: string;
      children: { href: string; label: string }[];
    }
  | { kind: "activities" };

export const NAV_ENTRIES: NavEntry[] = [
  { kind: "link", href: "/", label: "Accueil" },
  { kind: "link", href: "/dashboard", label: "Dashboard", requiresUser: true },
  { kind: "activities" },
  { kind: "link", href: "/gallery", label: "Galeries" },
  { kind: "link", href: "/agenda", label: "Agenda" },
  {
    kind: "menu",
    label: "Qui sommes-nous ?",
    activePrefix: "/about",
    children: [
      { href: "/about", label: "L'association" },
      { href: "/about/instructeurs", label: "Nos instructeurs" },
    ],
  },
  { kind: "link", href: "/contacts", label: "Contacts" },
  {
    kind: "menu",
    label: "Documentation",
    activePrefix: "/docs",
    children: [
      { href: "/docs", label: "Doc utilisateur" },
      { href: "/docs/admin", label: "Doc admin" },
      { href: "/docs/dev", label: "Dev doc" },
    ],
  },
];

/**
 * Halo emerald au survol, commun à tous les items de la barre.
 */
export const NAV_GLOW =
  "text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]";

/**
 * État actif d'un item.
 *
 * Gras + souligné, à TAILLE CONSTANTE. L'ancien `text-[40px]` sur « Accueil »
 * poussait ses voisins et cassait une barre déjà serrée ; en panneau mobile,
 * il devenait ingérable.
 */
export const NAV_ACTIVE = "font-bold underline underline-offset-4";
TS
echo "  + navEntries.ts"

# ─────────────────────────────────────────────────────────────────────────
#  2 — Le Header
# ─────────────────────────────────────────────────────────────────────────

cat > "$header_file" <<'TSX'
'use client';

import Link from "next/link";
import LoginForm from "@features/auth/components/LoginForm";
import UserMenu from "@features/app-shell/UserMenu";
import { NotificationBell } from "@features/app-shell/NotificationBell";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@lib/stores/useSessionStore";
import OurActivitiesMenu from "@features/app-shell/OurActivitiesMenu";
import {
  NAV_ACTIVE,
  NAV_ENTRIES,
  NAV_GLOW,
  type NavEntry,
} from "@features/app-shell/navEntries";

/**
 * En-tête de l'application, en deux rendus alimentés par la MÊME source
 * (`NAV_ENTRIES`) :
 *
 *   - à partir de `lg`, la barre horizontale habituelle ;
 *   - en dessous, un bouton burger ouvrant un panneau plein écran.
 *
 * Le burger ne règle pas qu'un problème de place. Les menus déroulants de la
 * barre s'ouvrent au SURVOL, geste qui n'existe pas sur un écran tactile :
 * « Nos activités », « Qui sommes-nous ? » et « Documentation » y étaient
 * inaccessibles. Le panneau les ouvre à l'APPUI.
 *
 * Logo à gauche, burger à droite : c'est la convention, le logo garde sa
 * place du desktop, et le pouce couvre mieux la moitié droite de l'écran.
 */
export default function Header() {
  const user = useSessionStore(state => state.session?.user);
  const pathname = usePathname();

  // Menu déroulant ouvert dans la BARRE (survol) et dans le PANNEAU (appui).
  // Deux états distincts : les deux rendus coexistent dans l'arbre, et un
  // état commun ferait s'ouvrir l'un en manipulant l'autre.
  const [barMenu, setBarMenu] = useState<string | null>(null);
  const [panelMenu, setPanelMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fermeture au changement de page : sans cela, le panneau resterait ouvert
  // par-dessus la page qu'on vient de demander.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Échap ferme, et le défilement de la page est bloqué tant que le panneau
  // est ouvert — sinon le fond glisse sous les doigts pendant qu'on parcourt
  // le menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const visible = NAV_ENTRIES.filter(
    (entry) => entry.kind !== "link" || !entry.requiresUser || Boolean(user),
  );

  const isActive = (entry: NavEntry): boolean => {
    if (entry.kind === "link") return pathname === entry.href;
    if (entry.kind === "menu") return pathname.startsWith(entry.activePrefix);
    return false;
  };

  return (
    <header className="flex items-center justify-between bg-black shadow-md">
      {/* Logo — rembourrage et taille réduits sous `lg`, où l'ancien
          `px-20 py-10` mangeait presque toute la largeur d'un téléphone. */}
      <Link href="/">
        <div className="flex items-center px-4 py-4 lg:px-20 lg:py-10">
          <Image
            src="/AKFC_logo.svg"
            alt="AKFC logo"
            width={100}
            height={100}
            priority
            className="h-12 w-auto lg:h-25"
          />
        </div>
      </Link>

      {/* ── Barre horizontale (≥ lg) ──────────────────────────────────── */}
      <nav className="hidden w-[60%] items-center justify-center gap-4 lg:flex">
        {visible.map((entry) => {
          if (entry.kind === "activities") {
            return <OurActivitiesMenu key="activities" />;
          }

          if (entry.kind === "link") {
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={`${NAV_GLOW} text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`}
              >
                {entry.label}
              </Link>
            );
          }

          return (
            <div
              key={entry.label}
              onMouseEnter={() => setBarMenu(entry.label)}
              onMouseLeave={() => setBarMenu(null)}
              className={`relative flex items-center text-[20px] ${NAV_GLOW} ${isActive(entry) ? NAV_ACTIVE : ""}`}
            >
              <span className="whitespace-nowrap">{entry.label}</span>
              <Image
                src="/chevron-white.svg"
                alt=""
                aria-hidden="true"
                width={30}
                height={30}
                className={`transition-transform duration-300 ${barMenu === entry.label ? "rotate-180" : ""}`}
              />
              <div
                className={`${barMenu === entry.label ? "block" : "hidden"} absolute left-1/2 top-full z-20 w-44 -translate-x-1/2 transform rounded border-4 bg-gray-300 opacity-90 shadow-md transition-opacity duration-300 hover:opacity-100`}
              >
                {entry.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Authentification (≥ lg) ───────────────────────────────────── */}
      <div className="hidden lg:block">
        <Suspense fallback={<div>Chargement...</div>}>
          {user
            ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <UserMenu />
              </div>
            )
            : <LoginForm />
          }
        </Suspense>
      </div>

      {/* ── Cloche + burger (< lg) ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 lg:hidden">
        {/* La cloche RESTE visible : son intérêt est d'être vue sans qu'on la
            cherche. L'enfermer dans le panneau la viderait de son sens. */}
        {user && (
          <Suspense fallback={null}>
            <NotificationBell />
          </Suspense>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="p-2 text-white"
        >
          <Menu className="h-7 w-7" />
        </button>
      </div>

      {/* ── Panneau (< lg) ────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fond : ferme à l'appui, et masque la page pour que l'œil ne
              cherche pas à lire au travers. */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative flex h-full flex-col overflow-y-auto bg-black px-6 pb-10">
            <div className="flex items-center justify-between py-4">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="p-2 text-white"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {visible.map((entry) => {
                if (entry.kind === "activities") {
                  return <OurActivitiesMenu key="activities" variant="panel" />;
                }

                if (entry.kind === "link") {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={`block py-3 text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`}
                    >
                      {entry.label}
                    </Link>
                  );
                }

                const expanded = panelMenu === entry.label;
                return (
                  <div key={entry.label} className="flex flex-col">
                    {/* Déroulé à l'APPUI et non au survol : c'est tout
                        l'objet du panneau. */}
                    <button
                      type="button"
                      onClick={() => setPanelMenu(expanded ? null : entry.label)}
                      aria-expanded={expanded}
                      className={`flex items-center justify-between py-3 text-left text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`}
                    >
                      <span>{entry.label}</span>
                      <Image
                        src="/chevron-white.svg"
                        alt=""
                        aria-hidden="true"
                        width={26}
                        height={26}
                        className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded && (
                      <div className="flex flex-col border-l border-gray-700 pl-4">
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-2 text-white/80"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Authentification en pied de panneau : le formulaire de
                connexion ne tient pas dans une barre de téléphone. */}
            <div className="mt-6 border-t border-gray-700 pt-6">
              <Suspense fallback={<div className="text-white">Chargement...</div>}>
                {user ? <UserMenu /> : <LoginForm />}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
TSX
echo "  ~ Header.tsx (réécrit sur navEntries)"

# ─────────────────────────────────────────────────────────────────────────
#  3 — « Nos activités » gagne sa variante panneau
# ─────────────────────────────────────────────────────────────────────────

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

activities_menu = "apps/web/src/features/app-shell/OurActivitiesMenu.tsx"

edit(activities_menu,
"""export default function OurActivitiesMenu(): JSX.Element {""",
"""export default function OurActivitiesMenu({
  variant = "bar",
}: {
  /**
   * `bar` : déroulé au SURVOL, pour la barre horizontale du desktop.
   * `panel` : déroulé à l'APPUI, pour le panneau du menu burger — un écran
   * tactile n'a pas de survol, et ce menu y était donc inatteignable.
   */
  variant?: "bar" | "panel";
} = {}): JSX.Element {""")

edit(activities_menu,
"""  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}""",
"""  // ─── Variante panneau ───────────────────────────────────────────────
  // Même contenu, déroulé à l'appui et posé dans le flux plutôt qu'en
  // superposition : dans un panneau qui défile déjà, un sous-menu absolu
  // sortirait de l'écran.
  if (variant === "panel") {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setHover(!hover)}
          aria-expanded={hover}
          className="flex items-center justify-between py-3 text-left text-lg text-white"
        >
          <span>Nos activités</span>
          <Image
            src="/chevron-white.svg"
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            className={`transition-transform duration-300 ${hover ? "rotate-180" : ""}`}
          />
        </button>

        {hover && (
          <div className="flex flex-col border-l border-gray-700 pl-4">
            <Link href="/agenda" className="block py-2 text-white/80">
              Agenda — stages et évènements
            </Link>
            {groups.map((family) => (
              <div key={family.id} className="mt-2">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  {family.name}
                </p>
                {family.disciplines.map((d) => (
                  <Link
                    key={d.id}
                    href={`/disciplines/${d.slug}`}
                    className="block py-2 text-white/80"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}""")
PY

echo "✓ header responsive posé"

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
git commit -m "feat(responsive): menu burger et Header pilote par une source unique

Premier pas du chantier responsive.

Le probleme n'etait pas que la navbar deborde : TOUS ses menus
deroulants s'ouvrent au SURVOL, geste qui n'existe pas sur un ecran
tactile. « Nos activites », « Qui sommes-nous ? » et « Documentation »
y etaient inaccessibles au doigt. Le burger remplace le survol par
l'appui.

Logo a gauche, burger a droite : c'est la convention, le logo garde sa
place du desktop donc rien ne saute au franchissement du seuil, et le
pouce couvre mieux la moitie droite.

La structure de navigation passe dans navEntries.ts, consommee par les
DEUX rendus. Ecrire la liste deux fois garantirait qu'on ajoute un lien
d'un seul cote.

Changement visible assume : l'etat actif etait incoherent —
text-[40px] pour Accueil, text-[20px] pour Galeries et Agenda, la
classe inexistante `active` pour Contacts. Les trois deviennent gras +
souligne a taille constante. Un item qui grossit a 40px pousse ses
voisins et rendait le panneau mobile ingerable.

Le panneau contient toute la navigation et le bloc d'authentification —
le formulaire de connexion ne tient pas dans une barre de telephone. La
cloche de notifications reste visible a cote du burger : son interet
est d'etre vue sans qu'on la cherche.

Fermeture a la croix, au fond, a Echap et au changement de page ;
defilement de la page bloque pendant l'ouverture."

echo "✓ commité"
git log -1 --oneline