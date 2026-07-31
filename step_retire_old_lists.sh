#!/usr/bin/env bash
#
# step_retire_old_lists.sh
#
# Les listes `/stages` et `/events` disparaissent au profit de l'agenda.
#
# ─── Ce qui part, ce qui reste ─────────────────────────────────────────────
#
# PART   : `(public)/stages/page.tsx` et `(public)/events/page.tsx`, les deux
#          listes que l'agenda recouvre.
#
# RESTE  : `(public)/stages/[slug]/` et `(public)/events/[slug]/`, les fiches
#          de détail. C'était tout l'objet de l'argument — ce sont elles qui
#          portent les liens partageables et les aperçus sociaux, et l'agenda
#          y renvoie.
#
# ─── Rediriger plutôt que supprimer ────────────────────────────────────────
#
# Effacer les deux pages ferait répondre 404 à `/stages` et `/events`. Or ces
# adresses ont pu être envoyées par message, mises en favori, ou indexées.
# Deux redirections les mènent à l'agenda, qui contient ce qu'on y cherchait.
#
# Redirections TEMPORAIRES (307) et non permanentes (308) : un 308 est mis en
# cache durablement par les navigateurs, et resterait actif si tu rétablissais
# un jour une liste dédiée. Le coût d'un 307 est nul, celui d'un 308 qu'on
# regrette se compte en « vide ton cache ».
#
# Elles ne touchent pas aux fiches : `source: "/stages"` ne matche que le
# chemin exact, pas `/stages/mon-stage`.
#
# ─── Les entrées de navigation ─────────────────────────────────────────────
#
# Le menu « Nos activités » et les vignettes de l'accueil offraient chacun
# « Tous les stages » et « Tous les évènements ». Les deux fusionnent en une
# entrée « Agenda » : deux liens vers la même page, séparés par une
# distinction que le visiteur ne fait pas, valent moins qu'un seul.
#
# Usage :
#   bash step_retire_old_lists.sh
#   AKFC_APPLY_ONLY=1 bash step_retire_old_lists.sh
#
set -euo pipefail

stages_list="apps/web/src/app/(public)/stages/page.tsx"
events_list="apps/web/src/app/(public)/events/page.tsx"
activities_menu="apps/web/src/features/app-shell/OurActivitiesMenu.tsx"
home_page="apps/web/src/app/(public)/page.tsx"
next_config="apps/web/next.config.ts"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "async redirects" "$next_config" 2>/dev/null; then
  echo "✓ déjà appliqué (redirections posées) — rien à faire"
  exit 0
fi

for f in "$activities_menu" "$home_page" "$next_config"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

[ -f "apps/web/src/app/(public)/agenda/page.tsx" ] || {
  echo "✗ la page Agenda doit exister d'abord"; exit 1; }

# ── Les deux listes s'en vont ; les fiches [slug] restent ─────────────────
rm -f "$stages_list" "$events_list"
echo "  - (public)/stages/page.tsx"
echo "  - (public)/events/page.tsx"

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
home_page       = "apps/web/src/app/(public)/page.tsx"
next_config     = "apps/web/next.config.ts"

# ── 1/4 le menu « Nos activités » ────────────────────────────────────────
edit(activities_menu, """        {/* Accès directs aux listes publiques */}
        <ul className="border-b border-gray-400">
          <li>
            <Link
              href="/stages"
              className="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100"
            >
              Tous les stages
            </Link>
          </li>
          <li>
            <Link
              href="/events"
              className="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100"
            >
              Tous les évènements
            </Link>
          </li>
        </ul>""",
"""        {/* Accès direct à l'agenda.
            « Tous les stages » et « Tous les évènements » ont fusionné ici :
            deux liens vers la même chose, séparés par une distinction que le
            visiteur ne fait pas, valaient moins qu'un seul. */}
        <ul className="border-b border-gray-400">
          <li>
            <Link
              href="/agenda"
              className="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100"
            >
              Agenda — stages et évènements
            </Link>
          </li>
        </ul>""")

# ── 2/4 les vignettes de l'accueil ───────────────────────────────────────
edit(home_page, """    {
      href: "/stages",
      icon: Calendar,
      title: "Nos stages",
      desc: "Sessions intensives et rencontres ponctuelles.",
    },
    {
      href: "/events",
      icon: PartyPopper,
      title: "Nos évènements",
      desc: "Démonstrations, ateliers et temps forts de la vie du club.",
    },""",
"""    {
      href: "/agenda",
      icon: Calendar,
      title: "Agenda",
      desc: "Stages et évènements à venir, du plus proche au plus lointain.",
    },""")

# ── 3/4 l'icône devenue inutile ──────────────────────────────────────────
edit(home_page, """import { Award, Calendar, PartyPopper, Images, ArrowRight } from "lucide-react";""",
"""import { Award, Calendar, Images, ArrowRight } from "lucide-react";""")

# ── 4/4 les redirections (DERNIER fichier écrit : la garde le teste) ─────
edit(next_config, """const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/backend", "@workspace/contracts"],""",
"""const nextConfig: NextConfig = {
  /**
   * Les listes `/stages` et `/events` ont fusionné dans `/agenda`.
   *
   * Redirection plutôt que 404 : ces adresses ont pu être envoyées par
   * message, mises en favori ou indexées, et l'agenda contient ce qu'on y
   * cherchait.
   *
   * TEMPORAIRES (307) et non permanentes (308) : un 308 est mis en cache
   * durablement par les navigateurs et resterait actif si une liste dédiée
   * était rétablie un jour. Le coût d'un 307 est nul, celui d'un 308 qu'on
   * regrette se compte en « vide ton cache ».
   *
   * Le chemin source est EXACT : les fiches `/stages/mon-stage` ne sont pas
   * concernées, et c'est bien elles que l'agenda cible.
   */
  async redirects() {
    return [
      { source: "/stages", destination: "/agenda", permanent: false },
      { source: "/events", destination: "/agenda", permanent: false },
    ]
  },
  transpilePackages: ["@workspace/backend", "@workspace/contracts"],""")
PY

echo "✓ listes retirées, redirections et navigation à jour"

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
git commit -m "refactor(nav): les listes /stages et /events cedent la place a l'agenda

Partent : les deux pages de liste que l'agenda recouvre.
Restent : les fiches /stages/[slug] et /events/[slug], qui portent les
liens partageables et les apercus sociaux — c'etait l'objet de
l'argument, et l'agenda y renvoie.

Redirection plutot que 404 : ces adresses ont pu etre envoyees par
message, mises en favori ou indexees. TEMPORAIRES (307) et non
permanentes (308), un 308 etant mis en cache durablement par les
navigateurs et resterait actif si une liste dediee etait retablie. Le
chemin source est exact, les fiches ne sont pas concernees.

Le menu « Nos activites » et les vignettes de l'accueil offraient
chacun « Tous les stages » et « Tous les evenements » : les deux
fusionnent en une entree Agenda. Deux liens vers la meme page, separes
par une distinction que le visiteur ne fait pas, valent moins qu'un
seul."

echo "✓ commité"
git log -1 --oneline