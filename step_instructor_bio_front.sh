#!/usr/bin/env bash
#
# step_instructor_bio_front.sh
#
# Incrément 1b — le front de la présentation des instructeurs.
#
#   A. sur le profil : un éditeur de bio au builder, gardé « c'est mon
#      profil », qui enregistre via `saveMyInstructorBio` ;
#   B. la page publique `/about/instructeurs` : boucle sur les titulaires
#      présentés, chaque bio cadrée dans une carte.
#
# ─── Ce qu'on réutilise, à l'identique ─────────────────────────────────────
#
# L'éditeur reprend le montage EXACT de `DisciplineForm` : `PageBuilder`
# contrôlé, `parsePageContentV1` pour lire ce qui vient de la base,
# `finderStorageAdapter` + `APP_ROOT` pour le câblage. Aucune variante — le
# builder est le même partout, c'est tout l'intérêt.
#
# Le format en base est un `Json` (`instructorBio Json?`), exactement comme
# la description de discipline (verifie : `description Json` cote Discipline).
# Donc AUCUNE conversion : ce que le builder produit est stocke tel quel et
# relu tel quel.
#
# ─── Le cadrage des bios ───────────────────────────────────────────────────
#
# Chaque bio est un contenu de builder complet : un instructeur peut y mettre
# un bloc pleine largeur, un autre un simple paragraphe. Pour que la page ne
# mélange pas deux rythmes, chaque bio est enveloppée dans un `<article>`
# `akfc-measure-block` avec en-tête (portrait + nom) et séparée de la
# suivante par l'écart entre blocs du système. Le rendu interne reste piloté
# par les variables réglées au laboratoire — une bio se lit comme le reste
# du site, dans un cadre qui l'annonce.
#
# ─── Accès ─────────────────────────────────────────────────────────────────
#
# L'éditeur n'apparaît QUE si l'utilisateur est titulaire. Le critère vit au
# backend (`isCurrentUserInstructor`, le même OR que partout) : le front ne
# le devine pas, il le demande. Un membre non enseignant ne voit pas la
# section, un titulaire la voit sur son propre profil et nulle part ailleurs.
#
# Usage :
#   bash step_instructor_bio_front.sh
#   AKFC_APPLY_ONLY=1 bash step_instructor_bio_front.sh
#
set -euo pipefail

ROUTER="packages/backend/src/modules/users/router.ts"
PROFILE="apps/web/src/app/(public)/profil/page.tsx"
EDITOR="apps/web/src/features/social/InstructorBioEditor.tsx"
PAGE="apps/web/src/app/(public)/about/instructeurs/page.tsx"

# ── Garde anti-double-application (AVANT prérequis) ────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$ROUTER" "$PROFILE"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

if [ -f "$PAGE" ]; then
  echo "✓ déjà appliqué ($PAGE existe) — rien à faire"
  exit 0
fi

grep -q "listPublicInstructors" "$ROUTER" || {
  echo "✗ step_instructor_bio_backend.sh doit être appliqué (et migré) d'abord"; exit 1; }

mkdir -p "$(dirname "$EDITOR")" "$(dirname "$PAGE")"

python3 - <<'PY'
import io, os

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

def create(path, content):
    assert not os.path.exists(path), "existe déjà : %s" % path
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(content)
    print("  + %s" % path)

ROUTER  = "packages/backend/src/modules/users/router.ts"
PROFILE = "apps/web/src/app/(public)/profil/page.tsx"
EDITOR  = "apps/web/src/features/social/InstructorBioEditor.tsx"
PAGE    = "apps/web/src/app/(public)/about/instructeurs/page.tsx"

