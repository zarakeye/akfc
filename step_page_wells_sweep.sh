#!/usr/bin/env bash
#
# step_page_wells_sweep.sh
#
# Les marges blanches, deuxième passe — les pages publiques qui avaient été
# oubliées lors de la première.
#
# ─── Ce qui a été observé, pas supposé ─────────────────────────────────────
#
# Recensement de tous les puits étroits sous `apps/web/src/app` :
#
#   profil/page.tsx        max-w-2xl (672px)  ← le symptôme signalé
#   course/[id]/page.tsx   max-w-3xl (768px)  ← rend du contenu builder
#   stages/page.tsx        max-w-4xl (896px)
#   events/page.tsx        max-w-4xl (896px)
#   gallery/page.tsx       max-w-5xl (1024px)
#
# Tous adoptent `akfc-page` : le puits réglable depuis le laboratoire (68rem
# par défaut), avec sa marge d'écran fluide. La page profil était la plus
# bridée des cinq, ce qui explique qu'elle t'ait sauté aux yeux.
#
# ─── Pourquoi la page profil n'est pas simplement élargie ──────────────────
#
# Elle porte deux natures. L'identité et les coordonnées sont du contenu de
# formulaire : étalées sur 1088px, cinq champs courts en deux colonnes
# donneraient des lignes ridicules séparées par du vide. Le builder de bio, à
# l'inverse, a besoin de toute la largeur.
#
# Le puits passe donc à `akfc-page` et la carte d'identité se borne elle-même
# à la mesure (`akfc-measure-block`, 68ch — soit à peu près la largeur
# qu'elle avait). Chacun sa laisse.
#
# ─── Ce qui n'est PAS touché, et pourquoi ──────────────────────────────────
#
#   (public)/page.tsx      — l'accueil compose délibérément des largeurs
#                            différentes (héros centré en max-w-3xl, section
#                            en max-w-5xl). Un texte court et centré DOIT
#                            être étroit : l'élargir l'abîmerait. À revoir
#                            section par section si tu le souhaites, pas au
#                            marteau.
#
#   profil/edit/page.tsx   — un formulaire de saisie. La colonne étroite y
#                            est un choix juste, pas un oubli. Seul bémol
#                            possible : le saut de largeur entre la vue et
#                            l'édition du profil. À toi de trancher, je ne
#                            l'ai pas décidé à ta place.
#
# Usage :
#   bash step_page_wells_sweep.sh
#   AKFC_APPLY_ONLY=1 bash step_page_wells_sweep.sh
#
set -euo pipefail

PROFIL="apps/web/src/app/(public)/profil/page.tsx"
COURSE="apps/web/src/app/(public)/course/[id]/page.tsx"
STAGES="apps/web/src/app/(public)/stages/page.tsx"
EVENTS="apps/web/src/app/(public)/events/page.tsx"
GALLERY="apps/web/src/app/(public)/gallery/page.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "akfc-page" "$GALLERY" 2>/dev/null; then
  echo "✓ déjà appliqué (galerie sur akfc-page) — rien à faire"
  exit 0
fi

for f in "$PROFIL" "$COURSE" "$STAGES" "$EVENTS" "$GALLERY"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "akfc-page" apps/web/src/app/globals.css || {
  echo "✗ la classe akfc-page doit exister"; exit 1; }

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.replace('apps/web/src/app/', ''))

PROFIL  = "apps/web/src/app/(public)/profil/page.tsx"
COURSE  = "apps/web/src/app/(public)/course/[id]/page.tsx"
STAGES  = "apps/web/src/app/(public)/stages/page.tsx"
EVENTS  = "apps/web/src/app/(public)/events/page.tsx"
GALLERY = "apps/web/src/app/(public)/gallery/page.tsx"

# ── Profil : état de chargement ───────────────────────────────────────────
edit(PROFIL, """    return <div className="mx-auto max-w-2xl px-4 py-12">Chargement…</div>;""",
"""    return <div className="akfc-page py-12">Chargement…</div>;""")

