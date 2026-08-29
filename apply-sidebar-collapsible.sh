#!/usr/bin/env bash
#
# AKFC — ControlPanelSidebar v2 : sections pliables + surbrillance ligne COMPLÈTE.
#
# Sur la v1 (regroupement + surbrillance) :
#   1. La ligne active inverse AUSSI le bouton « + » : l'icône add_circle.svg
#      (blanche) devient invisible sur fond blanc → on lui applique `invert`
#      quand la ligne est active (blanc → noir, visible).
#   2. Sections PLIABLES/DÉPLIABLES avec chevron. État persistant (localStorage) ;
#      la section contenant la route courante s'ouvre toujours (l'item actif
#      n'est jamais caché).
#
# Réécriture complète (cat >). 1 fichier front, typecheck web.
#
# Usage : bash apply-sidebar-collapsible.sh
#         AKFC_APPLY_ONLY=1 bash apply-sidebar-collapsible.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

if grep -q 'cp-sidebar-collapsed' "$F" 2>/dev/null; then
  echo "déjà en v2 (sections pliables)"; exit 0
fi

cat > "$F" <<'TSX'
"use client";

import { JSX, useEffect, useState } from "react";
import { useSessionStore } from "@lib/stores/useSessionStore";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "@trpc/trpcClient";
import { PAGE_REGISTRY } from "@/config/pageRegistry";

/**
 * Barre latérale du centre de contrôle (admin).
 *
 * Items regroupés par thèmes (voir `SECTIONS`), sections pliables/dépliables
 * (état persistant en localStorage ; la section de la route courante reste
 * ouverte). L'item courant est surligné PLEINE LIGNE en couleurs inversées,
 * bouton « + » compris.
 */

type NavItem = {
  label: string;
  href: string;
  createHref?: string;
  createAlt?: string;
  badge?: number;
};

type NavSection = { title: string; items: NavItem[] };

const GLOW =
  "transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]";

const COLLAPSE_KEY = "cp-sidebar-collapsed";