# ── 1/5 backend : « suis-je titulaire ? » + ma bio courante ──────────────
edit(ROUTER, """  saveMyInstructorBio: protectedProcedure""",
"""  /**
   * L'utilisateur courant est-il titulaire, et quelle est sa bio ?
   *
   * Alimente l'éditeur du profil : la section n'apparaît que pour un
   * titulaire, et se pré-remplit avec ce qu'il a déjà écrit. Le critère de
   * titulaire est le MEME OR que `getInstructors` / `listPublicInstructors`.
   */
  getMyInstructorState: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        instructorBio: true,
        instructorOrder: true,
        _count: {
          select: {
            disciplinesAsInstructor: true,
            coursesAsInstructor: true,
            stagesAsPrimaryAnimator: true,
            stagesAsAnimator: true,
          },
        },
      },
    });

    const c = user?._count;
    const isInstructor = Boolean(
      c &&
        (c.disciplinesAsInstructor > 0 ||
          c.coursesAsInstructor > 0 ||
          c.stagesAsPrimaryAnimator > 0 ||
          c.stagesAsAnimator > 0),
    );

    return {
      isInstructor,
      bio: user?.instructorBio ?? null,
      order: user?.instructorOrder ?? null,
    };
  }),

  saveMyInstructorBio: protectedProcedure""")

# ── 2/5 l'éditeur (client) ───────────────────────────────────────────────
create(EDITOR, '''"use client";

import { useState, type JSX } from "react";

import { trpc } from "@trpc/trpcClient";
import { PageBuilder } from "@features/page-builder";
import {
  parsePageContentV1,
  emptyPageContentV1,
  type PageContentV1,
} from "@contracts/page";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

/**
 * Éditeur de la présentation publique d'un instructeur, sur SON profil.
 *
 * Ne s'affiche que si l'utilisateur est titulaire — la question est posée au
 * backend (`getMyInstructorState`), jamais devinée ici. La sauvegarde passe
 * par `saveMyInstructorBio`, dont la cible est l'utilisateur de session : on
 * n'edite que soi, structurellement.
 *
 * Montage du builder identique a DisciplineForm : meme composant controle,
 * meme parse, meme adapter. Le format en base est un Json, comme la
 * description de discipline — rien a convertir.
 */
export function InstructorBioEditor(): JSX.Element | null {
  const state = trpc.user.getMyInstructorState.useQuery();
  const utils = trpc.useUtils();
  const save = trpc.user.saveMyInstructorBio.useMutation({
    onSuccess: () => {
      void utils.user.getMyInstructorState.invalidate();
    },
  });

  // Le state initial du builder est pose une fois la requete resolue ; tant
  // qu'elle charge, on ne rend rien (la section est optionnelle, pas de
  // squelette a afficher).
  const [content, setContent] = useState<PageContentV1 | null>(null);

  if (state.isLoading) return null;
  // Non-titulaire : aucune section. C'est le backend qui tranche.
  if (!state.data?.isInstructor) return null;

  const current =
    content ??
    (state.data.bio
      ? parsePageContentV1(state.data.bio)
      : emptyPageContentV1());

  return (
    <section className="mt-10 rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Ma présentation d&apos;instructeur
          </h2>
          <p className="text-xs text-muted-foreground">
            Affichée sur la page publique des instructeurs. Laissez-la vide
            pour ne pas y figurer.
          </p>
        </div>
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate({ bio: current })}
          className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <PageBuilder
        value={current}
        onChange={setContent}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
      />

      {save.isSuccess && (
        <p className="mt-2 text-xs text-muted-foreground">
          Présentation enregistrée.
        </p>
      )}
      {save.isError && (
        <p className="mt-2 text-xs text-destructive">
          Échec : {save.error.message}
        </p>
      )}
    </section>
  );
}
''')

# ── 3/5 le profil monte l'éditeur ────────────────────────────────────────
edit(PROFILE, """import { UserPortrait } from \"@features/social/UserPortrait\";
import { formatUserName, type DisplayUser } from \"@features/social/userDisplay\";""",
"""import { UserPortrait } from \"@features/social/UserPortrait\";
import { formatUserName, type DisplayUser } from \"@features/social/userDisplay\";
import { InstructorBioEditor } from \"@features/social/InstructorBioEditor\";""")