# ── Profil : état d'erreur ────────────────────────────────────────────────
edit(PROFIL, """      <div className="mx-auto max-w-2xl px-4 py-12 text-red-600">""",
"""      <div className="akfc-page py-12 text-red-600">""")

# ── Profil : le corps — puits large, carte d'identité bornée à la mesure ──
edit(PROFIL, """    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="scale-150">
          <UserPortrait user={displayUser} size="md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{formatUserName(displayUser)}</h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
        <Link
          href="/profil/edit?from=profil"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Pencil className="h-4 w-4" />
          Éditer
        </Link>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Prénom" value={data.firstName} />
        <Field label="Nom" value={data.lastName} />
        <Field label="Pseudo" value={data.pseudo} />
        <Field label="Téléphone" value={data.phone} />
        <Field label="Date de naissance" value={data.birthDate} />
        <div className="sm:col-span-2">
          <Field label="À propos" value={data.aboutMe} />
        </div>
      </dl>""",
"""    <div className="akfc-page py-12">
      {/* Identité et coordonnées : du contenu de formulaire, qui se lit mieux
          à la mesure. Étalés sur tout le puits, cinq champs courts en deux
          colonnes donneraient des lignes minuscules séparées par du vide. Le
          puits large existe pour le builder de bio, plus bas. */}
      <section className="akfc-measure-block">
        <div className="mb-8 flex items-center gap-4">
          <div className="scale-150">
            <UserPortrait user={displayUser} size="md" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {formatUserName(displayUser)}
            </h1>
            <p className="text-sm text-gray-500">{data.email}</p>
          </div>
          <Link
            href="/profil/edit?from=profil"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Pencil className="h-4 w-4" />
            Éditer
          </Link>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Prénom" value={data.firstName} />
          <Field label="Nom" value={data.lastName} />
          <Field label="Pseudo" value={data.pseudo} />
          <Field label="Téléphone" value={data.phone} />
          <Field label="Date de naissance" value={data.birthDate} />
          <div className="sm:col-span-2">
            <Field label="À propos" value={data.aboutMe} />
          </div>
        </dl>
      </section>""")

# ── Cours : rend du contenu builder, oublié à la première passe ───────────
edit(COURSE, """    <article className="mx-auto max-w-3xl px-6 py-12">""",
"""    <article className="akfc-page py-12">""")

# ── Listes de stages et d'événements ──────────────────────────────────────
edit(STAGES, """    <div className="mx-auto max-w-4xl px-6 py-12">""",
"""    <div className="akfc-page py-12">""")

edit(EVENTS, """    <div className="mx-auto max-w-4xl px-6 py-12">""",
"""    <div className="akfc-page py-12">""")

# ── Galerie (DERNIER fichier écrit : c'est lui que la garde teste) ────────
edit(GALLERY, """    <div className="mx-auto max-w-5xl px-4 py-12">""",
"""    <div className="akfc-page py-12">""")
PY

echo "✓ cinq pages passées sur le puits réglable"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ─────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "fix(layout): puits reglable sur les pages publiques restantes

Deuxieme passe sur les marges blanches. La premiere avait traite
discipline / stage / evenement et PresentationShell ; cinq pages
gardaient un plafond en dur, la page profil etant la plus bridee des
cinq (max-w-2xl, 672px) :

  profil          max-w-2xl -> akfc-page
  course/[id]     max-w-3xl -> akfc-page   (rend du contenu builder)
  stages (liste)  max-w-4xl -> akfc-page
  events (liste)  max-w-4xl -> akfc-page
  gallery         max-w-5xl -> akfc-page

La page profil n'est pas simplement elargie : elle porte deux natures.
L'identite et les coordonnees sont du contenu de formulaire et se
bornent desormais elles-memes a la mesure (akfc-measure-block), tandis
que le builder de bio recoit tout le puits.

Non touches a dessein : l'accueil, qui compose deliberement des
largeurs differentes (un texte court et centre doit rester etroit), et
le formulaire d'edition du profil, ou la colonne etroite est un choix
juste."

echo "✓ commité"
git log -1 --oneline