#!/usr/bin/env bash
#
# step_home_hero_cta.sh
#
# Le bouton « Découvrir nos disciplines » s'en va : les disciplines
# s'affichent désormais en cartes juste en dessous, avec chacune son lien vers
# la présentation complète. Un bouton qui mène à une liste déjà déroulée sous
# les yeux du visiteur ne lui apprend rien.
#
# ─── « Nous contacter » reste, et ce n'est pas un oubli ────────────────────
#
# Il mène bien à la même page que l'item « Contacts » de la navbar, mais ce
# n'est pas le même genre de doublon.
#
# « Découvrir nos disciplines » pointait vers un contenu VISIBLE juste en
# dessous : le lien était redondant avec ce que la page montrait déjà.
# « Nous contacter » est un APPEL À L'ACTION : sa présence dans le corps de la
# page, à la fin d'un texte de présentation, est ce qui le rend efficace. Une
# entrée de navigation et un appel à l'action ne jouent pas le même rôle même
# quand ils mènent au même endroit — c'est pourquoi presque tous les sites ont
# les deux.
#
# L'accueil garde donc un bouton unique, ce qui le rend d'autant plus visible.
#
# Usage :
#   bash step_home_hero_cta.sh
#   AKFC_APPLY_ONLY=1 bash step_home_hero_cta.sh
#
set -euo pipefail

home_page="apps/web/src/app/(public)/page.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
# Marqueur pris dans le commentaire POSÉ par ce script, et non dans le texte
# retiré : celui-ci reste cité dans le commentaire, donc le tester ferait
# repartir le script à chaque lancement.
if grep -q "Un seul appel à l'action" "$home_page" 2>/dev/null; then
  echo "✓ déjà appliqué (bouton retiré) — rien à faire"
  exit 0
fi

[ -f "$home_page" ] || { echo "✗ introuvable : $home_page"; exit 1; }

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

home_page = "apps/web/src/app/(public)/page.tsx"

# ── le bouton redondant ───────────────────────────────────────────────────
edit(home_page, """        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/disciplines"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Découvrir nos disciplines
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-3 font-medium transition-colors hover:bg-gray-50"
          >
            Nous contacter
          </Link>
        </div>""",
"""        {/* Un seul appel à l'action. « Découvrir nos disciplines » a été
            retiré : elles s'affichent en cartes juste en dessous, chacune avec
            son lien vers la présentation complète — un bouton vers une liste
            déjà déroulée sous les yeux du visiteur ne lui apprend rien.

            « Nous contacter » reste malgré l'item « Contacts » de la navbar :
            une entrée de navigation et un appel à l'action ne jouent pas le
            même rôle, même en menant au même endroit. */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Nous contacter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>""")
PY

echo "✓ appel à l'action unique sur l'accueil"

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
git commit -m "refactor(home): un seul appel a l'action dans le hero

« Decouvrir nos disciplines » pointait vers un contenu desormais
VISIBLE juste en dessous, en cartes synthetiques ayant chacune son lien
vers la presentation complete. Un bouton vers une liste deja deroulee
sous les yeux du visiteur ne lui apprend rien.

« Nous contacter » reste malgre l'item Contacts de la navbar : ce n'est
pas le meme genre de doublon. Une entree de navigation et un appel a
l'action ne jouent pas le meme role meme en menant au meme endroit,
c'est pourquoi presque tous les sites ont les deux. L'accueil garde
donc un bouton unique, d'autant plus visible."

echo "✓ commité"
git log -1 --oneline