edit(PROFILE, """        <div className=\"sm:col-span-2\">
          <Field label=\"À propos\" value={data.aboutMe} />
        </div>
      </dl>
    </div>
  );
}""",
"""        <div className=\"sm:col-span-2\">
          <Field label=\"À propos\" value={data.aboutMe} />
        </div>
      </dl>

      {/* Ne s'affiche que pour un instructeur titulaire (le composant se
          rend `null` sinon, sur décision du backend). */}
      <InstructorBioEditor />
    </div>
  );
}""")

# ── 4/5 la page publique (Server Component) ──────────────────────────────
create(PAGE, '''import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName, type DisplayUser } from "@features/social/userDisplay";

/**
 * /about/instructeurs — les instructeurs TITULAIRES qui se sont présentés.
 *
 * Lecture directe de Prisma (Server Component) : on n'interroge pas sa
 * propre base par HTTP. Le critère est celui de `listPublicInstructors` —
 * rattachement a un enseignement ET bio non nulle — repris ici pour rester
 * un seul rendu serveur sans aller-retour tRPC.
 */
export default async function InstructeursPage(): Promise<JSX.Element> {
  const instructors = await prisma.user.findMany({
    where: {
      AND: [
        { instructorBio: { not: Prisma.DbNull } },
        {
          OR: [
            { disciplinesAsInstructor: { some: {} } },
            { coursesAsInstructor: { some: {} } },
            { stagesAsPrimaryAnimator: { some: {} } },
            { stagesAsAnimator: { some: {} } },
          ],
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pseudo: true,
      email: true,
      avatar: true,
      instructorBio: true,
    },
    orderBy: [
      { instructorOrder: { sort: "asc", nulls: "last" } },
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">Nos instructeurs</h1>

      {instructors.length === 0 ? (
        <p className="text-muted-foreground">
          Aucune présentation d&apos;instructeur pour le moment.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: "var(--akfc-block-gap)" }}>
          {instructors.map((instructor) => {
            const displayUser: DisplayUser = {
              id: instructor.id,
              firstName: instructor.firstName,
              lastName: instructor.lastName,
              pseudo: instructor.pseudo,
              email: instructor.email,
              avatar: instructor.avatar,
              image: null,
            };

            return (
              // `akfc-measure-block` cadre chaque bio a la meme largeur de
              // lecture, quel que soit le contenu que l'instructeur y a mis.
              // La carte l'annonce (portrait + nom) et la separe de la
              // suivante par l'ecart entre blocs du systeme.
              <article
                key={instructor.id}
                className="akfc-measure-block rounded-lg border border-border p-6"
              >
                <header className="mb-4 flex items-center gap-3">
                  <div className="scale-125">
                    <UserPortrait user={displayUser} size="md" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {formatUserName(displayUser)}
                  </h2>
                </header>

                <PageRenderer content={parsePageContentV1(instructor.instructorBio)} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
''')

# ── 5/5 l'import Prisma dans la page (DERNIER fichier ecrit) ──────────────
edit(PAGE, """import { prisma } from \"@backend/prisma\";""",
"""import { Prisma } from \"@prisma/client\";

import { prisma } from \"@backend/prisma\";""")
PY

echo "✓ backend, éditeur, profil et page posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(instructors): edition de la bio sur le profil et page publique

getMyInstructorState : dit si l'utilisateur courant est titulaire et
rend sa bio. L'editeur sur le profil ne s'affiche que pour un
titulaire (decision backend, pas devinee au front) et reprend le
montage exact de DisciplineForm -- PageBuilder controle, parse,
adapter identiques.

/about/instructeurs boucle sur les titulaires presentes et cadre
chaque bio dans une carte akfc-measure-block, rendue par PageRenderer.
Le format en base est un Json comme la description de discipline :
aucune conversion."

echo "✓ commité"
git log -1 --oneline