export default function ControlPanelSidebar(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const role = useSessionStore((state) => state.session?.user?.role);
  const isAdmin = role?.name === "ADMIN";

  const pageVis = trpc.pageVisibility.all.useQuery(undefined, {
    enabled: isAdmin,
  });
  const editorialDraftCount = PAGE_REGISTRY.filter(
    (pg) => !(pageVis.data ?? []).some((v) => v.key === pg.key && v.published),
  ).length;

  // Sections repliées (par titre). Persistant, chargé après montage pour éviter
  // tout décalage d'hydratation.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      if (raw) setCollapsed(new Set<string>(JSON.parse(raw) as string[]));
    } catch {
      /* localStorage indisponible : on reste tout déplié. */
    }
  }, []);

  const toggle = (title: string): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      try {
        localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...next]));
      } catch {
        /* pas de persistance : sans conséquence fonctionnelle. */
      }
      return next;
    });
  };

  if (!isAdmin) {
    return <aside className="w-60 bg-gray-800 text-white p-5"></aside>;
  }

  const SECTIONS: NavSection[] = [
    {
      title: "Membres & accès",
      items: [
        { label: "Utilisateurs", href: "/dashboard/users", createHref: "/dashboard/users/create", createAlt: "Ajouter un utilisateur" },
        { label: "Rôles", href: "/dashboard/roles", createHref: "/dashboard/roles/create", createAlt: "Créer un nouveau rôle" },
        { label: "Permissions", href: "/dashboard/permissions", createHref: "/dashboard/permissions/create", createAlt: "Créer une permission" },
        { label: "Groupes de membres", href: "/dashboard/groups", createHref: "/dashboard/groups/create", createAlt: "Créer un groupe de membres" },
      ],
    },
    {
      title: "Catalogue des activités",
      items: [
        { label: "Familles", href: "/dashboard/discipline-families", createHref: "/dashboard/discipline-families/create", createAlt: "Créer une famille de disciplines" },
        { label: "Disciplines", href: "/dashboard/disciplines", createHref: "/dashboard/disciplines/create", createAlt: "Créer une discipline" },
        { label: "Catégories d'activités", href: "/dashboard/categories", createHref: "/dashboard/categories/create", createAlt: "Créer un type d'activité" },
        { label: "Origines", href: "/dashboard/origins", createHref: "/dashboard/origins/create", createAlt: "Créer une origine culturelle" },
      ],
    },
    {
      title: "Programme",
      items: [
        { label: "Cours", href: "/dashboard/courses", createHref: "/dashboard/courses/create", createAlt: "Créer un cours" },
        { label: "Stages", href: "/dashboard/stages", createHref: "/dashboard/stages/create", createAlt: "Créer un nouveau stage" },
        { label: "Évènements", href: "/dashboard/events", createHref: "/dashboard/events/create", createAlt: "Créer un nouvel évènement" },
      ],
    },
    {
      title: "Éditorial & pages",
      items: [
        { label: "Pages éditoriales", href: "/dashboard/pages", badge: editorialDraftCount },
        { label: "Posts", href: "/dashboard/posts", createHref: "/dashboard/posts/create", createAlt: "Créer un post" },
        { label: "Actualités", href: "/dashboard/breaking-news", createHref: "/dashboard/breaking-news/create", createAlt: "Créer une actualité" },
      ],
    },
    {
      title: "Médiathèque",
      items: [
        { label: "Bibliothèque", href: "/dashboard/library", createHref: "/dashboard/library/add", createAlt: "Ajouter une image ou une vidéo" },
        { label: "Galeries", href: "/dashboard/galleries", createHref: "/dashboard/galleries/create", createAlt: "Créer une galerie" },
      ],
    },
    {
      title: "Configuration & outils",
      items: [
        { label: "Réglages du site", href: "/dashboard/settings" },
        { label: "Laboratoire de rendu", href: "/dashboard/design-lab" },
        { label: "Doc admin", href: "/docs/admin" },
        { label: "Dev doc", href: "/docs/dev" },
      ],
    },
  ];

  const isActive = (href: string): boolean =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  return (
    <aside className="w-60 bg-gray-800 text-white p-5 h-full overflow-y-auto">
      <h2 className="font-bold text-lg mb-4">Centre de contrôle</h2>

      <nav className="space-y-4">
        {SECTIONS.map((section) => {
          const hasActive = section.items.some((it) => isActive(it.href));
          const open = hasActive || !collapsed.has(section.title);
          return (
            <div key={section.title}>
              <button
                onClick={() => toggle(section.title)}
                className="mb-1 flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-200"
              >
                <span>{section.title}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-3 w-3 shrink-0 transition-transform ${
                    open ? "rotate-90" : ""
                  }`}
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              {open && (
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <div
                          className={`flex items-stretch rounded ${
                            active ? "bg-white text-gray-900" : ""
                          }`}
                        >
                          <button
                            className={`w-full py-1 pl-2 text-left cursor-pointer ${GLOW}`}
                            onClick={() => router.push(item.href)}
                          >
                            {item.label}
                            {typeof item.badge === "number" && item.badge > 0 ? (
                              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                                {item.badge}
                              </span>
                            ) : null}
                          </button>
                          {item.createHref ? (
                            <button
                              className={`flex w-9 shrink-0 cursor-pointer items-center justify-center ${GLOW}`}
                              onClick={() => {
                                if (item.createHref) router.push(item.createHref);
                              }}
                            >
                              <Image
                                src="/add_circle.svg"
                                alt={item.createAlt ?? "Ajouter"}
                                width={16}
                                height={16}
                                className={active ? "invert" : undefined}
                              />
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        <button
          className="w-full text-center mt-2 cursor-pointer"
          onClick={() => router.push("/profil")}
        >
          Mon profil
        </button>
      </nav>
    </aside>
  );
}
TSX
echo "réécrit  $F"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(dashboard): sections pliables (chevron, persistant) + surbrillance ligne complète (icône + incluse)" \
  && echo "commit $(git rev-parse --short HEAD)"